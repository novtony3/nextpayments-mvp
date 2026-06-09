import type { LucideIcon } from 'lucide-react';

import { Card } from '@nextpayments/ui/components/card';

/** Semantic tone for the icon tile — maps to a theme token (never raw hex). */
export type StatTone = 'success' | 'info' | 'warning' | 'danger' | 'accent';

const TONE_COLOR: Record<StatTone, string> = {
  success: 'var(--color-success)',
  info: 'var(--color-brand-blue)',
  warning: 'var(--color-brand-orange)',
  danger: 'var(--color-danger)',
  accent: 'var(--color-accent)',
};

type StatCardProps = {
  icon: LucideIcon;
  tone: StatTone;
  /** Already-localized label, value and (optional) caption. */
  label: string;
  value: string;
  caption?: string;
};

/**
 * Dashboard metric card — a colored icon tile + label + big value + caption on
 * the shared glassy `Card`. Tones resolve to theme tokens so it adapts to
 * light/dark. Reusable by any stat surface (the Home overview uses four).
 */
export function StatCard({ icon: Icon, tone, label, value, caption }: StatCardProps) {
  return (
    <Card glow={false} className="flex items-start gap-4 px-5 py-4">
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: TONE_COLOR[tone] }}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="flex min-w-0 flex-col">
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
        <p className="mt-0.5 truncate text-2xl font-semibold text-[var(--color-text)]">{value}</p>
        {caption && <p className="mt-1 text-xs text-[var(--color-text-subtle)]">{caption}</p>}
      </div>
    </Card>
  );
}
