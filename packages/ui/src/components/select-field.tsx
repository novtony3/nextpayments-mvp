'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '../lib/utils';

export type SelectOption = {
  value: string;
  label: string;
};

export interface SelectFieldProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'children'
> {
  /** Accessible name — required (the trigger has no visible <label>). */
  'aria-label': string;
  options: ReadonlyArray<SelectOption>;
}

/**
 * Compact dropdown built on a native `<select>` — keyboard- and
 * screen-reader-accessible for free, while the chrome (glass pill + chevron)
 * follows the Gemini concept. Framework-agnostic; used for the coin filter
 * and fiat selector.
 */
export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, options, ...props }, ref) => (
    <div
      className={cn(
        'group relative inline-flex items-center rounded-full border border-[var(--glass-border)]',
        'bg-[var(--glass-fill)] backdrop-blur-md transition-colors duration-200',
        'focus-within:border-[var(--color-accent)]',
        className,
      )}
    >
      <select
        ref={ref}
        className={cn(
          'h-11 w-full cursor-pointer appearance-none rounded-full bg-transparent pl-4 pr-10',
          'text-sm font-medium text-[var(--color-text)] focus-visible:outline-none',
          '[&>option]:bg-[var(--color-surface-elevated)] [&>option]:text-[var(--color-text)]',
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 h-4 w-4 text-[var(--color-text-subtle)] transition-colors duration-200 group-focus-within:text-[var(--color-accent)]"
      />
    </div>
  ),
);

SelectField.displayName = 'SelectField';
