'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Box } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BRAND_GRADIENT_CSS, BRAND_MONOGRAM, BRAND_NAME } from '@/constants/site';
import { HERO_CARD } from '@/constants/landing';

/**
 * Floating glassmorphic payment card — the hero's foreground object, sitting in
 * front of the 3D particle globe. Real DOM text (crisp + accessible); the card
 * itself is the always-on base of the hero visual, so the design holds up even
 * when the WebGL globe never mounts. Idle float + tilt; static under
 * `prefers-reduced-motion`.
 */
export function HeroVisual() {
  const t = useTranslations('landing.web3.hero');
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28, rotateX: 12, filter: 'blur(10px)' }}
      animate={reduce ? undefined : { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 1200 }}
      className="relative z-10 w-full max-w-[24rem]"
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -14, 0], rotateZ: [-5, -3.5, -5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ rotate: reduce ? '-5deg' : undefined }}
        className="relative aspect-[1.586/1] overflow-hidden rounded-[1.4rem] border border-white/15 bg-[var(--glass-fill-strong)] p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      >
        {/* Brand-tint wash + diagonal sheen. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: BRAND_GRADIENT_CSS }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_25%,rgba(255,255,255,0.16)_47%,transparent_60%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_var(--glass-highlight)]"
        />

        <div className="relative flex h-full flex-col justify-between text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white shadow-[0_6px_18px_-6px_rgba(0,0,0,0.6)]"
                style={{ backgroundImage: BRAND_GRADIENT_CSS }}
              >
                {BRAND_MONOGRAM}
              </span>
              <span className="text-sm font-semibold tracking-tight">{BRAND_NAME}</span>
            </div>
            <Box className="h-6 w-6 text-white/70" strokeWidth={1.5} />
          </div>

          {/* EMV-style chip. */}
          <span
            aria-hidden
            className="h-8 w-11 rounded-md border border-white/25 bg-[linear-gradient(135deg,#f7d774,#caa23c)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]"
          />

          <div>
            <p className="font-mono text-base tracking-[0.18em] text-white/90">
              {HERO_CARD.NUMBER}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/55">
              {t('cardLabel')}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
