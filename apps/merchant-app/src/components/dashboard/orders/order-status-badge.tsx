'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@nextpayments/ui/lib/utils';

import type { OrderStatus } from '@/lib/orders/types';

/**
 * Per-status pill colors (theme tokens, never raw hex), mirroring the
 * security `StatusPill` formula: paid → success, pending → warning,
 * cancelled → danger, expired → muted/neutral.
 */
const STATUS_CLASS: Record<OrderStatus, string> = {
  pending:
    'border-[color-mix(in_oklab,var(--color-warning)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-warning)_18%,transparent)] text-[var(--color-warning)]',
  paid: 'border-[color-mix(in_oklab,var(--color-success)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]',
  expired: 'border-[var(--glass-border)] bg-[var(--glass-fill)] text-[var(--color-text-muted)]',
  cancelled:
    'border-[color-mix(in_oklab,var(--color-danger)_32%,transparent)] bg-[color-mix(in_oklab,var(--color-danger)_16%,transparent)] text-[var(--color-danger)]',
};

/**
 * Colored status label for the order list/detail — maps an order's lifecycle
 * state (pending/paid/expired/cancelled) to a tone and the localized label
 * (`dashboard.orders.status.<status>`). Reusable across order surfaces.
 */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations('dashboard.orders.status');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_CLASS[status],
      )}
    >
      {t(status)}
    </span>
  );
}
