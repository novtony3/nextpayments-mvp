'use client';

import { useEffect, useMemo, useRef } from 'react';
import { animate, useInView, useMotionValue, useReducedMotion } from 'framer-motion';

const DURATION = 1.6; // seconds for the count-up
const EASE = [0.16, 1, 0.3, 1] as const;

/** Split "300+", "0.5%", "No KYC" into prefix / number / suffix. */
function parseValue(value: string) {
  const match = value.match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return null;
  const prefix = match[1] ?? '';
  const rawNum = match[2];
  const suffix = match[3] ?? '';
  if (!rawNum) return null;
  const decimals = rawNum.split(/[.,]/)[1]?.length ?? 0;
  return { prefix, target: parseFloat(rawNum.replace(',', '.')), suffix, decimals };
}

/**
 * Counts a numeric stat up from zero when it scrolls into view. Non-numeric
 * values (e.g. "No KYC") render verbatim. Honors reduced motion by jumping
 * straight to the final value.
 */
export function NumberTicker({ value, className }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const parsed = useMemo(() => parseValue(value), [value]);
  const mv = useMotionValue(0);

  useEffect(() => {
    if (!parsed || !inView || !ref.current) return;
    const node = ref.current;
    const format = (v: number) => `${parsed.prefix}${v.toFixed(parsed.decimals)}${parsed.suffix}`;
    if (reduce) {
      node.textContent = format(parsed.target);
      return;
    }
    const controls = animate(mv, parsed.target, {
      duration: DURATION,
      ease: EASE,
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [inView, parsed, reduce, mv]);

  if (!parsed) return <span className={className}>{value}</span>;

  const initial = `${parsed.prefix}${(reduce ? parsed.target : 0).toFixed(parsed.decimals)}${parsed.suffix}`;
  return (
    <span ref={ref} className={className}>
      {initial}
    </span>
  );
}
