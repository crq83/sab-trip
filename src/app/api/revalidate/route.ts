import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paths } = await request.json();
    const pathList: string[] = Array.isArray(paths) ? paths : ['/'];
    pathList.forEach((path) => revalidatePath(path));
    return NextResponse.json({ revalidated: pathList });
  } catch (error) {
    console.error('[revalidate] Error:', error);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
