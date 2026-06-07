import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';
import { EmptyState } from '@nextpayments/ui/components/empty-state';

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
      <Card>
        <EmptyState
          icon={<Sparkles className="h-5 w-5" />}
          title={t('placeholder.title', { section: name })}
          description={t('placeholder.description')}
        />
      </Card>
    </div>
  );
}
