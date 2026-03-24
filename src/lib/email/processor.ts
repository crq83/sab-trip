import slugify from 'slugify';
import sharp from 'sharp';
import { uploadToR2 } from '@/lib/r2/client';
import { extractExif } from '@/lib/email/exif';
import { createServiceClient } from '@/lib/supabase/server';

interface CloudmailinAttachment {
  file_name: string;
  content_type: string;
  content: string; // base64
  size: number;
}

interface CloudmailinPayload {
  headers: Record<string, string>;
  envelope: { from: string; to?: string };
  plain?: string;
  html?: string;
  attachments?: CloudmailinAttachment[];
}

// Parse "📍 Valdez, AK" or "Location: Girdwood AK" from email body.
// Returns the matched line and the query string for geocoding.
function parseLocationFromBody(body: string): { tag: string; query: string } | null {
  const match = body.match(/^📍\s*(.+)$/mu) || body.match(/^[Ll]ocation:\s*(.+)$/mu);
  if (!match) return null;
  return { tag: match[0], query: match[1].trim() };
}

// Geocode a place name via Nominatim (OpenStreetMap, free, no API key needed).
async function geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'sab-trip-travel-blog/1.0' },
    });
    if (!res.ok) return null;
    const results = await res.json();
    if (!results[0]) {
      console.log(`[geo] No geocode result for: "${query}"`);
      return null;
    }
    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);
    console.log(`[geo] "${query}" → ${lat}, ${lng}`);
    return { lat, lng };
  } catch (err) {
    console.warn('[geo] Nominatim error:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true }).slice(0, 80);
}

async function ensureUniqueSlug(
  supabase: ReturnType<typeof createServiceClient>,
  base: string
): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const { data } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();
    if (!data) return slug;
    attempt++;
    slug = `${base}-${Date.now().toString(36)}`;
    if (attempt > 5) return `${base}-${Date.now()}`;
  }
}

async function convertToJpegIfNeeded(
  buffer: Buffer,
  contentType: string
): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
  if (contentType === 'image/heic' || contentType === 'image/heif') {
    const converted = await sharp(buffer).jpeg({ quality: 90 }).toBuffer() as Buffer;
    return { buffer: converted, contentType: 'image/jpeg', fileName: 'photo.jpg' };
  }
  return { buffer, contentType, fileName: '' };
}

export async function processInboundEmail(payload: CloudmailinPayload) {
  const supabase = createServiceClient();

  const sender =
    payload.envelope?.from ||
    payload.headers?.['From'] ||
    payload.headers?.['from'] ||
    '';
  const subject =
    payload.headers?.['Subject'] ||
    payload.headers?.['subject'] ||
    `Travel Update – ${new Date().toLocaleDateString()}`;
  const bodyText = payload.plain || '';
  const messageId =
    payload.headers?.['Message-ID'] ||
    payload.headers?.['message-id'] ||
    `${Date.now()}-${Math.random()}`;

  // Sender whitelist
  const allowedSenders = (process.env.ALLOWED_SENDERS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase());
  if (allowedSenders.length > 0 && !allowedSenders.includes(sender.toLowerCase())) {
    console.log(`[email] Rejected sender: ${sender}`);
    return { ok: false, reason: 'unauthorized sender' };
  }

  // Idempotency check
  const { data: existing } = await supabase
    .from('posts')
    .select('id')
    .eq('email_message_id', messageId)
    .single();
  if (existing) {
    console.log(`[email] Already processed: ${messageId}`);
    return { ok: true, reason: 'already processed' };
  }

  // Parse location tag from body ("📍 Valdez, AK" or "Location: Girdwood AK")
  // and strip it from the displayed body text.
  let cleanBody = bodyText;
  let postLat: number | null = null;
  let postLng: number | null = null;
  let locationName: string | null = null;

  const locationTag = parseLocationFromBody(bodyText);
  if (locationTag) {
    cleanBody = bodyText.replace(locationTag.tag, '').replace(/\n{3,}/g, '\n\n').trim();
    locationName = locationTag.query;
    console.log(`[email] Location tag found: "${locationTag.query}"`);
    const geocoded = await geocodeLocation(locationTag.query);
    if (geocoded) {
      postLat = geocoded.lat;
      postLng = geocoded.lng;
    }
  }

  // Process attachments
  const attachments = payload.attachments || [];
  type UploadedMedia = {
    r2Key: string;
    r2Url: string;
    mediaType: 'image' | 'video';
    mimeType: string;
    fileName: string;
    fileSize: number;
    exifLat: number | null;
    exifLng: number | null;
    exifTakenAt: Date | null;
  };
  const uploadedMedia: UploadedMedia[] = [];
  let postDate: Date | null = null;

  for (const attachment of attachments) {
    const rawBuffer = Buffer.from(attachment.content, 'base64') as Buffer;
    const isImage = attachment.content_type.startsWith('image/');
    const isVideo = attachment.content_type.startsWith('video/');

    if (!isImage && !isVideo) continue;

    let finalBuffer: Buffer = rawBuffer;
    let finalContentType = attachment.content_type;
    let finalFileName = attachment.file_name;

    // Convert HEIC to JPEG
    if (isImage) {
      const converted = await convertToJpegIfNeeded(rawBuffer, attachment.content_type);
      finalBuffer = converted.buffer;
      finalContentType = converted.contentType;
      if (converted.fileName) finalFileName = converted.fileName;
    }

    // Extract EXIF before upload
    let exifLat: number | null = null;
    let exifLng: number | null = null;
    let exifTakenAt: Date | null = null;
    if (isImage) {
      const exif = extractExif(rawBuffer); // use original buffer for EXIF
      exifLat = exif.lat;
      exifLng = exif.lng;
      exifTakenAt = exif.takenAt;
      // Use EXIF GPS only if no body location tag was found
      if (exifLat && exifLng && postLat === null) {
        postLat = exifLat;
        postLng = exifLng;
      }
      if (exifTakenAt && postDate === null) {
        postDate = exifTakenAt;
      }
    }

    const { r2Key, r2Url } = await uploadToR2(finalBuffer, finalFileName, finalContentType);
    uploadedMedia.push({
      r2Key,
      r2Url,
      mediaType: isImage ? 'image' : 'video',
      mimeType: finalContentType,
      fileName: finalFileName,
      fileSize: finalBuffer.length,
      exifLat,
      exifLng,
      exifTakenAt,
    });
  }

  // Generate unique slug
  const baseSlug = generateSlug(subject) || `post-${Date.now().toString(36)}`;
  const slug = await ensureUniqueSlug(supabase, baseSlug);

  // Insert post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      title: subject,
      slug,
      body: cleanBody,
      status: 'published',
      lat: postLat,
      lng: postLng,
      location_name: locationName,
      email_message_id: messageId,
      email_from: sender,
      post_date: (postDate ?? new Date()).toISOString(),
    })
    .select()
    .single();

  if (postError || !post) {
    console.error('[email] Failed to insert post:', postError);
    return { ok: false, reason: 'db insert failed' };
  }

  // Insert media rows
  for (const [index, media] of uploadedMedia.entries()) {
    await supabase.from('media').insert({
      post_id: post.id,
      r2_key: media.r2Key,
      r2_url: media.r2Url,
      media_type: media.mediaType,
      mime_type: media.mimeType,
      file_name: media.fileName,
      file_size_bytes: media.fileSize,
      exif_lat: media.exifLat,
      exif_lng: media.exifLng,
      exif_taken_at: media.exifTakenAt?.toISOString() ?? null,
      sort_order: index,
    });
  }

  // Trigger ISR revalidation
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': process.env.REVALIDATE_SECRET || '',
      },
      body: JSON.stringify({ paths: ['/', '/blog', '/map', '/gallery'] }),
    });
  } catch (e) {
    console.warn('[email] Revalidation failed (non-critical):', e);
  }

  console.log(`[email] Created post "${subject}" (${uploadedMedia.length} media items)`);
  return { ok: true, postId: post.id, slug: post.slug };
}
