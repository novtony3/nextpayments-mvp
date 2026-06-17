import type { ReactNode } from 'react';

import { cn } from '@nextpayments/ui/lib/utils';

/** Semantic status tones — the dashboard's only status color vocabulary. */
export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

/**
 * Per-tone pill classes (theme tokens only, never raw hex). Borders/fills use a
 * `color-mix` of the semantic token; neutral falls back to the glass surface.
 */
const TONE_CLASS: Record<StatusTone, string> = {
  success:
    'border-[color-mix(in_oklab,var(--color-success)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]',
  warning:
    'border-[color-mix(in_oklab,var(--color-warning)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-warning)_18%,transparent)] text-[var(--color-warning)]',
  danger:
    'border-[color-mix(in_oklab,var(--color-danger)_32%,transparent)] bg-[color-mix(in_oklab,var(--color-danger)_16%,transparent)] text-[var(--color-danger)]',
  neutral: 'border-[var(--glass-border)] bg-[var(--glass-fill)] text-[var(--color-text-muted)]',
};

/**
 * Colored status pill — the single source of truth for the dashboard's status
 * tone formula. Domain wrappers (orders, transactions) map their own status to
 * a {@link StatusTone} and pass the localized or raw label as children.
 */
export function StatusBadge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONE_CLASS[tone],
      )}
    >
      {children}
    </span>
  );
}
