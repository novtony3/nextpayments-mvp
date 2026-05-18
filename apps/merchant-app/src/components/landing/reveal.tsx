'use client';

import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

import { hasLocaleSwitched } from '@/lib/locale-switch';

type RevealProps = MotionProps & {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'span';
};

/** Shared luxury easing — a long, settled ease-out (no overshoot). */
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll-triggered entrance: a soft fade + slight rise + gentle de-blur.
 * Entry-only and `once`, so it never animates `filter` on interaction.
 * Honors `prefers-reduced-motion` (renders instantly, no transform).
 */
export function Reveal({ children, className, delay = 0, as = 'div', ...rest }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  // Skip the entrance after an in-app locale switch so the route swap is
  // seamless (no replayed fade/blur "splash"). First-visit reveal is kept.
  if (reduce || hasLocaleSwitched()) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
