import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '../lib/utils';

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Accessible checkbox — a native `<input type="checkbox">` visually hidden
 * behind a styled glass box, so react-hook-form's `register()` spreads straight
 * onto it (ref + name + onChange) exactly like a text input. Single-accent
 * Gemini styling: the box fills with `--color-accent` when checked, the tick
 * fades in. The box and tick are general siblings of the input so Tailwind's
 * `peer-*` state variants drive them. Framework-agnostic (no `next/*`).
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
      <input
        ref={ref}
        type="checkbox"
        className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          'h-5 w-5 rounded-md border bg-[var(--glass-fill-strong)] backdrop-blur-md transition-colors duration-150',
          'border-[var(--color-border-strong)]',
          'peer-hover:border-[var(--color-accent)]',
          'peer-focus-visible:border-[var(--color-accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-accent-soft)]',
          'peer-checked:border-[var(--color-accent)] peer-checked:bg-[var(--color-accent)]',
          'peer-disabled:opacity-50',
          className,
        )}
      />
      <Check
        aria-hidden="true"
        strokeWidth={3}
        className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
      />
    </span>
  ),
);

Checkbox.displayName = 'Checkbox';
