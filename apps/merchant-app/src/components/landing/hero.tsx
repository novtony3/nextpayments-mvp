import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { Logo } from '@/components/shared/logo';
import { BlueAccent } from '@/components/shared/blue-accent';
import { Reveal } from './reveal';
import { HeroVisual } from './hero-visual';

export function Hero() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-5 py-32 text-center sm:px-6">
      {/* Hero-only ambient — calm subtle aurora; the rest of the page stays
          on the global body glow (kept minimal per the design system). */}
      <BlueAccent intensity="subtle" />

      <div className="relative z-10 flex flex-col items-center">
        <Reveal>
          <Logo iconOnly size={40} className="mb-12" />
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="text-balance text-4xl font-normal leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-6xl lg:text-[72px]">
            {t('headlineLead')}
            <br />
            {t('headlineTrail')}
          </h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-[15px] leading-relaxed text-[var(--color-text-muted)] sm:text-[17px]">
            {t('subhead')}
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="group">
              <Link href={ROUTES.REGISTER}>
                {t('ctaPrimary')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">{t('ctaSecondary')}</a>
            </Button>
          </div>
        </Reveal>

        <HeroVisual />
      </div>
    </section>
  );
}
