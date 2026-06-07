import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import '../globals.css';

import { AccentScript } from '@/components/shared/accent-script';
import { Providers } from '@/components/shared/providers';
import { routing, type Locale } from '@/i18n/routing';
import {
  BRAND_BG,
  BRAND_BG_LIGHT,
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_TAGLINE,
  OG_IMAGE_SIZE,
  SEO_KEYWORDS,
  SITE_URL,
  TWITTER_HANDLE,
} from '@/constants/site';

// Vercel's Geist — self-hosted via next/font (no network at build). Geist Sans
// for the UI, Geist Mono for crypto data (addresses, hashes, amounts). The
// `.variable` classes expose --font-geist-sans / --font-geist-mono, which
// globals.css maps onto the --font-sans / --font-mono design tokens.

const DEFAULT_TITLE = `${BRAND_NAME} — ${BRAND_TAGLINE}`;

/** Map a next-intl locale onto the region-qualified form OpenGraph expects. */
const OG_LOCALES: Record<Locale, string> = { en: 'en_US', fr: 'fr_FR' };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Locale-aware document metadata. The favicon / apple-icon, the OG + Twitter
// image, and the web manifest are wired automatically by Next from the
// convention files in `src/app/` (icon.tsx, opengraph-image.tsx, manifest.ts);
// `metadataBase` resolves their relative URLs to absolute for the social tags.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const description = t('description');

  const localeUrl = `${SITE_URL}/${locale}`;
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}`]),
  );
  languages['x-default'] = `${SITE_URL}/${routing.defaultLocale}`;

  // The OG/Twitter cards live as `next/og` routes at the app root. They are
  // referenced explicitly (not relied on for auto-merge) because this layout
  // returns an explicit `openGraph`/`twitter` object, which suppresses the
  // file-convention merge for image routes in a parent segment. `metadataBase`
  // resolves these relative paths to absolute URLs for the crawled tags.
  const ogImage = {
    url: '/opengraph-image',
    width: OG_IMAGE_SIZE.width,
    height: OG_IMAGE_SIZE.height,
    alt: DEFAULT_TITLE,
  };

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: BRAND_NAME,
    title: { default: DEFAULT_TITLE, template: `%s | ${BRAND_NAME}` },
    description,
    keywords: [...SEO_KEYWORDS],
    authors: [{ name: BRAND_NAME, url: SITE_URL }],
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
    formatDetection: { email: false, address: false, telephone: false },
    alternates: { canonical: localeUrl, languages },
    openGraph: {
      type: 'website',
      siteName: BRAND_NAME,
      title: DEFAULT_TITLE,
      description,
      url: localeUrl,
      locale: OG_LOCALES[locale as Locale] ?? OG_LOCALES[routing.defaultLocale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: DEFAULT_TITLE,
      description,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

// `theme-color` per scheme + declared color-scheme so the browser chrome and
// form controls match the active theme (split from `metadata` per Next 15).
export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: BRAND_BG },
    { media: '(prefers-color-scheme: light)', color: BRAND_BG_LIGHT },
  ],
};

type RootLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Pass messages explicitly so Client Components (header, theme toggle,
  // language switcher) can call useTranslations() through the provider context.
  const messages = await getMessages();

  // Organization + WebSite structured data (JSON-LD) — lets search engines
  // build the brand entity (rich results / knowledge panel eligibility) on top
  // of the meta tags. The logo points at the dynamic `/icon` route.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon`,
        description: BRAND_DESCRIPTION,
        sameAs: [`https://twitter.com/${TWITTER_HANDLE.replace('@', '')}`],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND_NAME,
        inLanguage: locale,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <script
          type="application/ld+json"
          // Static, app-controlled object (no user input) — safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Pre-paint: apply the saved accent from cookie before anything renders. */}
        <AccentScript />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
