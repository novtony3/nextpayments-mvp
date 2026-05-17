'use client';

import { motion, type MotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type RevealProps = MotionProps & {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'span';
};

/**
 * Lightweight wrapper for scroll-triggered fade-in + slide-up.
 * Use sparingly — wrap whole sections or section headers, not every leaf node.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
  ...rest
}: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
