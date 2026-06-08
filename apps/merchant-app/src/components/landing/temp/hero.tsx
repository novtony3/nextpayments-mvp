'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { TwinAuroras } from '@/components/shared/twin-auroras';
import { RiseIn } from './rise-in';
import { HeroVisual } from './hero-visual';
import { HeroCanvas } from './fx/hero-canvas';
import { KineticLine } from './fx/kinetic-line';
import { Magnetic } from './fx/magnetic';

export function Hero() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-5 py-28 sm:px-6">
      {/* Base ambient — always present, doubles as the no-WebGL fallback. */}
      <TwinAuroras intensity="subtle" contrast="soft" />
      <div
        aria-hidden
        className="bg-web3-grid mask-radial-fade pointer-events-none absolute inset-0 z-0 opacity-50"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* Left — copy. */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <RiseIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--glass-fill)] px-4 py-1.5 text-xs font-medium tracking-wide text-[var(--color-text-muted)] backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              </span>
              {t('eyebrow')}
            </span>
          </RiseIn>

          <h1 className="mt-8 max-w-xl text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[var(--color-text)] sm:text-6xl lg:text-[64px]">
            <KineticLine text={t('headlineLead')} />
            <br />
            <KineticLine text={t('headlineTrail')} delay={0.18} gradient />
          </h1>

          <RiseIn delay={0.5}>
            <p className="mt-7 max-w-md text-pretty text-[15px] leading-relaxed text-[var(--color-text-muted)] sm:text-[17px]">
              {t('subhead')}
            </p>
          </RiseIn>

          <RiseIn delay={0.6}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Magnetic>
                <Button asChild size="lg" className="glow-accent group">
                  <Link href={ROUTES.REGISTER}>
                    {t('ctaPrimary')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </Magnetic>
              <Button asChild size="lg" variant="secondary">
                <a href="#features">{t('ctaSecondary')}</a>
              </Button>
            </div>
          </RiseIn>
        </div>

        {/* Right — 3D particle globe with the floating glass card in front. */}
        <div className="relative flex min-h-[360px] items-center justify-center lg:min-h-[560px]">
          {/* Ambient orb glows (always present, frame the globe + card). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage:
                'radial-gradient(40% 40% at 68% 32%, color-mix(in oklab, var(--color-brand-lilac) 34%, transparent), transparent 70%), radial-gradient(45% 45% at 38% 72%, color-mix(in oklab, var(--color-brand-cyan) 26%, transparent), transparent 72%)',
            }}
          />
          {/* 3D globe — mounts only on capable, motion-OK, ≥768px devices. */}
          <HeroCanvas />
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
