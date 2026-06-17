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
  // Run on all routes EXCEPT: API routes, Next internals, the extensionless
  // `next/og` metadata routes (`/icon`, `/apple-icon`, `/opengraph-image`,
  // `/twitter-image` — excluded by name so they aren't locale-redirected and
  // broken), and static files matched by a KNOWN EXTENSION at the end of the
  // path (incl. the dotted convention files robots.txt / sitemap.xml /
  // manifest.webmanifest).
  //
  // It deliberately does NOT exclude *every* path containing a dot. A withdrawal
  // approval token is a JWT (`header.payload.signature`) carried as a path
  // segment (`/withdraw/approve/<jwt>`); a blanket `.*\..*` exclusion skipped
  // that route entirely — dropping locale routing (→ 404 on the un-prefixed
  // link) and the `x-pathname` header the protected guard reads to build
  // `returnTo` (→ the user wasn't returned to the approval page after login).
  matcher: [
    '/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|twitter-image|.*\\.(?:txt|xml|webmanifest|ico|png|jpe?g|svg|gif|webp|js|css|woff2?|ttf|map)$).*)',
  ],
};
