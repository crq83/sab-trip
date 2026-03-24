import { NextRequest, NextResponse } from 'next/server';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export async function POST(request: NextRequest) {
  const { password, type } = await request.json();

  if (type === 'view') {
    const sitePassword = process.env.SITE_PASSWORD;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (password === adminPassword) {
      const res = NextResponse.json({ ok: true, isAdmin: true });
      res.cookies.set('view-auth', 'true', COOKIE_OPTS);
      res.cookies.set('admin-auth', 'true', COOKIE_OPTS);
      return res;
    }

    if (password === sitePassword) {
      const res = NextResponse.json({ ok: true, isAdmin: false });
      res.cookies.set('view-auth', 'true', COOKIE_OPTS);
      return res;
    }

    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  }

  if (type === 'admin') {
    const viewAuth = request.cookies.get('view-auth')?.value;
    if (viewAuth !== 'true') {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
    }

    if (password === process.env.ADMIN_PASSWORD) {
      const res = NextResponse.json({ ok: true });
      res.cookies.set('admin-auth', 'true', COOKIE_OPTS);
      return res;
    }

    return NextResponse.json({ ok: false, error: 'Invalid admin password' }, { status: 401 });
  }

  return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
}
