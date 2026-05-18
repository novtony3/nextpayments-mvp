import { useTranslations } from 'next-intl';

import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const STEPS = ['signup', 'integrate', 'receive'] as const;

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          kicker={t('kicker')}
          title={t('title')}
          subtitle={t('subtitle')}
        />

        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {STEPS.map((step, idx) => (
            <Reveal
              key={step}
              delay={idx * 0.1}
              className="group relative border-t border-[var(--color-border)] pt-6 transition-colors duration-300 hover:border-[var(--color-accent-strong)]"
            >
              <span className="inline-block font-mono text-sm tracking-[0.18em] text-[var(--color-text-subtle)] transition-colors duration-300 group-hover:text-[var(--color-accent)]">
                0{idx + 1}
              </span>
              <h3 className="mt-4 text-[17px] font-medium tracking-tight text-[var(--color-text)]">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {t(`steps.${step}.description`)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
