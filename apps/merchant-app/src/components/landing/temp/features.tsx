'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Coins, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@nextpayments/ui/lib/utils';

import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';
import { SpotlightCard } from './fx/spotlight-card';

const FEATURES: ReadonlyArray<{
  key: 'noKyc' | 'coins' | 'autoConvert' | 'lowFee';
  Icon: LucideIcon;
}> = [
  { key: 'noKyc', Icon: ShieldCheck },
  { key: 'coins', Icon: Wallet },
  { key: 'autoConvert', Icon: TrendingUp },
  { key: 'lowFee', Icon: Coins },
];

/* Circular coverflow tuning — the focus advances forever (… → 3 → 0 → 1 …); the
 * active card sits centre, larger + brighter, while neighbours flank it and the
 * far card is hidden, so the wrap is seamless. Ambient wash follows the theme
 * accent (`--color-accent`). */
const CYCLE_MS = 5000;
const SPACING_RATIO = 0.62; // neighbour offset as a fraction of card width
const HEIGHT_PAD = 32; // vertical room so the scaled active card isn't clipped
const SLIDE_EASE = [0.16, 1, 0.3, 1] as const;

/** Per-depth (distance from centre) presentation. Neighbours dim + blur so they
 * recede behind the active card, keeping its text legible despite the overlap. */
const DEPTH = [
  { scale: 1.06, opacity: 1, blur: 0 }, // |d| = 0 (active)
  { scale: 0.82, opacity: 0.4, blur: 2.5 }, // |d| = 1 (neighbour)
  { scale: 0.7, opacity: 0, blur: 4 }, // |d| ≥ 2 (hidden — masks the wrap)
] as const;

/** Signed circular distance from `active` to `index`, in (-count/2, count/2]. */
function circularDistance(index: number, active: number, count: number): number {
  const half = count / 2;
  let d = index - active;
  if (d > half) d -= count;
  else if (d < -half) d += count;
  return d;
}

/** Run before paint on the client (no flash), passive on the server. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function Features() {
  const t = useTranslations('landing.features');
  const tw = useTranslations('landing.web3');
  const reduce = useReducedMotion();

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Card width drives the neighbour spacing; the tallest card sets the track
  // height (cards are absolutely positioned, so the track needs an explicit one).
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [layout, setLayout] = useState({ spacing: 220, height: 0 });

  const measure = useCallback(() => {
    const els = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (els.length === 0) return;
    const width = els[0]!.offsetWidth;
    const height = Math.max(...els.map((el) => el.offsetHeight));
    setLayout({ spacing: Math.round(width * SPACING_RATIO), height: Math.round(height) });
  }, []);

  useIsoLayoutEffect(() => {
    if (!reduce) measure();
  }, [reduce, measure]);

  useEffect(() => {
    if (reduce) return;
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [reduce, measure]);

  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % FEATURES.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce, paused]);

  const cardBody = (
    key: (typeof FEATURES)[number]['key'],
    Icon: LucideIcon,
    isActive: boolean,
  ): ReactNode => (
    <SpotlightCard
      glowColor="var(--color-accent)"
      active={isActive}
      className={cn(
        'h-full p-7',
        // Opaque surface for the focused card so neighbours stacked behind it
        // never bleed through the glass and muddy the text.
        isActive &&
          '!bg-[var(--color-surface-elevated)] shadow-[0_24px_70px_-24px_rgba(0,0,0,0.55)]',
      )}
    >
      <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] ring-1 ring-[color-mix(in_oklab,var(--color-accent)_28%,transparent)]">
        <Icon className="h-5 w-5 text-[var(--color-accent)]" strokeWidth={1.5} />
      </span>
      <h3 className="relative mt-6 text-base font-semibold tracking-tight text-[var(--color-text)]">
        {t(`items.${key}.title`)}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
        {t(`items.${key}.description`)}
      </p>
    </SpotlightCard>
  );

  // Reduced motion → a calm static grid (no carousel).
  if (reduce) {
    return (
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <SectionHeading
            kicker={t('kicker')}
            title={tw('featuresTitle')}
            subtitle={t('subtitle')}
          />
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ key, Icon }) => (
              <div key={key} className="h-full">
                {cardBody(key, Icon, false)}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading kicker={t('kicker')} title={tw('featuresTitle')} subtitle={t('subtitle')} />

        <Reveal className="mt-16">
          <div
            className="relative min-h-[260px] overflow-hidden"
            style={{ height: layout.height ? layout.height + HEIGHT_PAD : undefined }}
          >
            {FEATURES.map(({ key, Icon }, i) => {
              const d = circularDistance(i, active, FEATURES.length);
              const depth = DEPTH[Math.min(Math.abs(d), DEPTH.length - 1)]!;
              const isActive = d === 0;
              return (
                <div
                  key={key}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ zIndex: DEPTH.length - Math.min(Math.abs(d), DEPTH.length) }}
                >
                  <motion.div
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="w-[82vw] max-w-[320px]"
                    onMouseEnter={() => {
                      setActive(i);
                      setPaused(true);
                    }}
                    onMouseLeave={() => setPaused(false)}
                    animate={{
                      x: d * layout.spacing,
                      scale: depth.scale,
                      opacity: depth.opacity,
                      filter: `blur(${depth.blur}px)`,
                    }}
                    transition={{ duration: 0.7, ease: SLIDE_EASE }}
                    style={{ pointerEvents: depth.opacity === 0 ? 'none' : 'auto' }}
                  >
                    {cardBody(key, Icon, isActive)}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
