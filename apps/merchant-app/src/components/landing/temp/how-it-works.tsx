'use client';

import { useTranslations } from 'next-intl';

import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';
import { SpotlightCard } from './fx/spotlight-card';

const STEPS = ['signup', 'integrate', 'receive'] as const;

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading kicker={t('kicker')} title={t('title')} subtitle={t('subtitle')} />

        <div className="relative mt-16">
          {/* Connecting rail behind the step badges (desktop only). */}
          <div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-[2.4rem] hidden h-px bg-gradient-to-r from-[var(--color-brand-cyan)] via-[var(--color-brand-blue)] to-[var(--color-brand-coral)] opacity-40 lg:block"
          />

          <ol className="grid gap-5 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step} delay={i * 0.08} as="div">
                <SpotlightCard className="h-full p-7">
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-sm font-bold text-[var(--color-accent)] shadow-[0_0_0_4px_var(--color-bg),0_8px_24px_-12px_var(--color-accent)]">
                    0{i + 1}
                  </span>
                  <h3 className="relative mt-6 text-lg font-semibold tracking-tight text-[var(--color-text)]">
                    {t(`steps.${step}.title`)}
                  </h3>
                  <p className="relative mt-2 leading-relaxed text-[var(--color-text-muted)]">
                    {t(`steps.${step}.description`)}
                  </p>
                </SpotlightCard>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
