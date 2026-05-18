import { Coins, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';

import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

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
        <SectionHeading
          kicker={t('kicker')}
          title={t('title')}
          subtitle={t('subtitle')}
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, Icon }, i) => (
            <Reveal
              key={key}
              delay={i * 0.06}
              className="group relative bg-[var(--color-bg)] p-7 transition-colors duration-300 hover:bg-[var(--color-surface)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors duration-300 group-hover:border-[var(--color-accent-strong)]">
                <Icon
                  className="h-5 w-5 text-[var(--color-text-muted)] transition-colors duration-300 group-hover:text-[var(--color-accent)]"
                  strokeWidth={1.5}
                />
              </span>
              <h3 className="mt-6 text-[15px] font-medium tracking-tight text-[var(--color-text)]">
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
