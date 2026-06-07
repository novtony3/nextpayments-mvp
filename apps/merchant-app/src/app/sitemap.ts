import type { MetadataRoute } from 'next';

import { SITE_URL, SITEMAP_PATHS } from '@/constants/site';
import { routing } from '@/i18n/routing';

// /sitemap.xml — one entry per public path × locale, each carrying hreflang
// `alternates` so search engines pair the en/fr variants correctly.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return SITEMAP_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.6,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, `${SITE_URL}/${alt}${path}`]),
        ),
      },
    })),
  );
}
