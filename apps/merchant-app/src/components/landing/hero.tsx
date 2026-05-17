import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Logo } from '@/components/shared/logo';

export function Hero() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative flex min-h-[88vh] flex-col items-center justify-center px-5 py-32 text-center sm:px-6">
      <Logo iconOnly size={36} className="mb-12" />

      <h1 className="text-balance text-4xl font-normal leading-[1.12] tracking-tight text-[var(--color-text)] sm:text-6xl lg:text-[68px]">
        {t('headlineLead')}
        <br />
        {t('headlineTrail')}
      </h1>

      <p className="mx-auto mt-8 max-w-xl text-pretty text-[15px] leading-relaxed text-[var(--color-text-muted)] sm:text-[17px]">
        {t('subhead')}
      </p>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" className="group">
          {t('ctaPrimary')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
        <Button size="lg" variant="outline">
          {t('ctaSecondary')}
        </Button>
      </div>
    </section>
  );
}
