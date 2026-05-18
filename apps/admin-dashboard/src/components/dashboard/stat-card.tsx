import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

import { cn } from '@nextpayments/ui/lib/utils';

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean;
  deltaCaption: string;
  icon: LucideIcon;
};

/** Single overview metric tile — Gemini glass surface, restrained accent. */
export function StatCard({
  label,
  value,
  delta,
  deltaUp,
  deltaCaption,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors duration-300 hover:border-[var(--color-border-strong)]">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
      </div>
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-[var(--color-text)]">
        {value}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 font-medium',
            deltaUp ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
          )}
        >
          {deltaUp ? (
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2} />
          )}
          {delta}
        </span>
        <span className="text-[var(--color-text-subtle)]">{deltaCaption}</span>
      </p>
    </div>
  );
}
