import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that do not require authentication
const PUBLIC_PATHS = [
  '/signin',
  '/signup',
  '/error-404',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, API calls, internal next files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));

  // 1. If user is NOT authenticated and attempts to access any protected route:
  //    Immediately redirect to /signin BEFORE rendering anything (prevent flash/blink)
  if (!token && !isPublicPath) {
    const signInUrl = new URL('/signin', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // 2. If user IS authenticated and attempts to access /signin or /signup:
  //    Redirect them to the main dashboard /
  if (token && (pathname === '/signin' || pathname === '/signup')) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
  ],
};
