'use client';

import { Check, Copy } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { cn } from '@nextpayments/ui/lib/utils';

const COPIED_RESET_MS = 1800;

type ReadOnlyFieldProps = {
  /** Visible label (already localized). */
  label: string;
  /** Value shown inside the box. */
  value: string;
  /** Show a copy-to-clipboard button on the right. */
  copyable?: boolean;
  /** Render the value in a monospace font (Client ID/Secret, API URL, …). */
  monospace?: boolean;
  /** Truncate long values with ellipsis instead of wrapping. */
  truncate?: boolean;
  /** Custom right-aligned icon/control (e.g. the permissions key icon). */
  trailing?: ReactNode;
  /** Accessible name for the copy button (already localized). */
  copyLabel?: string;
};

/**
 * Labelled read-only field used across the Integrations completed view —
 * Name, Store URL, Permissions, API URL, Client ID, Client Secret. Visually
 * matches `SecretReveal` (same shell) but works for non-secret values too:
 * monospace toggle, optional copy button, optional trailing icon.
 */
export function ReadOnlyField({
  label,
  value,
  copyable = false,
  monospace = false,
  truncate = false,
  trailing,
  copyLabel,
}: ReadOnlyFieldProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!copyable || !value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      /* clipboard blocked — value stays selectable */
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
        {label}
      </span>
      <div className="flex items-stretch gap-2">
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center rounded-xl border border-[var(--color-border-strong)]',
            'bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] px-3 py-2.5 text-sm text-[var(--color-text)]',
            monospace && 'font-mono text-xs',
          )}
        >
          <span className={cn('flex-1 select-all', truncate ? 'truncate' : 'break-all')}>
            {value || ' ' /* preserve height when empty */}
          </span>
          {trailing && <span className="ml-2 shrink-0">{trailing}</span>}
        </div>
        {copyable && (
          <button
            type="button"
            onClick={copy}
            aria-label={copyLabel ?? 'Copy'}
            className={cn(
              'flex h-auto w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-strong)]',
              'bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] text-[var(--color-text-muted)] transition-colors',
              'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
              copied && 'border-[var(--color-accent)] text-[var(--color-accent)]',
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
