import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { createServiceClient } from '@/lib/supabase/server';
import { uploadToR2, deleteFromR2 } from '@/lib/r2/client';
import { isAdminRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { direction } = await request.json(); // 'cw' | 'ccw'

  if (direction !== 'cw' && direction !== 'ccw') {
    return NextResponse.json({ error: 'direction must be "cw" or "ccw"' }, { status: 400 });
  }

  const degrees = direction === 'ccw' ? -90 : 90;

  const supabase = createServiceClient();

  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !media) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
  }

  if (media.media_type !== 'image') {
    return NextResponse.json({ error: 'Only images can be rotated' }, { status: 400 });
  }

  // Fetch image from R2 public URL
  const imgRes = await fetch(media.r2_url);
  if (!imgRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch image from storage' }, { status: 500 });
  }
  const imageBuffer = Buffer.from(await imgRes.arrayBuffer());

  // Rotate and re-encode as JPEG
  const rotated = await sharp(imageBuffer)
    .rotate(degrees)
    .jpeg({ quality: 85 })
    .toBuffer() as Buffer;

  const fileName = media.file_name || 'photo.jpg';
  const { r2Key: newR2Key, r2Url: newR2Url } = await uploadToR2(rotated, fileName, 'image/jpeg');

  const { data: updated, error: updateError } = await supabase
    .from('media')
    .update({ r2_key: newR2Key, r2_url: newR2Url, mime_type: 'image/jpeg' })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    await deleteFromR2([newR2Key]); // clean up on failure
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Delete the old file from R2
  await deleteFromR2([media.r2_key]);

  revalidatePath('/gallery');
  revalidatePath('/blog');
  revalidatePath('/');

  return NextResponse.json({ media: updated });
}
