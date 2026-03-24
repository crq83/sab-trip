import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/api/inbound-email',
  '/api/revalidate',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public paths (and their sub-paths)
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
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
