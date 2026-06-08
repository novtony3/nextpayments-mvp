'use client';

import { Coins, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';

import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';
import { SpotlightCard } from './fx/spotlight-card';

/* Four equal cards in a single row — each with its own ambient hover tint
 * drawn from the brand palette. */
const FEATURES: ReadonlyArray<{
  key: 'noKyc' | 'coins' | 'autoConvert' | 'lowFee';
  Icon: LucideIcon;
  /** Per-card ambient hover colour, from the brand palette. */
  glow: string;
}> = [
  { key: 'noKyc', Icon: ShieldCheck, glow: 'var(--color-brand-blue)' },
  { key: 'coins', Icon: Wallet, glow: 'var(--color-brand-lilac)' },
  { key: 'autoConvert', Icon: TrendingUp, glow: 'var(--color-brand-cyan)' },
  { key: 'lowFee', Icon: Coins, glow: 'var(--color-brand-coral)' },
];

export function Features() {
  const t = useTranslations('landing.features');
  const tw = useTranslations('landing.web3');

  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading kicker={t('kicker')} title={tw('featuresTitle')} subtitle={t('subtitle')} />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, Icon, glow }, i) => (
            <Reveal key={key} delay={i * 0.06} className="h-full">
              <SpotlightCard glowColor={glow} className="h-full p-7">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] ring-1 ring-[color-mix(in_oklab,var(--color-accent)_28%,transparent)]">
                  <Icon className="h-5 w-5 text-[var(--color-accent)]" strokeWidth={1.5} />
                </span>
                <h3 className="relative mt-6 text-base font-semibold tracking-tight text-[var(--color-text)]">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {t(`items.${key}.description`)}
                </p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
