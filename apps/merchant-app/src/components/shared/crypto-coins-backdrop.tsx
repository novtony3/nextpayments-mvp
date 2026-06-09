'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  TokenBNB,
  TokenBTC,
  TokenETH,
  TokenSOL,
  TokenUSDC,
  TokenUSDT,
  TokenXRP,
} from '@web3icons/react';

import { cn } from '@nextpayments/ui/lib/utils';

import { COIN_TILES, type CoinTile } from '@/constants/coins';

/**
 * CryptoCoinsBackdrop — a scattered field of real, recognizable crypto coins
 * that idle-float and tilt in 3D behind the auth card. Each coin is the
 * official token logo (web3icons `background` variant — brand-colored disc +
 * white mark, exactly as it reads on an exchange) clipped to a circle, with a
 * restrained glass treatment: a top-light gloss, a thin rim, a drop shadow,
 * and a soft brand-colored bloom into the `<BlueAccent>` aurora behind it.
 * Depth comes from size + opacity (not heavy blur, which would smear the logos
 * into blobs). Purely decorative (`pointer-events-none`, `aria-hidden`),
 * collapses to a static layout under `prefers-reduced-motion`. Layer it above
 * the aurora but below the `z-10` card.
 */

/** 3D perspective applied per coin so the tilt reads as depth, not skew. */
const PERSPECTIVE = 900;

/** web3icons size prop is unitless px; we drive it off the coin diameter. */
const ICON_VARIANT = 'background' as const;

/** Token component per ticker — statically imported so the bundle tree-shakes
 * to just these seven icons. All web3icons share one component type. */
type IconComponent = typeof TokenBTC;
const TICKER_TO_ICON: Record<string, IconComponent> = {
  BTC: TokenBTC,
  ETH: TokenETH,
  USDT: TokenUSDT,
  USDC: TokenUSDC,
  BNB: TokenBNB,
  SOL: TokenSOL,
  XRP: TokenXRP,
};

type CoinPlacement = {
  /** Matches a `COIN_TILES` ticker (bloom color) + a `TICKER_TO_ICON` logo. */
  ticker: string;
  /** Diameter in px. */
  size: number;
  /** Absolute offsets within the field (percentages keep it fluid). */
  pos: React.CSSProperties;
  /** Depth blur in px — kept tiny so the back-layer logos stay readable. */
  blur: number;
  opacity: number;
  /** Vertical idle travel in px. */
  float: number;
  /** Loop length + start offset (s) so the coins never beat in unison. */
  duration: number;
  delay: number;
  /** Max 3D tilt in degrees. */
  tilt: number;
  /** Responsive gate — kept off small screens so coins never crowd the form. */
  visibility?: string;
};

/**
 * Hand-placed scatter, all coins confined to the gutters outside the centered
 * card column: the front + mid layers appear from `md:` up (where the 400px
 * card leaves ≥184px gutters, so a `left:9%` coin clears it), and a dim back
 * layer from `lg:` up. Below `md:` only the aurora shows, so coins never crowd
 * the form on phones. Depth is read from size + opacity; blur stays minimal so
 * the real logos remain recognizable.
 */
const COIN_LAYOUT: ReadonlyArray<CoinPlacement> = [
  {
    ticker: 'BTC',
    size: 92,
    pos: { top: '12%', left: '9%' },
    blur: 0,
    opacity: 0.96,
    float: 18,
    duration: 11,
    delay: 0,
    tilt: 11,
    visibility: 'hidden md:block',
  },
  {
    ticker: 'ETH',
    size: 100,
    pos: { bottom: '12%', right: '8%' },
    blur: 0,
    opacity: 0.94,
    float: 22,
    duration: 13,
    delay: 1.2,
    tilt: 13,
    visibility: 'hidden md:block',
  },
  {
    ticker: 'SOL',
    size: 70,
    pos: { top: '15%', right: '12%' },
    blur: 0,
    opacity: 0.85,
    float: 16,
    duration: 12,
    delay: 0.6,
    tilt: 10,
    visibility: 'hidden md:block',
  },
  {
    ticker: 'USDT',
    size: 74,
    pos: { bottom: '17%', left: '12%' },
    blur: 0,
    opacity: 0.86,
    float: 18,
    duration: 12.5,
    delay: 1.8,
    tilt: 10,
    visibility: 'hidden md:block',
  },
  {
    ticker: 'BNB',
    size: 56,
    pos: { top: '44%', left: '4%' },
    blur: 1,
    opacity: 0.7,
    float: 12,
    duration: 14,
    delay: 0.3,
    tilt: 8,
    visibility: 'hidden lg:block',
  },
  {
    ticker: 'XRP',
    size: 58,
    pos: { bottom: '40%', right: '4%' },
    blur: 1,
    opacity: 0.7,
    float: 14,
    duration: 15,
    delay: 1.5,
    tilt: 8,
    visibility: 'hidden lg:block',
  },
  {
    ticker: 'USDC',
    size: 62,
    pos: { top: '6%', right: '30%' },
    blur: 1.5,
    opacity: 0.6,
    float: 10,
    duration: 16,
    delay: 0.9,
    tilt: 6,
    visibility: 'hidden lg:block',
  },
];

/** Resolve a placement's ticker to its `COIN_TILES` entry (for the bloom hue). */
const TILE_BY_TICKER = new Map<string, CoinTile>(COIN_TILES.map((tile) => [tile.ticker, tile]));

function FloatingCoin({ placement }: { placement: CoinPlacement }) {
  const reduce = useReducedMotion();
  const Icon = TICKER_TO_ICON[placement.ticker];
  const tile = TILE_BY_TICKER.get(placement.ticker);
  if (!Icon) return null;

  return (
    <motion.div
      aria-hidden
      className={cn('absolute', placement.visibility)}
      style={{
        ...placement.pos,
        height: placement.size,
        width: placement.size,
        opacity: placement.opacity,
        filter: placement.blur ? `blur(${placement.blur}px)` : undefined,
        transformPerspective: PERSPECTIVE,
      }}
      animate={
        reduce
          ? undefined
          : {
              y: [0, -placement.float, 0],
              rotateX: [0, placement.tilt, 0, -placement.tilt, 0],
              rotateY: [0, -placement.tilt, 0, placement.tilt, 0],
            }
      }
      transition={{
        duration: placement.duration,
        delay: placement.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Soft brand-colored bloom — the coin glows into the aurora behind it. */}
      {tile && (
        <span
          className="absolute inset-[-24%] rounded-full opacity-35 blur-2xl"
          style={{ backgroundImage: tile.gradient }}
        />
      )}
      {/* The coin: official logo on its brand disc, clipped to a circle, with a
          thin rim, an inset top highlight, and a drop shadow for solidity. */}
      <span className="absolute inset-0 overflow-hidden rounded-full ring-1 ring-white/15 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.35),0_18px_40px_-12px_rgba(0,0,0,0.55)]">
        <Icon variant={ICON_VARIANT} size={placement.size} />
        {/* Glass gloss — top-light → bottom-shade so the disc reads as a 3D
            glossy coin without obscuring the mark. */}
        <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-black/15" />
      </span>
    </motion.div>
  );
}

export function CryptoCoinsBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {COIN_LAYOUT.map((placement) => (
        <FloatingCoin key={placement.ticker} placement={placement} />
      ))}
    </div>
  );
}
