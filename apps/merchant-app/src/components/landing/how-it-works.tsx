import { useTranslations } from 'next-intl';

import { Reveal } from './reveal';

const STEPS = ['signup', 'integrate', 'receive'] as const;

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  return (
    <section className="py-24 sm:py-32">
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

        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {STEPS.map((step, idx) => (
            <Reveal
              key={step}
              delay={idx * 0.08}
              className="relative border-t border-[var(--color-border)] pt-6"
            >
              <span className="inline-block font-mono text-xs tracking-[0.18em] text-[var(--color-text-subtle)]">
                0{idx + 1}
              </span>
              <h3 className="mt-4 text-[17px] font-medium tracking-tight">
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
