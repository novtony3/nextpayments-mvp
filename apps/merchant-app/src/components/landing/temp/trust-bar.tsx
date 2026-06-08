'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@nextpayments/ui/lib/utils';

import { Reveal } from './reveal';
import { NumberTicker } from './fx/number-ticker';

// Honest capability strip (no fabricated "trusted by N businesses" logos):
// the figures that actually sell the gateway — coin coverage, the flat fee,
// the referral reward, the no-KYC onboarding. Values live in i18n.
const STAT_KEYS = ['coins', 'fee', 'referral', 'kyc'] as const;

export function TrustBar() {
  const t = useTranslations('landing.trustBar.stats');

  return (
    <section className="px-5 sm:px-6">
      <Reveal className="mx-auto max-w-4xl">
        <dl className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--glass-fill)] backdrop-blur-xl sm:grid-cols-4">
          {STAT_KEYS.map((key, i) => (
            <div
              key={key}
              className={cn(
                'flex flex-col items-center gap-1.5 px-4 py-8 text-center',
                // Hairline dividers: between columns on every layout, and
                // between the two rows on the mobile 2×2.
                i % 2 !== 0 && 'border-l border-[var(--color-border)]',
                i >= 2 && 'border-t border-[var(--color-border)] sm:border-t-0',
                'sm:border-l sm:border-[var(--color-border)]',
                i === 0 && 'sm:border-l-0',
              )}
            >
              <dt className="order-2 text-sm text-[var(--color-text-muted)]">
                {t(`${key}.label`)}
              </dt>
              <dd className="order-1">
                <NumberTicker
                  value={t(`${key}.value`)}
                  className="text-gradient-web3 font-mono text-3xl font-semibold tracking-tight sm:text-4xl"
                />
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
