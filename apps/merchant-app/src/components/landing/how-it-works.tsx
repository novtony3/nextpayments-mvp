import { useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';

import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const STEPS = ['signup', 'integrate', 'receive'] as const;

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading kicker={t('kicker')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {STEPS.map((step, idx) => (
            <Reveal key={step} delay={idx * 0.1}>
              <Card className="h-full p-8">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] font-mono text-sm font-semibold text-[var(--color-accent)]">
                  0{idx + 1}
                </span>
                <h3 className="mt-4 text-[17px] font-medium tracking-tight text-[var(--color-text)]">
                  {t(`steps.${step}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {t(`steps.${step}.description`)}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
