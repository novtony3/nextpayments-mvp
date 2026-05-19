'use client';

import * as React from 'react';

import { cn } from '../lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional leading icon (rendered in an accent-soft chip). */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Primary action(s) — e.g. an "Add" Button. */
  action?: React.ReactNode;
}

/**
 * Centered empty-state block: icon chip, title, optional description, and an
 * action slot. Token-styled to match the Gemini concept; framework-agnostic
 * so any list/table can reuse it.
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col items-center gap-3 px-6 py-16 text-center', className)}
      {...props}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        >
          {icon}
        </span>
      )}
      <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  ),
);

EmptyState.displayName = 'EmptyState';
