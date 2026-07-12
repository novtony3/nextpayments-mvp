import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ComingSoonView } from '@/components/shared/coming-soon-view';

type ComingSoonPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ComingSoonPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'comingSoon' });

  return {
    title: t('title'),
    description: t('subtitle'),
    // Nothing to index until the real page ships.
    robots: { index: false, follow: true },
  };
}

/**
 * Landing spot for every marketing link whose page doesn't exist yet
 * (Developers / Company / Legal — see `FOOTER_COLUMNS`). Keeping them all on
 * one route means shipping a real page is a one-line change in the nav config.
 */
export default async function ComingSoonPage({ params }: ComingSoonPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ComingSoonView />;
}
