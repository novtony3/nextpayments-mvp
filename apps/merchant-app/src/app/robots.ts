import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/constants/site';

// /robots.txt — marketing + auth pages are crawlable; the authenticated app
// (any `/<locale>/dashboard`, `/transactions`, …) redirects to login for
// anonymous crawlers, so it is excluded with locale-agnostic wildcards.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/*/dashboard',
        '/*/transactions',
        '/*/orders',
        '/*/invoicing',
        '/*/pay-settings',
        '/*/integrations',
        '/*/affiliate',
        '/*/quick-pos',
        '/*/support',
        '/api/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
