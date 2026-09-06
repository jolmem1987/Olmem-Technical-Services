import { NextResponse } from 'next/server';

/**
 * Cheap edge gate for /admin: bounce anyone without a session cookie straight
 * to the login page. This checks PRESENCE only — the cookie signature is
 * verified again in Node on every admin page and API route, which is what
 * actually authorizes access.
 */

const PUBLIC_ADMIN_PATHS = ['/admin/login'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  if (!request.cookies.get('ots_admin')) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
