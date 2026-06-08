'use client';

import * as React from 'react';

import { cn } from '@nextpayments/ui/lib/utils';

/** Shared auth input styling — single source for every auth field. */
const AUTH_INPUT_CLASS = cn(
  'h-11 w-full rounded-xl border bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)]',
  // 16px on mobile (text-base) stops iOS Safari from auto-zooming on focus;
  // drops back to 14px (text-sm) from sm: up where the design wants it.
  'px-4 text-base text-[var(--color-text)] backdrop-blur-md transition-colors sm:text-sm',
  'placeholder:text-[var(--color-text-subtle)]',
  'border-[var(--color-border-strong)] hover:border-[var(--color-accent)]',
  'focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)]',
);

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Visible label text (already localized by the caller). */
  label: string;
  /** Validation error message; toggles the danger border + alert text. */
  error?: string;
  /** Optional element pinned inside the field (e.g. a password eye toggle). */
  trailing?: React.ReactNode;
};

/**
 * Reusable labelled input for auth forms — label, input, inline error and an
 * optional trailing slot. Forwards `ref` so react-hook-form's `register()`
 * can spread directly onto it. Keeps field markup DRY across login/register.
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, trailing, id, className, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          aria-invalid={!!error}
          className={cn(
            AUTH_INPUT_CLASS,
            trailing && 'pr-11',
            error && 'border-[var(--color-danger)]',
            className,
          )}
          {...props}
        />
        {trailing}
      </div>
      {error && (
        <p role="alert" className="text-xs text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  ),
);

TextField.displayName = 'TextField';
