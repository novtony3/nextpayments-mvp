'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from 'framer-motion';

import { cn } from '@nextpayments/ui/lib/utils';

/* Tuning — kept here so the whole card feel retunes in one place. */
const TILT_DEG = 6; // max 3D tilt at the card edges
const SPOTLIGHT_RADIUS = 360; // px, pointer-follow glow
const SPRING = { stiffness: 150, damping: 18, mass: 0.3 } as const;

interface SpotlightCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  /** Spotlight tint. Defaults to the single accent token. */
  glowColor?: string;
  /**
   * Force the ambient wash + accent border on without a pointer — lets a
   * parent drive a "highlighted" state (e.g. an auto-cycling active card).
   */
  active?: boolean;
}

/**
 * Glass card with a pointer-following accent spotlight and a subtle 3D tilt.
 * Continuous pointer values are driven by motion values (never React state),
 * so it stays smooth and never re-renders the tree. Tilt + spotlight collapse
 * to a static glass surface under `prefers-reduced-motion`.
 */
export function SpotlightCard({
  className,
  children,
  glowColor = 'var(--color-accent)',
  active = false,
  ...props
}: SpotlightCardProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useMotionValue(0);
  const sy = useMotionValue(0);
  const glow = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [0, 1], [TILT_DEG, -TILT_DEG]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-TILT_DEG, TILT_DEG]), SPRING);

  const spotlight = useMotionTemplate`radial-gradient(${SPOTLIGHT_RADIUS}px circle at ${sx}px ${sy}px, color-mix(in oklab, ${glowColor} 24%, transparent), transparent 68%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    px.set(x / rect.width);
    py.set(y / rect.height);
    sx.set(x);
    sy.set(y);
    glow.set(1);
  }

  function handleLeave() {
    px.set(0.5);
    py.set(0.5);
    glow.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--glass-fill)] backdrop-blur-xl',
        'transition-colors duration-300 hover:border-[color-mix(in_oklab,var(--color-accent)_45%,transparent)]',
        active && 'border-[color-mix(in_oklab,var(--color-accent)_45%,transparent)]',
        className,
      )}
      {...props}
    >
      {/* Ambient colour wash — fills the card on hover. Driven by CSS hover so
          it works even under reduced motion (it is a colour fade, not motion). */}
      <span
        aria-hidden
        style={{
          background: `radial-gradient(125% 85% at 50% 0%, color-mix(in oklab, ${glowColor} 20%, transparent), transparent 72%)`,
        }}
        className={cn(
          'pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-500',
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      />
      {/* Pointer-following spotlight (skips under reduced motion). */}
      <motion.span
        aria-hidden
        style={{ background: spotlight, opacity: glow }}
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-300"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] shadow-[inset_0_1px_0_var(--glass-highlight)]"
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
