'use client';

import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@nextpayments/ui/lib/utils';

import { hasLocaleSwitched } from '@/lib/locale-switch';

type RiseInProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in seconds, applied as animation-delay. */
  delay?: number;
  as?: 'div' | 'span';
};

/**
 * Above-the-fold entrance (fade + rise + de-blur) driven entirely by CSS
 * (`np-hero-rise`), so it plays the instant the page paints rather than waiting
 * on framer-motion to hydrate. Use for hero copy/CTAs where first-paint speed
 * matters; below-the-fold scroll reveals stay on `Reveal`.
 *
 * Mirrors `Reveal`'s locale-switch skip: after an in-app language change the
 * subtree remounts, so we render settled instead of replaying the entrance.
 * Reduced motion is handled in CSS (the keyframes are `no-preference` only).
 */
export function RiseIn({ children, className, delay = 0, as: Tag = 'div' }: RiseInProps) {
  const animate = !hasLocaleSwitched();
  const style: CSSProperties | undefined =
    animate && delay ? { animationDelay: `${delay}s` } : undefined;

  return (
    <Tag className={cn(animate && 'np-hero-rise', className)} style={style}>
      {children}
    </Tag>
  );
}
