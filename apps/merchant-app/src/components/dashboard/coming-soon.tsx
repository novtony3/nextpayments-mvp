import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';

import type { DashboardIconKey } from '@/constants/dashboard';

type ComingSoonProps = {
  /** Nav key whose label names the section (`dashboard.nav.<key>`). */
  section: DashboardIconKey;
};

/**
 * Placeholder for dashboard sections whose backend is not wired yet (UI
 * phase). One component, driven by the nav key — pages stay 3 lines and the
 * copy is fully localized (no hardcoded section names).
 */
export function ComingSoon({ section }: ComingSoonProps) {
  const t = useTranslations('dashboard');
  const name = t(`nav.${section}`);

  return (
    <div className="mx-auto max-w-xl">
      <Card className="flex flex-col items-center gap-3 px-8 py-16 text-center">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        >
          <Sparkles className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          {t('placeholder.title', { section: name })}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">{t('placeholder.description')}</p>
      </Card>
    </div>
  );
}
