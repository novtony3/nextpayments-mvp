import type { ReactNode } from 'react';

import { Card } from '@nextpayments/ui/components/card';
import { cn } from '@nextpayments/ui/lib/utils';

type SectionPanelProps = {
  /** Already-localized panel title. */
  title: string;
  /** Optional right-aligned header action (e.g. a "View All" link). */
  action?: ReactNode;
  children: ReactNode;
  /** Extra classes for the body wrapper (padding is owned by the caller). */
  className?: string;
};

/**
 * Titled dashboard panel — a header row (title + optional action) over a body
 * slot, on the shared `Card`. The body owns its own padding so the panel can
 * wrap a list, an `EmptyState`, or a button stack uniformly. Reusable across
 * dashboard surfaces (the Home overview uses it for Recent Transactions,
 * Quick Actions and Revenue-by-coin).
 */
export function SectionPanel({ title, action, children, className }: SectionPanelProps) {
  return (
    <Card glow={false} className="flex flex-col p-0">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
        {action}
      </div>
      <div className={cn('border-t border-[var(--glass-border)]', className)}>{children}</div>
    </Card>
  );
}
