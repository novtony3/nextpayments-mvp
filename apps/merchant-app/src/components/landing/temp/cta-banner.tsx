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
        {/* Liquid-glass panel: a frosted translucent slab (backdrop blur + glass
            fill) with a lit top rim + bevel highlights for 3D depth, over soft
            brand-colour "liquid" blobs glowing inside. */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--glass-border)] bg-[var(--glass-fill-strong)] px-6 py-20 text-center shadow-[0_40px_100px_-32px_rgba(0,0,0,0.8),inset_0_1px_0_var(--glass-highlight),inset_0_-1px_3px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:px-16">
          {/* Liquid colour blobs (soft-blurred), clipped to the glass. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-12 -top-12 h-60 w-60 rounded-full bg-[var(--color-brand-blue)] opacity-50 blur-[72px]" />
            <div className="absolute -bottom-12 -right-10 h-60 w-72 rounded-full bg-[var(--color-brand-lilac)] opacity-45 blur-[72px]" />
            <div className="absolute left-1/3 top-1/2 h-44 w-72 -translate-y-1/2 rounded-full bg-[var(--color-brand-cyan)] opacity-30 blur-[84px]" />
          </div>

          {/* Specular diagonal sheen across the glass. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_32%,rgba(255,255,255,0.1)_48%,transparent_60%)]"
          />
          {/* Bright top rim — the glass catching light. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)]"
          />

          <div className="relative">
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
        </div>
      </Reveal>
    </section>
  );
}
