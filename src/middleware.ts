// middleware.ts
// Next.js middleware — admin route protection via Supabase Auth
// TODO: Phase 2 — Full implementation with @supabase/ssr createMiddlewareClient

import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Phase 2: Check Supabase Auth session from cookies
  // For now, allow all requests through (stub)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // TODO: Phase 2 — validate session, redirect if unauthenticated
    // const session = await getSessionFromCookies(request);
    // if (!session && request.nextUrl.pathname !== '/admin') {
    //   return NextResponse.redirect(new URL('/admin', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
