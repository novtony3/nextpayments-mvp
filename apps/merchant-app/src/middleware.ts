import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

/**
 * next-intl routing + expose the requested path to Server Components via an
 * `x-pathname` request header. The `(protected)` guard reads it to build a
 * `returnTo`, so a session that expires mid-work sends the user back to the
 * page they were on after silent recovery — not the landing page. next-intl
 * forwards incoming request headers onto its internal rewrite, so the header
 * reaches the RSC `headers()`.
 */
export default function middleware(request: NextRequest) {
  request.headers.set('x-pathname', request.nextUrl.pathname);
  return handleI18nRouting(request);
}

export const config = {
  // Match all routes except API routes, Next internals, and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
