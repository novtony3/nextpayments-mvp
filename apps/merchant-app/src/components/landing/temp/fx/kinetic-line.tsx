'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@nextpayments/ui/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as const;
const STAGGER = 0.055; // per-word delay
const WORD_DURATION = 0.8;

interface KineticLineProps {
  text: string;
  className?: string;
  /** Delay before this line's words start, seconds. */
  delay?: number;
  /** Render the words in the animated web3 gradient (hero emphasis). */
  gradient?: boolean;
}

/**
 * Splits a line into words that rise into place with a staggered mask reveal.
 * Runs on mount (above-the-fold hero copy). The container carries the readable
 * label; the animated words are aria-hidden so screen readers get clean text.
 * Under reduced motion the words render instantly in place.
 */
export function KineticLine({ text, className, delay = 0, gradient = false }: KineticLineProps) {
  const reduce = useReducedMotion();
  const words = text.split(' ');

  return (
    <span className={cn('inline', className)} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            aria-hidden
            className={cn('inline-block', gradient && 'text-gradient-web3')}
            initial={reduce ? false : { y: '115%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: WORD_DURATION, ease: EASE, delay: delay + i * STAGGER }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
