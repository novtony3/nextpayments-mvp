import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Reveal } from './reveal';

export function CtaBanner() {
  const t = useTranslations('landing.cta');

  return (
    <section id="cta" className="px-5 pb-32 sm:px-6 sm:pb-40">
      <Reveal className="mx-auto max-w-4xl text-center">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-normal tracking-tight sm:text-5xl sm:leading-[1.1]">
          {t('title')}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[var(--color-text-muted)]">{t('subtitle')}</p>
        <Button size="lg" className="group mt-10">
          {t('button')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </Reveal>
    </section>
  );
}
