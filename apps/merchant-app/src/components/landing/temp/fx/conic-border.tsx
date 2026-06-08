'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@nextpayments/ui/lib/utils';

const SPIN_SECONDS = 7; // one full rotation of the gradient ring

interface ConicBorderProps {
  children: React.ReactNode;
  className?: string;
  /** Inner surface class (the panel sitting inside the gradient ring). */
  innerClassName?: string;
  /** Stops for the conic sweep. Defaults to the brand aurora. */
  stops?: string;
}

/**
 * Animated gradient ring wrapper. A conic-gradient layer spins behind a 1px
 * padded frame; the inner panel covers the centre so only the hairline ring
 * shows the moving gradient. Under reduced motion the ring is static.
 *
 * The brand aurora is licensed here as a deliberate web3 "hero moment"
 * (PLAN §4.2) — used on featured surfaces only, not every card.
 */
export function ConicBorder({
  children,
  className,
  innerClassName,
  stops = 'var(--color-brand-cyan), var(--color-brand-blue), var(--color-brand-lilac), var(--color-brand-coral), var(--color-brand-cyan)',
}: ConicBorderProps) {
  const reduce = useReducedMotion();

  return (
    <div className={cn('relative overflow-hidden rounded-[var(--radius-2xl)] p-px', className)}>
      <motion.span
        aria-hidden
        animate={reduce ? undefined : { rotate: 360 }}
        transition={
          reduce ? undefined : { duration: SPIN_SECONDS, repeat: Infinity, ease: 'linear' }
        }
        style={{ background: `conic-gradient(from 0deg, ${stops})` }}
        className="absolute inset-[-60%] z-0 opacity-70"
      />
      <div
        className={cn(
          'relative z-10 h-full rounded-[calc(var(--radius-2xl)-1px)] bg-[var(--color-surface)]',
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
