import { Coins, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';

import { Reveal } from './reveal';

const FEATURES: ReadonlyArray<{
  key: 'noKyc' | 'coins' | 'autoConvert' | 'lowFee';
  Icon: LucideIcon;
}> = [
  { key: 'noKyc', Icon: ShieldCheck },
  { key: 'coins', Icon: Wallet },
  { key: 'autoConvert', Icon: TrendingUp },
  { key: 'lowFee', Icon: Coins },
];

export function Features() {
  const t = useTranslations('landing.features');

  return (
    <section id="features" className="py-24 sm:py-32">
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

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, Icon }, i) => (
            <Reveal
              key={key}
              delay={i * 0.05}
              className="group bg-[var(--color-bg)] p-7 transition-colors hover:bg-[var(--color-surface)]"
            >
              <Icon
                className="h-5 w-5 text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text)]"
                strokeWidth={1.5}
              />
              <h3 className="mt-6 text-[15px] font-medium tracking-tight">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {t(`items.${key}.description`)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
