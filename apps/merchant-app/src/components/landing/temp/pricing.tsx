'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { Reveal } from './reveal';
import { ConicBorder } from './fx/conic-border';

const BULLETS = ['allChains', 'noFees', 'referral'] as const;

export function Pricing() {
  const t = useTranslations('landing.pricing');

  return (
    <section id="pricing" className="overflow-x-clip py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16">
        {/* Left — pitch + guarantees. */}
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-accent)_30%,transparent)] bg-[var(--color-accent-soft)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
            {t('kicker')}
          </span>
          <h2 className="mt-6 text-balance text-3xl font-medium tracking-tight text-[var(--color-text)] sm:text-[44px] sm:leading-[1.08]">
            {t('title')}
          </h2>
          <p className="mt-5 max-w-md text-pretty leading-relaxed text-[var(--color-text-muted)]">
            {t('subtitle')}
          </p>

          <ul className="mt-8 space-y-3.5">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] ring-1 ring-[color-mix(in_oklab,var(--color-accent)_30%,transparent)]">
                  <Check className="h-3 w-3 text-[var(--color-accent)]" strokeWidth={2.5} />
                </span>
                <span className="text-sm text-[var(--color-text)]">{t(`bullets.${b}`)}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Right — the headline rate, on a light-burst. */}
        <Reveal delay={0.1} className="relative">
          {/* Radiating light burst behind the card. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 scale-[1.6]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, var(--color-accent-soft) 0%, transparent 58%)',
              }}
            />
            {/* Conic rays — spin a full 360° (static under reduced motion). */}
            <div
              className="np-spin mask-radial-fade absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'repeating-conic-gradient(from 0deg at 50% 50%, color-mix(in oklab, var(--color-brand-cyan) 20%, transparent) 0deg 3deg, transparent 3deg 15deg)',
              }}
            />
          </div>

          <ConicBorder
            className="mx-auto max-w-md"
            innerClassName="bg-[var(--color-surface-elevated)]"
          >
            <div className="relative overflow-hidden rounded-[inherit] p-10 text-center">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_55%_100%_at_50%_0%,var(--color-accent-soft)_0%,transparent_72%)]"
              />
              <span className="relative inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--color-accent)_30%,transparent)] bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
                {t('badge')}
              </span>
              <div className="relative mt-6">
                <span className="text-gradient-web3 font-mono text-7xl font-bold leading-none tracking-tight sm:text-8xl">
                  {t('fee')}
                </span>
              </div>
              <p className="relative mx-auto mt-4 max-w-xs text-sm text-[var(--color-text-muted)]">
                {t('feeDescription')}
              </p>

              <Button asChild size="lg" fullWidth className="glow-accent relative mt-10">
                <Link href={ROUTES.REGISTER}>{t('cta')}</Link>
              </Button>
            </div>
          </ConicBorder>
        </Reveal>
      </div>
    </section>
  );
}
