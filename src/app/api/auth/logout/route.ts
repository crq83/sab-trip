import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('view-auth', '', { maxAge: 0, path: '/' });
  res.cookies.set('admin-auth', '', { maxAge: 0, path: '/' });
  return res;
}
