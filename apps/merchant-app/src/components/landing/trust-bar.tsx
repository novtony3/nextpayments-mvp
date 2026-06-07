import { useTranslations } from 'next-intl';

import { Reveal } from './reveal';

// Honest capability strip (no fabricated "trusted by N businesses" logos):
// surfaces the figures that actually sell the gateway — coin coverage, the
// flat fee, the referral reward, and the no-KYC onboarding. Values live in
// i18n so locale + future tuning stay in one place.
const STAT_KEYS = ['coins', 'fee', 'referral', 'kyc'] as const;

export function TrustBar() {
  const t = useTranslations('landing.trustBar.stats');

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <Reveal>
          <ul className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
            {STAT_KEYS.map((key) => (
              <li key={key} className="flex flex-col items-center text-center">
                <span className="text-3xl font-normal tracking-tight text-[var(--color-text)] sm:text-4xl">
                  {t(`${key}.value`)}
                </span>
                <span className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {t(`${key}.label`)}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
