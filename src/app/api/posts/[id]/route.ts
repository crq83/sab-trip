import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { deleteFromR2 } from '@/lib/r2/client';
import { isAdminRequest } from '@/lib/auth';
import { geocodeLocation } from '@/lib/geocoding';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { title, body, location_name, post_date, slug } = await request.json();

  let lat: number | null = null;
  let lng: number | null = null;

  if (location_name) {
    const geocoded = await geocodeLocation(location_name);
    if (!geocoded) {
      return NextResponse.json(
        { error: "Location not found. Try a more specific name (e.g. 'Juneau, Alaska')." },
        { status: 422 }
      );
    }
    lat = geocoded.lat;
    lng = geocoded.lng;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('posts')
    .update({ title, body, location_name, lat, lng, post_date })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/blog');
  if (slug) revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ post: data });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  // Fetch media keys before deleting
  const { data: mediaRows } = await supabase
    .from('media')
    .select('r2_key')
    .eq('post_id', id);

  const r2Keys = (mediaRows ?? []).map((m: { r2_key: string }) => m.r2_key);

  // Delete from R2 first
  await deleteFromR2(r2Keys);

  // Delete post (media cascades via FK)
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/blog');

  return NextResponse.json({ ok: true });
}
