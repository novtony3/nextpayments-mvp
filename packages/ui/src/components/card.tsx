'use client';

import * as React from 'react';

import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Pointer-following ambient blue glow on hover (the shared card effect).
   * Calm fade, single-accent per the Gemini concept. Default `true`.
   */
  glow?: boolean;
}

/**
 * Card — the shared surface primitive. Borderless smooth surface (elevation,
 * not borders) with an optional ambient `--color-aurora` glow that tracks the
 * cursor on hover. Framework-agnostic (no `next/*`); token-styled so it adapts
 * to light/dark and is reusable by every app.
 *
 * Pointer position is written to CSS vars via the DOM node (no React state →
 * no re-render); the glow opacity is pure CSS `group-hover`.
 *
 * `children` render as DIRECT children of the surface div, so layout classes
 * passed in `className` (`flex`, `gap-*`, `items-*`, `divide-*`, `text-center`)
 * apply to them. The glow is `absolute -z-10` and the surface sets `isolate`,
 * so it paints above the card background but below the in-flow content and is
 * skipped by flex (out of flow) — no inner wrapper that would swallow layout.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = true, children, onMouseMove, ...props }, ref) => {
    const nodeRef = React.useRef<HTMLDivElement | null>(null);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        nodeRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const node = nodeRef.current;
      if (glow && node) {
        const r = node.getBoundingClientRect();
        node.style.setProperty('--card-gx', `${e.clientX - r.left}px`);
        node.style.setProperty('--card-gy', `${e.clientY - r.top}px`);
      }
      onMouseMove?.(e);
    };

    return (
      <div
        ref={setRefs}
        onMouseMove={handleMouseMove}
        className={cn(
          'group relative isolate overflow-hidden rounded-3xl bg-[var(--color-surface)] transition-colors duration-300',
          glow && 'hover:bg-[var(--color-surface-elevated)]',
          className,
        )}
        {...props}
      >
        {glow && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(280px circle at var(--card-gx, 50%) var(--card-gy, 0px), color-mix(in oklab, var(--color-aurora) 24%, transparent), transparent 72%)',
            }}
          />
        )}
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
