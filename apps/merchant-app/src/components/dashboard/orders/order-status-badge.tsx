'use client';

import { useTranslations } from 'next-intl';

import { StatusBadge, type StatusTone } from '@/components/shared/status-badge';
import type { OrderStatus } from '@/lib/orders/types';

/** Order lifecycle state → tone: paid → success, pending → warning, cancelled → danger, expired → neutral. */
const STATUS_TONE: Record<OrderStatus, StatusTone> = {
  pending: 'warning',
  paid: 'success',
  expired: 'neutral',
  cancelled: 'danger',
};

/**
 * Colored status label for the order list/detail — maps an order's lifecycle
 * state (pending/paid/expired/cancelled) to a tone and the localized label
 * (`dashboard.orders.status.<status>`). Reusable across order surfaces.
 */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations('dashboard.orders.status');
  return <StatusBadge tone={STATUS_TONE[status]}>{t(status)}</StatusBadge>;
}
