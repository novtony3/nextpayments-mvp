import { Check, ShieldCheck, ShieldOff, X } from 'lucide-react';

import { cn } from '@nextpayments/ui/lib/utils';

type Tone = 'positive' | 'neutral' | 'warning';
type Icon = 'check' | 'cross' | 'shieldOn' | 'shieldOff';

type StatusPillProps = {
  label: string;
  tone?: Tone;
  icon?: Icon;
};

const TONE_CLASS: Record<Tone, string> = {
  positive:
    'border-[color-mix(in_oklab,var(--color-success)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]',
  neutral:
    'border-[var(--glass-border)] bg-[var(--glass-fill)] text-[var(--color-text-muted)]',
  warning:
    'border-[color-mix(in_oklab,var(--color-warning)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-warning)_18%,transparent)] text-[var(--color-warning)]',
};

const ICON_COMPONENT = {
  check: Check,
  cross: X,
  shieldOn: ShieldCheck,
  shieldOff: ShieldOff,
} as const;

/**
 * Tiny status pill reused by every security card to advertise current
 * state (verified / unverified / 2FA on / 2FA off). Centralizing the
 * styling avoids per-card duplication of the same border/bg formula.
 */
export function StatusPill({ label, tone = 'neutral', icon }: StatusPillProps) {
  const Icon = icon ? ICON_COMPONENT[icon] : null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        TONE_CLASS[tone],
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {label}
    </span>
  );
}
