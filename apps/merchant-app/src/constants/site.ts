/**
 * Single source of truth for brand identity + SEO metadata.
 *
 * Everything visual or search-engine-facing that is NOT localized copy lives
 * here so the logo, favicon/`next/og` icon routes, the OpenGraph/Twitter
 * cards, the web manifest, robots, the sitemap, and the document metadata all
 * read the same values. No literal brand colors, names, or fee rates scattered
 * across components.
 */

/** Wordmark shown next to the logo and used across document metadata. */
export const BRAND_NAME = 'OMNIPAYX';

/** Two-letter monogram rendered inside the logo tile, favicon, and OG card. */
export const BRAND_MONOGRAM = 'OX';

/** Short descriptor appended after the brand name in the default title. */
export const BRAND_TAGLINE = 'Crypto Payment Gateway';

/** Canonical fee figures — the displayed copy lives in i18n; these back the
 * (non-localized) metadata description and the OG card. Keep in sync with
 * `landing.pricing.fee` in the message catalogs. */
export const FEE_RATE = '0.5%';
export const REFERRAL_RATE = '0.1%';

/** One-line value prop shown on the OG/Twitter share card. */
export const BRAND_OG_SUBLINE = 'Crypto payments on every chain.';

/** Default English meta description (locale variants come from i18n `meta`). */
export const BRAND_DESCRIPTION =
  `Accept crypto payments on every chain. Integrate the OMNIPAYX gateway in ` +
  `minutes — 300+ coins, no KYC, one flat ${FEE_RATE} fee, plus ${REFERRAL_RATE} referral rewards.`;

/**
 * Logo gradient stops (the signature cyan → blue → coral → gold sweep). The
 * logo and aurora are the only surfaces allowed a gradient per the design
 * system, so this is the canonical definition for both the inline SVG mark
 * and the raster `next/og` icon/OG routes.
 */
export const BRAND_GRADIENT_STOPS = [
  { offset: 0, color: '#3ed0f1' },
  { offset: 35, color: '#4796e3' },
  { offset: 70, color: '#e87262' },
  { offset: 100, color: '#f7c948' },
] as const;

/** Same sweep as a CSS `linear-gradient(...)` string for `next/og` (which
 * styles with CSS, not SVG). 135° matches the inline mark's diagonal. */
export const BRAND_GRADIENT_CSS = `linear-gradient(135deg, ${BRAND_GRADIENT_STOPS.map(
  (stop) => `${stop.color} ${stop.offset}%`,
).join(', ')})`;

/** Dark canvas behind the OG card — matches `--color-bg` (dark). */
export const BRAND_BG = '#0a0a0a';

/** Light-mode canvas — matches `--color-bg` under `prefers-color-scheme: light`.
 * Used for the light `theme-color`. */
export const BRAND_BG_LIGHT = '#f0f4f9';

/** Primary accent — drives `theme-color` and the manifest. Matches
 * `--color-brand-blue`. */
export const BRAND_THEME_COLOR = '#4796e3';

/**
 * Public origin used for `metadataBase`, canonical URLs, OG image resolution,
 * robots, and the sitemap. Prefers an explicit env, then Vercel's injected
 * deployment URLs, then a placeholder so previews never emit a dead domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '') ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
  'https://omnipayx.io'
).replace(/\/+$/, '');

/** Twitter/X handle for the `twitter:site` / `twitter:creator` tags. */
export const TWITTER_HANDLE = '@omnipayx';

/** Search keywords for the document metadata. */
export const SEO_KEYWORDS = [
  'crypto payment gateway',
  'accept crypto payments',
  'bitcoin payments',
  'usdt payments',
  'stablecoin checkout',
  'no KYC crypto payments',
  'multi-chain crypto payments',
  'crypto checkout widget',
  'web3 payments',
  'OMNIPAYX',
] as const;

/** Canonical OpenGraph / Twitter card dimensions (also the `next/og` size). */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** Public, indexable routes (locale prefix added per locale by the sitemap). */
export const SITEMAP_PATHS = ['', '/login', '/register'] as const;
