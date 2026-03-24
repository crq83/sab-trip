import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { createServiceClient } from '@/lib/supabase/server';
import { uploadToR2 } from '@/lib/r2/client';
import { extractExif } from '@/lib/email/exif';
import { isAdminRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];
  const slug = formData.get('slug') as string | null;

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided.' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Determine starting sort_order
  const { data: existing } = await supabase
    .from('media')
    .select('sort_order')
    .eq('post_id', id)
    .order('sort_order', { ascending: false })
    .limit(1);
  let sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const inserted = [];

  for (const file of files) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) continue;

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    let buffer = originalBuffer;
    let contentType = file.type;
    let fileName = file.name || (isImage ? 'photo.jpg' : 'video.mp4');

    // Convert HEIC/HEIF to JPEG
    if (contentType === 'image/heic' || contentType === 'image/heif') {
      buffer = await sharp(originalBuffer).jpeg({ quality: 90 }).toBuffer() as Buffer;
      contentType = 'image/jpeg';
      fileName = fileName.replace(/\.(heic|heif)$/i, '.jpg');
    }

    // Extract EXIF from original buffer
    let exifLat: number | null = null;
    let exifLng: number | null = null;
    let exifTakenAt: Date | null = null;
    if (isImage) {
      const exif = extractExif(originalBuffer);
      exifLat = exif.lat;
      exifLng = exif.lng;
      exifTakenAt = exif.takenAt;
    }

    const { r2Key, r2Url } = await uploadToR2(buffer, fileName, contentType);

    const { data: mediaRow, error } = await supabase
      .from('media')
      .insert({
        post_id: id,
        r2_key: r2Key,
        r2_url: r2Url,
        media_type: isVideo ? 'video' : 'image',
        mime_type: contentType,
        file_name: fileName,
        file_size_bytes: buffer.length,
        exif_lat: exifLat,
        exif_lng: exifLng,
        exif_taken_at: exifTakenAt?.toISOString() ?? null,
        sort_order: sortOrder++,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    inserted.push(mediaRow);
  }

  revalidatePath('/');
  revalidatePath('/blog');
  if (slug) revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ media: inserted });
}
