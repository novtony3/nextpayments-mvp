import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

/**
 * Account-verification notice shown above the dashboard chrome. Static for
 * the UI phase; later gated on `user.emailVerified` from `/user/me`. Uses the
 * single accent (accent-soft surface) instead of the reference's saturated
 * blue bar, per the Gemini concept.
 */
export function VerifyBanner() {
  const t = useTranslations('dashboard.verify');

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-accent-soft)]">
      <div className="flex flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <Info className="h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
        <p className="text-sm text-[var(--color-text)]">{t('message')}</p>
        <Button variant="outline" size="sm" className="sm:ml-auto">
          {t('cta')}
        </Button>
      </div>
    </div>
  );
}
