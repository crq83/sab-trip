import slugify from 'slugify';
import sharp from 'sharp';
import { uploadToR2 } from '@/lib/r2/client';
import { extractExif } from '@/lib/email/exif';
import { createServiceClient } from '@/lib/supabase/server';
import { geocodeLocation } from '@/lib/geocoding';

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
    const converted = await sharp(buffer)
      .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer() as Buffer;
    return { buffer: converted, contentType: 'image/jpeg', fileName: 'photo.jpg' };
  }
  if (contentType === 'image/jpeg' || contentType === 'image/jpg' || contentType === 'image/png') {
    const converted = await sharp(buffer)
      .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer() as Buffer;
    return { buffer: converted, contentType: 'image/jpeg', fileName: '' };
  }
  return { buffer, contentType, fileName: '' };
}

/**
 * Parse the email Date header and return the sender's LOCAL wall-clock time
 * stored as a UTC Date (i.e., the timezone offset is stripped, not applied).
 *
 * The site stores times as "local time pretending to be UTC" so they render
 * correctly with the existing UTC display code. For example, an email sent at
 * 1 AM AKDT (-0800) is stored as 01:00:00Z, not 09:00:00Z.
 */
function parseSenderLocalTime(dateHeader: string): Date | null {
  const parsed = new Date(dateHeader);
  if (isNaN(parsed.getTime())) return null;

  // Extract the UTC offset from the header, e.g. "-0800", "+0530", "-08:00"
  const offsetMatch = dateHeader.match(/([+-])(\d{2}):?(\d{2})\s*$/);
  if (!offsetMatch) return parsed; // No offset found, use parsed value as-is

  const sign = offsetMatch[1] === '+' ? 1 : -1;
  const offsetMs = sign * (parseInt(offsetMatch[2]) * 60 + parseInt(offsetMatch[3])) * 60000;

  // Add the offset back to UTC to recover the sender's local time, then
  // store that moment as if it were UTC.
  return new Date(parsed.getTime() + offsetMs);
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

    if (isImage) {
      const converted = await convertToJpegIfNeeded(rawBuffer, attachment.content_type);
      finalBuffer = converted.buffer;
      finalContentType = converted.contentType;
      if (converted.fileName) finalFileName = converted.fileName;
    }

    let exifLat: number | null = null;
    let exifLng: number | null = null;
    let exifTakenAt: Date | null = null;
    if (isImage) {
      const exif = extractExif(rawBuffer);
      exifLat = exif.lat;
      exifLng = exif.lng;
      exifTakenAt = exif.takenAt;
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

  // Prefer the email Date header over EXIF: it always reflects when the
  // sender hit send, and parseSenderLocalTime strips the UTC offset so the
  // local wall-clock time is stored (matching the site's display convention).
  const emailDateHeader = payload.headers?.['Date'] || payload.headers?.['date'];
  const senderLocalTime = emailDateHeader ? parseSenderLocalTime(emailDateHeader) : null;
  if (senderLocalTime) {
    postDate = senderLocalTime;
  }

  const baseSlug = generateSlug(subject) || `post-${Date.now().toString(36)}`;
  const slug = await ensureUniqueSlug(supabase, baseSlug);

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
