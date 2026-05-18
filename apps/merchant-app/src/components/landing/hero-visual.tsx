'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowDownLeft, Check } from 'lucide-react';

import { DEMO_TX } from '@/constants/landing';

/**
 * Floating glass receipt — an illustrative "payment received" card that
 * drifts gently to add depth under the hero headline. Display-only; values
 * from `DEMO_TX`, labels from i18n. Static under `prefers-reduced-motion`.
 */
export function HeroVisual() {
  const t = useTranslations('landing.hero.demo');
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28, filter: 'blur(8px)' }}
      animate={reduce ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mt-16 w-full max-w-sm"
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill-strong)] p-5 text-left shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <ArrowDownLeft className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)]">
              {t('received')}
            </p>
            <p className="truncate font-mono text-xs text-[var(--color-text-subtle)]">
              {DEMO_TX.ADDRESS}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-mono text-sm font-semibold text-[var(--color-text)]">
              {DEMO_TX.AMOUNT} {DEMO_TX.TICKER}
            </p>
            <p className="font-mono text-xs text-[var(--color-text-subtle)]">
              {DEMO_TX.FIAT}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[var(--glass-border)] pt-3">
          <Check className="h-3.5 w-3.5 text-[var(--color-success)]" strokeWidth={2.25} />
          <span className="text-xs text-[var(--color-text-muted)]">{t('confirmed')}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
