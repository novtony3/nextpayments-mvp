'use client';

import { Eye, EyeOff } from 'lucide-react';

type PasswordToggleProps = {
  /** Whether the password is currently revealed. */
  shown: boolean;
  /** Toggle handler. */
  onToggle: () => void;
  /** Localized aria-label when the password is hidden (action: show). */
  labelShow: string;
  /** Localized aria-label when the password is shown (action: hide). */
  labelHide: string;
};

/**
 * Reusable show/hide eye button. Drop into a `TextField`'s `trailing` slot.
 * Shared by every password input so the markup/position stays consistent.
 */
export function PasswordToggle({ shown, onToggle, labelShow, labelHide }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? labelHide : labelShow}
      className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--glass-fill)] hover:text-[var(--color-text)]"
    >
      {shown ? (
        <EyeOff className="h-4 w-4" aria-hidden />
      ) : (
        <Eye className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
