'use client';

import * as React from 'react';

import { cn } from '../lib/utils';

export type TabItem = {
  value: string;
  label: string;
  /** Optional leading icon. */
  icon?: React.ReactNode;
};

export interface TabsProps {
  items: ReadonlyArray<TabItem>;
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name for the tablist. */
  'aria-label': string;
  className?: string;
}

/**
 * Underlined tab bar (`role="tablist"`). Roving arrow-key navigation; the
 * active tab gets the single accent underline + text, idle tabs are muted.
 * Framework-agnostic — the caller owns the panel and `value` state.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ items, value, onValueChange, className, ...props }, ref) => {
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const i = items.findIndex((item) => item.value === value);
      if (i < 0) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onValueChange(items[(i + 1) % items.length]!.value);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onValueChange(items[(i - 1 + items.length) % items.length]!.value);
      }
    };

    return (
      <div
        ref={ref}
        role="tablist"
        onKeyDown={onKeyDown}
        className={cn('flex items-center gap-6 border-b border-[var(--color-border)]', className)}
        {...props}
      >
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onValueChange(item.value)}
              className={cn(
                '-mb-px inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors duration-200',
                'focus-ring',
                active
                  ? 'border-[var(--color-accent)] text-[var(--color-text)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';
