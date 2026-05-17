import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Reveal } from './reveal';

const BULLETS = ['noSetup', 'noMonthly', 'noKyc'] as const;

export function Pricing() {
  const t = useTranslations('landing.pricing');

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs tracking-[0.14em] text-[var(--color-text-subtle)]">
            {t('kicker')}
          </p>
          <h2 className="mt-4 text-balance text-3xl font-normal tracking-tight sm:text-[42px] sm:leading-[1.15]">
            {t('title')}
          </h2>
          <p className="mt-5 text-[var(--color-text-muted)]">{t('subtitle')}</p>
        </Reveal>

        <Reveal className="mx-auto mt-16 max-w-md">
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl font-normal leading-none tracking-tight text-[var(--color-text)]">
                {t('fee')}
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t('feeDescription')}</p>

            <ul className="mt-10 space-y-3.5 text-left">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <Check
                    className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]"
                    strokeWidth={1.75}
                  />
                  <span className="text-sm text-[var(--color-text)]">{t(`bullets.${b}`)}</span>
                </li>
              ))}
            </ul>

            <Button size="lg" className="mt-10 w-full">
              {t('cta')}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
