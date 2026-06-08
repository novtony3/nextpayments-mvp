'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { Reveal } from './reveal';

export function CtaBanner() {
  const t = useTranslations('landing.cta');

  return (
    <section id="cta" className="px-5 pb-32 sm:px-6 sm:pb-40">
      <Reveal className="mx-auto max-w-4xl">
        <div className="rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-20 text-center sm:px-16">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl sm:leading-[1.05]">
            {t('title')}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-[var(--color-text-muted)]">
            {t('subtitle')}
          </p>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="group">
              <Link href={ROUTES.REGISTER}>
                {t('button')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
