import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { deleteFromR2 } from '@/lib/r2/client';
import { isAdminRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { exif_taken_at } = await request.json();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('media')
    .update({ exif_taken_at: exif_taken_at || null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/gallery');
  revalidatePath('/blog');
  revalidatePath('/');

  return NextResponse.json({ media: data });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: mediaRow } = await supabase
    .from('media')
    .select('r2_key')
    .eq('id', id)
    .single();

  if (mediaRow?.r2_key) {
    await deleteFromR2([mediaRow.r2_key]);
  }

  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/gallery');
  revalidatePath('/blog');
  revalidatePath('/');

  return NextResponse.json({ ok: true });
}
