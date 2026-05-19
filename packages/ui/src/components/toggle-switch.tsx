'use client';

import * as React from 'react';

import { cn } from '../lib/utils';

export interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Accessible name for the switch. */
  'aria-label': string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Accessible on/off switch (`role="switch"`, `aria-checked`). Single-accent
 * Gemini styling: the track fills with `--color-accent` when on, the knob
 * glides with calm motion (honors reduced-motion). Framework-agnostic.
 */
export const ToggleSwitch = React.forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  ({ checked, onCheckedChange, disabled, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
        'border border-[var(--glass-border)] transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--glass-fill-strong)]',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm',
          'transition-transform duration-200 motion-reduce:transition-none',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  ),
);

ToggleSwitch.displayName = 'ToggleSwitch';
