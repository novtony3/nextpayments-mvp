import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';

import '../globals.css';

import { Providers } from '@/components/shared/providers';
import { routing, type Locale } from '@/i18n/routing';

// Vercel's Geist — self-hosted via next/font (no network at build). Geist Sans
// for the UI, Geist Mono for crypto data (addresses, hashes, amounts). The
// `.variable` classes expose --font-geist-sans / --font-geist-mono, which
// globals.css maps onto the --font-sans / --font-mono design tokens.

export const metadata: Metadata = {
  title: {
    default: 'Nextpayments — Crypto Payment Gateway',
    template: '%s | Nextpayments',
  },
  description:
    'Accept crypto payments effortlessly. Integrate the gateway in minutes — 300+ coins, no KYC.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
