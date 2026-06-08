'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from 'framer-motion';

import { cn } from '@nextpayments/ui/lib/utils';

const PULL = 0.3; // fraction of the cursor offset the element follows
const SPRING = { stiffness: 220, damping: 16, mass: 0.4 } as const;

/**
 * Wraps an interactive element so it drifts toward the cursor on hover and
 * springs back on leave. Pointer values run on motion values (no re-render).
 * Disabled entirely under `prefers-reduced-motion`.
 */
export function Magnetic({ children, className, ...props }: HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * PULL);
    y.set((e.clientY - (rect.top + rect.height / 2)) * PULL);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={reduce ? undefined : { x: sx, y: sy }}
      className={cn('inline-flex', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
