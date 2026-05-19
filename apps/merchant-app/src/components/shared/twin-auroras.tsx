'use client';

import { motion, useReducedMotion, type Transition } from 'framer-motion';

import { cn } from '@nextpayments/ui/lib/utils';

import { BlueAccent } from './blue-accent';

/** How far apart the two ribbons read — drives the opacity pulse + the
 * layer's overall strength against the canvas. */
type Contrast = 'soft' | 'normal' | 'vivid';

type TwinAurorasProps = {
  className?: string;
  /** Forwarded to both auroras. `bold` = hero canvas, `subtle` = sections. */
  intensity?: 'subtle' | 'bold';
  /** Feather the composited pair's edges (default) so a clipping
   * `overflow-hidden` parent shows no hard seam. `false` = full-bleed
   * canvas (e.g. a viewport-filling hero). */
  feather?: boolean;
  /** First ribbon color — any CSS color / custom property. */
  colorA?: string;
  /** Second ribbon color woven against the first. */
  colorB?: string;
  /** Contrast between the two ribbons (and overall punch). */
  contrast?: Contrast;
};

/**
 * Two flowing-water auroras orbiting in counter-phase so they sweep through
 * each other like coiling dragons. Reuses {@link BlueAccent} (via its `color`
 * prop) for each ribbon — no reimplementation; this only adds the orbital
 * weave + additive blend.
 *
 * Reusable: pass any `colorA`/`colorB` to remix the palette, and `contrast`
 * to dial how far apart they read. `mix-blend-mode: plus-lighter` makes the
 * crossover additive (the "embrace"); an extra soft blur melts each edge and
 * the out-of-phase opacity pulse fakes which ribbon is in front. Calm long
 * loops; `prefers-reduced-motion` collapses to a static, intertwined pair.
 */

const EASE = 'easeInOut' as const;

/** Path is fixed; only opacity + overall strength vary with `contrast`. */
const BLUE_PATH = { x: ['-4%', '5%', '-4%'], y: ['7%', '-9%', '7%'], rotate: [-6, 6, -6] };
const ALT_PATH = { x: ['5%', '-4%', '5%'], y: ['-9%', '8%', '-9%'], rotate: [6, -7, 6] };

const CONTRAST: Record<Contrast, { blue: number[]; alt: number[]; layerOpacity: number }> = {
  soft: { blue: [1, 0.9, 1], alt: [0.9, 1, 0.9], layerOpacity: 0.7 },
  normal: { blue: [1, 0.82, 1], alt: [0.82, 1, 0.82], layerOpacity: 1 },
  vivid: { blue: [1, 0.62, 1], alt: [0.62, 1, 0.62], layerOpacity: 1 },
};

const BLUE_T: Transition = {
  x: { duration: 26, repeat: Infinity, ease: EASE },
  y: { duration: 22, repeat: Infinity, ease: EASE },
  rotate: { duration: 31, repeat: Infinity, ease: EASE },
  opacity: { duration: 18, repeat: Infinity, ease: EASE },
};
const ALT_T: Transition = {
  x: { duration: 29, repeat: Infinity, ease: EASE },
  y: { duration: 25, repeat: Infinity, ease: EASE },
  rotate: { duration: 35, repeat: Infinity, ease: EASE },
  opacity: { duration: 18, repeat: Infinity, ease: EASE },
};

/** Extra feather on top of BlueAccent's own blur — softens each ribbon's
 * silhouette so the two melt into each other instead of showing an edge. */
const SOFT_EDGE = 'blur-[48px]';

/**
 * Feather the whole composited pair into a soft centered ambient that hits
 * full transparency on EVERY side (top, bottom, left, right) before the
 * parent's `overflow-hidden` can clip it — BlueAccent's glow is bright at its
 * own bottom edge (it's built for full-viewport canvases), so inside a
 * mid-page section that edge would otherwise clip into a hard seam. A small
 * solid core keeps the glow; the wide transparent falloff guarantees no edge
 * on any side. Owns all the feathering, so the inner ribbons don't (a second
 * mask would fight plus-lighter).
 */
const FEATHER_MASK =
  'radial-gradient(ellipse 70% 60% at 50% 52%, #000 0%, #000 30%, transparent 70%)';

/** Static intertwined offsets used when motion is reduced. */
const BLUE_STATIC = 'translate-x-[-4%] rotate-[-4deg]';
const ALT_STATIC = 'translate-x-[4%] rotate-[4deg]';

export function TwinAuroras({
  className,
  intensity = 'bold',
  feather = true,
  colorA = 'var(--color-aurora)',
  colorB = 'var(--color-aurora-alt)',
  contrast = 'normal',
}: TwinAurorasProps) {
  const reduce = useReducedMotion();
  const c = CONTRAST[contrast];
  const maskStyle = feather
    ? { maskImage: FEATHER_MASK, WebkitMaskImage: FEATHER_MASK }
    : undefined;

  return (
    <div
      aria-hidden
      style={{ opacity: c.layerOpacity, ...maskStyle }}
      className={cn('pointer-events-none absolute inset-0 isolate overflow-hidden', className)}
    >
      <motion.div
        className={cn('absolute inset-0', SOFT_EDGE, reduce && BLUE_STATIC)}
        animate={reduce ? undefined : { ...BLUE_PATH, opacity: c.blue }}
        transition={reduce ? undefined : BLUE_T}
      >
        <BlueAccent intensity={intensity} feather={false} color={colorA} />
      </motion.div>

      <motion.div
        className={cn('absolute inset-0 mix-blend-plus-lighter', SOFT_EDGE, reduce && ALT_STATIC)}
        animate={reduce ? undefined : { ...ALT_PATH, opacity: c.alt }}
        transition={reduce ? undefined : ALT_T}
      >
        <BlueAccent intensity={intensity} feather={false} color={colorB} />
      </motion.div>
    </div>
  );
}
