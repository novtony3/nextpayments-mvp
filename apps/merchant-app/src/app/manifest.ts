import type { MetadataRoute } from 'next';

import {
  BRAND_BG,
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_THEME_COLOR,
} from '@/constants/site';

// Web app manifest (/manifest.webmanifest) — installable PWA metadata. Icons
// point at the dynamic `next/og` routes so they share the brand gradient.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    short_name: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: BRAND_BG,
    theme_color: BRAND_THEME_COLOR,
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
  };
}
