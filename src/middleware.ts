import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/api/inbound-email',
  '/api/revalidate',
];

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Allow all public paths (and their sub-paths)
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Auto-login via ?p=<password> query param.
  // Pass through without redirecting so ?p= stays in the URL.
  // The client-side PersistPasswordParam component keeps it across navigation.
  const passwordParam = searchParams.get('p');
  if (passwordParam) {
    const sitePassword = process.env.SITE_PASSWORD;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (passwordParam === adminPassword || passwordParam === sitePassword) {
      const isAdmin = passwordParam === adminPassword;
      const response = NextResponse.next();
      response.cookies.set('view-auth', 'true', COOKIE_OPTS);
      if (isAdmin) {
        response.cookies.set('admin-auth', 'true', COOKIE_OPTS);
      }
      return response;
    }
    // Wrong password — fall through to normal auth check
  }

  const viewAuth = request.cookies.get('view-auth')?.value;
  if (viewAuth !== 'true') {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
