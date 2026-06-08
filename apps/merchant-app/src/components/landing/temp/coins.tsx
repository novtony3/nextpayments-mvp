'use client';

import { ArrowRight, Blocks, Plug, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { COIN_TILES } from '@/constants/coins';
import { Reveal } from './reveal';

// The eight headline tokens shown in the grid; the full list backs the
// dashboard, so we only slice the marketing set here.
const GRID_TILES = COIN_TILES.slice(0, 8);

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

export function Coins() {
  const t = useTranslations('landing.coins');
  const tw = useTranslations('landing.web3.paas');

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

        {/* Right — supported-coin grid (2 rows × 4). */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GRID_TILES.map((coin, i) => (
            <Reveal
              key={coin.ticker}
              delay={i * 0.04}
              className="group flex flex-col items-center gap-3 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--glass-fill)] p-5 backdrop-blur-xl transition-colors duration-300 hover:border-[color-mix(in_oklab,var(--color-accent)_45%,transparent)]"
            >
              <span
                aria-hidden
                className="flex h-14 w-14 items-center justify-center rounded-full font-mono text-[12px] font-bold text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] ring-1 ring-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
                style={{ backgroundImage: coin.gradient }}
              >
                {coin.ticker}
              </span>
              <p className="text-center text-sm font-medium text-[var(--color-text)]">
                {coin.name}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
