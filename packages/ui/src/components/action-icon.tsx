'use client';

import * as React from 'react';

import { cn } from '../lib/utils';

export interface ActionIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for a11y — icon-only buttons must announce their purpose. */
  'aria-label': string;
  /** The single icon element to render. */
  icon: React.ReactNode;
  /** Destructive tone — red on hover. */
  tone?: 'default' | 'danger';
  /** Square dimension. Defaults to 32px to match dense table rows. */
  size?: 'sm' | 'md';
}

/**
 * Compact icon button for table-row actions (Edit, Manage, Delete, …).
 *
 * The hover/focus feel comes from the shared `action-icon` utility in
 * `theme.css` (single source of truth → tune `--interaction-*` once and
 * every consumer follows). The `tone="danger"` variant stacks the
 * `action-icon-danger` utility on top, overriding hover colors only.
 *
 * Framework-agnostic — used by Next merchant app today; the Vite admin app
 * can adopt it the same way.
 */
export const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(
  ({ icon, tone = 'default', size = 'sm', className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)]',
        'focus-ring [--focus-ring-offset:var(--color-surface)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        'action-icon',
        tone === 'danger' && 'action-icon-danger',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  ),
);

ActionIcon.displayName = 'ActionIcon';
