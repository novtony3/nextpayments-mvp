import * as React from 'react';

import { Card } from '@nextpayments/ui/components/card';
import { cn } from '@nextpayments/ui/lib/utils';

type SecurityCardProps = {
  /** Card heading (already localized by the caller). */
  title: string;
  /** Sub-heading describing the section's purpose. */
  description?: string;
  /** Optional badge pinned to the top-right (e.g. status pill). */
  badge?: React.ReactNode;
  /** Optional bottom-right action area (button row). */
  action?: React.ReactNode;
  /** Optional className for the inner content stack. */
  contentClassName?: string;
  children?: React.ReactNode;
};

/**
 * Shared chrome for every section on the /pay-settings security page. Wraps
 * the {@link Card} from `@nextpayments/ui` with a title, optional badge,
 * sub-text, content slot, and a bottom action row — so the three security
 * cards (change password, 2FA, email verification) stay visually consistent
 * without each one re-implementing the same layout.
 */
export function SecurityCard({
  title,
  description,
  badge,
  action,
  contentClassName,
  children,
}: SecurityCardProps) {
  return (
    <Card glow={false} className="flex flex-col gap-5 px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium text-[var(--color-text)]">{title}</h2>
          {description && <p className="text-sm text-[var(--color-text-muted)]">{description}</p>}
        </div>
        {badge}
      </div>
      {children && <div className={cn('flex flex-col gap-4', contentClassName)}>{children}</div>}
      {action && <div className="flex flex-wrap items-center justify-end gap-2">{action}</div>}
    </Card>
  );
}
