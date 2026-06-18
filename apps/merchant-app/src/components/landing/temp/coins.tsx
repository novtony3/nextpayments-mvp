'use client';

import { ArrowRight, Blocks, Plug, Wrench } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { COIN_TILES } from '@/constants/coins';
import { CoinAvatar } from '@/components/shared/coin-avatar';
import { Reveal } from './reveal';

// The eight headline tokens shown in the grid; the full list backs the
// dashboard, so we only slice the marketing set here.
const GRID_TILES = COIN_TILES.slice(0, 8);

// A few extra coins drifting faintly behind the grid — the "crowd" depth layer
// that makes the section read as a busy swarm of supported assets.
const BACKDROP_TILES: ReadonlyArray<{
  tile: (typeof COIN_TILES)[number];
  pos: React.CSSProperties;
  size: number;
  blur: number;
  opacity: number;
  duration: number;
}> = [
  {
    tile: COIN_TILES[8]!,
    pos: { top: '-7%', left: '-5%' },
    size: 44,
    blur: 3,
    opacity: 0.3,
    duration: 7,
  },
  {
    tile: COIN_TILES[9]!,
    pos: { bottom: '-9%', right: '4%' },
    size: 56,
    blur: 4,
    opacity: 0.26,
    duration: 8.5,
  },
  {
    tile: COIN_TILES[10]!,
    pos: { top: '42%', right: '-6%' },
    size: 38,
    blur: 3,
    opacity: 0.28,
    duration: 6.5,
  },
  {
    tile: COIN_TILES[11]!,
    pos: { bottom: '14%', left: '-7%' },
    size: 48,
    blur: 4,
    opacity: 0.22,
    duration: 7.8,
  },
];

// Idle-float tuning — each tile bobs on its own index-offset loop so the grid
// undulates like a milling crowd rather than a static grid.
const SWARM = {
  durationBase: 4,
  durationStep: 0.45,
  travelY: 9,
  travelX: 5,
  tilt: 3,
};

// Integration glyphs for the "platform" illustration — each on its own brand
// tint, fanned out like a small toolkit.
const TOOL_GLYPHS = [
  { Icon: Blocks, glow: 'var(--color-brand-blue)', offset: 'left-0 top-2 -rotate-6' },
  {
    Icon: Plug,
    glow: 'var(--color-brand-cyan)',
    offset: 'left-1/2 top-0 -translate-x-1/2 rotate-3',
  },
  { Icon: Wrench, glow: 'var(--color-brand-lilac)', offset: 'right-0 top-3 rotate-6' },
] as const;

/** A single supported-coin tile that idle-floats on an index-offset loop. */
function CoinTile({
  coin,
  index,
  name,
  reduce,
}: {
  coin: (typeof COIN_TILES)[number];
  index: number;
  name: string;
  reduce: boolean | null;
}) {
  return (
    <Reveal delay={index * 0.04}>
      <motion.div
        aria-label={name}
        className="group flex items-center justify-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--glass-fill)] p-5 backdrop-blur-xl transition-colors duration-300 hover:border-[color-mix(in_oklab,var(--color-accent)_45%,transparent)]"
        animate={
          reduce
            ? undefined
            : {
                y: [0, -SWARM.travelY, 0, SWARM.travelY * 0.6, 0],
                x: [0, SWARM.travelX, 0, -SWARM.travelX, 0],
                rotate: [0, SWARM.tilt, 0, -SWARM.tilt, 0],
              }
        }
        transition={{
          duration: SWARM.durationBase + index * SWARM.durationStep,
          delay: index * 0.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <CoinAvatar
          ticker={coin.ticker}
          size="xl"
          showTicker
          className="shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)]"
        />
      </motion.div>
    </Reveal>
  );
}

export function Coins() {
  const t = useTranslations('landing.coins');
  const tw = useTranslations('landing.web3.paas');
  const reduce = useReducedMotion();

  return (
    <section id="coins" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        {/* Left — platform pitch + integration glyphs. */}
        <Reveal>
          {/* Fanned toolkit glyphs. */}
          <div aria-hidden className="relative mb-8 h-20 w-44">
            {TOOL_GLYPHS.map(({ Icon, glow, offset }, i) => (
              <span
                key={i}
                className={`absolute flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--glass-fill)] backdrop-blur-xl ${offset}`}
                style={{ boxShadow: `0 12px 36px -16px ${glow}` }}
              >
                <Icon className="h-7 w-7" strokeWidth={1.5} style={{ color: glow }} />
              </span>
            ))}
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-accent)_30%,transparent)] bg-[var(--color-accent-soft)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
            {t('kicker')}
          </span>
          <h2 className="mt-6 text-balance text-3xl font-medium tracking-tight text-[var(--color-text)] sm:text-[40px] sm:leading-[1.1]">
            {tw('title')}
          </h2>
          <p className="mt-5 max-w-md text-pretty leading-relaxed text-[var(--color-text-muted)]">
            {tw('subtitle')}
          </p>
          <a
            href="#coins"
            className="group mt-8 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--glass-fill)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-muted)] backdrop-blur transition-colors hover:text-[var(--color-text)]"
          >
            {t('viewAll')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </Reveal>

        {/* Right — supported-coin grid (2 rows × 4) over a faint crowd of extra
            coins, the whole set drifting as a gentle swarm. */}
        <div className="relative">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            {BACKDROP_TILES.map((b, i) => (
              <motion.span
                key={b.tile.ticker}
                className="absolute rounded-full ring-1 ring-white/10"
                style={{
                  ...b.pos,
                  height: b.size,
                  width: b.size,
                  opacity: b.opacity,
                  backgroundImage: b.tile.gradient,
                  filter: `blur(${b.blur}px)`,
                }}
                animate={
                  reduce
                    ? undefined
                    : {
                        y: [0, -12, 0, 8, 0],
                        x: [0, 8, 0, -6, 0],
                      }
                }
                transition={{
                  duration: b.duration,
                  delay: i * 0.35,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {GRID_TILES.map((coin, i) => (
              <CoinTile key={coin.ticker} coin={coin} index={i} name={coin.name} reduce={reduce} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
