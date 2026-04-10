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
  // Validates the password, sets auth cookies, then redirects to the same
  // URL without the ?p= param so it doesn't linger in the browser history.
  const passwordParam = searchParams.get('p');
  if (passwordParam) {
    const sitePassword = process.env.SITE_PASSWORD;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (passwordParam === adminPassword || passwordParam === sitePassword) {
      const isAdmin = passwordParam === adminPassword;
      const redirectUrl = new URL(request.url);
      redirectUrl.searchParams.delete('p');
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set('view-auth', 'true', COOKIE_OPTS);
      if (isAdmin) {
        response.cookies.set('admin-auth', 'true', COOKIE_OPTS);
      }
      return response;
    }
    // Wrong password — fall through to the normal auth check below
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
