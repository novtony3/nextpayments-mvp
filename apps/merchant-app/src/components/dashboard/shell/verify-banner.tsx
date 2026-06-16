import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';

/**
 * Account-verification notice shown above the dashboard chrome (gated on
 * `user.emailVerified` by the shell). The CTA links to Pay Settings, where the
 * email-verification card explains how to confirm the address. Uses the single
 * accent (accent-soft surface) instead of the reference's saturated blue bar,
 * per the Gemini concept.
 */
export function VerifyBanner() {
  const t = useTranslations('dashboard.verify');

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-accent-soft)]">
      <div className="flex flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <Info className="h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
        <p className="text-sm text-[var(--color-text)]">{t('message')}</p>
        <Button asChild variant="outline" size="sm" className="sm:ml-auto">
          <Link href={ROUTES.PAY_SETTINGS}>{t('cta')}</Link>
        </Button>
      </div>
    </div>
  );
}
