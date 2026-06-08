'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { TwinAuroras } from '@/components/shared/twin-auroras';
import { Reveal } from './reveal';
import { Magnetic } from './fx/magnetic';

export function CtaBanner() {
  const t = useTranslations('landing.cta');

  return (
    <section id="cta" className="px-5 pb-32 sm:px-6 sm:pb-40">
      <Reveal className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-20 text-center sm:px-16">
          {/* Designated hero moment — the full aurora is licensed here. */}
          <TwinAuroras intensity="bold" contrast="normal" />
          <div
            aria-hidden
            className="bg-web3-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-30"
          />
          <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl sm:leading-[1.05]">
            {t('title')}
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-pretty text-[var(--color-text-muted)]">
            {t('subtitle')}
          </p>
          <div className="relative mt-10 flex justify-center">
            <Magnetic>
              <Button asChild size="lg" className="glow-accent group">
                <Link href={ROUTES.REGISTER}>
                  {t('button')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
