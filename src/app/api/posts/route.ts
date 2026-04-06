import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { isAdminRequest } from '@/lib/auth';
import { geocodeLocation } from '@/lib/geocoding';

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, body, location_name, post_date } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  // Generate a unique slug from title + timestamp
  const baseSlug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = `${baseSlug}-${Date.now()}`;

  let lat: number | null = null;
  let lng: number | null = null;
  if (location_name?.trim()) {
    const geocoded = await geocodeLocation(location_name.trim());
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
    .insert({
      title: title.trim(),
      slug,
      body: body?.trim() || null,
      location_name: location_name?.trim() || null,
      lat,
      lng,
      post_date: post_date || new Date().toISOString(),
      status: 'published',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/blog');
  revalidatePath('/');

  return NextResponse.json({ post: data }, { status: 201 });
}
