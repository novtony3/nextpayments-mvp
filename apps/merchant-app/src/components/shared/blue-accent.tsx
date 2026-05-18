'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@nextpayments/ui/lib/utils';

type Intensity = 'subtle' | 'bold';

type BlueAccentProps = {
  /** Extra classes for the absolutely-positioned layer wrapper. */
  className?: string;
  /** Glow strength. `bold` = login/hero canvas, `subtle` = secondary pages. */
  intensity?: Intensity;
  /**
   * Base color of the aurora — any CSS color or custom property. Defaults to
   * the shared `--color-aurora` token (theme-aware deep blue). Pass e.g.
   * `var(--color-brand-coral)` to reuse the exact flowing-water effect in
   * another hue.
   */
  color?: string;
  /**
   * Feather the layer's top & bottom edges to transparent so the glow never
   * shows a hard seam where its container/section is clipped. On by default;
   * pass `false` for full-bleed canvases that fill the whole viewport.
   */
  feather?: boolean;
};

/**
 * Vertical fade mask — keeps the glow off both edges so a clipped section
 * boundary can't cut it into a hard line. Heavier feather at the bottom
 * (where the aurora is brightest) for the smoothest taper.
 */
const FEATHER_MASK =
  'linear-gradient(to bottom, transparent 0%, #000 12%, #000 64%, transparent 99%)';

/** `color` mixed with transparent at `pct`% — the effect's single color knob. */
const tint = (color: string, pct: number) => `color-mix(in oklab, ${color} ${pct}%, transparent)`;

const STOPS: Record<Intensity, { hot: number; mid: number; halo: number; wave: number }> = {
  subtle: { hot: 44, mid: 18, halo: 12, wave: 30 },
  bold: { hot: 92, mid: 42, halo: 22, wave: 64 },
};

/**
 * BlueAccent — the Gemini Desktop signature deep-blue aurora rising from the
 * bottom edge, with a flowing-water effect: heavily-blurred deep-blue wave
 * bodies that rotate, stretch (scaleX/scaleY out of phase) and drift on
 * offset infinite loops, so the floor light undulates like liquid. All loops
 * are seamless and never-ending; honors `prefers-reduced-motion`.
 *
 * Render inside a `relative overflow-hidden` parent; fills it,
 * `pointer-events-none`. Monochrome single-accent per PLAN §4.2.
 */
export function BlueAccent({
  className,
  intensity = 'bold',
  color = 'var(--color-aurora)',
  feather = true,
}: BlueAccentProps) {
  const reduce = useReducedMotion();
  const s = STOPS[intensity];
  const c = (pct: number) => tint(color, pct);
  const maskStyle = feather
    ? { maskImage: FEATHER_MASK, WebkitMaskImage: FEATHER_MASK }
    : undefined;

  return (
    <div
      aria-hidden
      style={maskStyle}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {/* Wide soft halo — outer falloff that keeps the top pure black. */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 120% 75% at 50% 118%, ${c(
            s.mid,
          )} 0%, ${c(s.halo)} 32%, transparent 64%)`,
        }}
      />

      {/* Deep saturated core hugging the bottom edge — the bright floor. */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background: `radial-gradient(ellipse 80% 90% at 50% 116%, ${c(
            s.hot,
          )} 0%, ${c(s.mid)} 40%, transparent 70%)`,
        }}
      />

      {/* Flowing-water layer: two large blurred deep-blue bodies that rotate,
          stretch and drift out of phase — the surface ripple of the floor. */}
      <motion.div
        className="absolute -bottom-1/3 left-1/4 h-[60vh] w-[70vw] rounded-[42%_58%_60%_40%/55%_45%_55%_45%] blur-[90px]"
        style={{ background: c(s.wave) }}
        animate={
          reduce
            ? undefined
            : {
                rotate: [0, 360],
                scaleX: [1, 1.25, 0.9, 1],
                scaleY: [1, 0.85, 1.2, 1],
                x: ['-12%', '10%', '-12%'],
              }
        }
        transition={{
          rotate: { duration: 34, repeat: Infinity, ease: 'linear' },
          scaleX: { duration: 19, repeat: Infinity, ease: 'easeInOut' },
          scaleY: { duration: 17, repeat: Infinity, ease: 'easeInOut' },
          x: { duration: 23, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      <motion.div
        className="absolute -bottom-1/4 right-1/4 h-[52vh] w-[60vw] rounded-[58%_42%_45%_55%/45%_55%_45%_55%] blur-[100px]"
        style={{ background: c(Math.round(s.wave * 0.78)) }}
        animate={
          reduce
            ? undefined
            : {
                rotate: [360, 0],
                scaleX: [1, 0.88, 1.18, 1],
                scaleY: [1, 1.22, 0.9, 1],
                x: ['10%', '-10%', '10%'],
              }
        }
        transition={{
          rotate: { duration: 41, repeat: Infinity, ease: 'linear' },
          scaleX: { duration: 21, repeat: Infinity, ease: 'easeInOut' },
          scaleY: { duration: 24, repeat: Infinity, ease: 'easeInOut' },
          x: { duration: 27, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  );
}
