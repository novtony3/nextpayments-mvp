import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const BULLETS = ['noSetup', 'noMonthly', 'noKyc'] as const;

export function Pricing() {
  const t = useTranslations('landing.pricing');

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading kicker={t('kicker')} title={t('title')} subtitle={t('subtitle')} />

        <Reveal className="mx-auto mt-16 max-w-md">
          <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-surface-elevated)] p-10 text-center shadow-[0_36px_90px_-44px_rgba(0,0,0,0.7)]">
            {/* Soft accent bloom at the top — glow, not an edge. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_55%_100%_at_50%_0%,var(--color-accent-soft)_0%,transparent_72%)]"
            />
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl font-normal leading-none tracking-tight text-[var(--color-text)]">
                {t('fee')}
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t('feeDescription')}</p>

            <ul className="mt-10 space-y-3.5 text-left">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
                    <Check className="h-3 w-3 text-[var(--color-accent)]" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm text-[var(--color-text)]">{t(`bullets.${b}`)}</span>
                </li>
              ))}
            </ul>

            <Button asChild size="lg" fullWidth className="mt-10">
              <Link href={ROUTES.REGISTER}>{t('cta')}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
