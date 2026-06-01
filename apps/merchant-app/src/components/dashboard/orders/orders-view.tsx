import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';

import type { OrderStatusFilter } from '@/constants/orders';
import type { OrderListResult } from '@/lib/orders/types';

import { OrdersFilters } from './orders-filters';
import { OrdersTable } from './orders-table';

type OrdersViewProps = {
  status: OrderStatusFilter;
  integrationId?: string;
  result: OrderListResult;
};

/**
 * Orders section: status filter + table. A tunnel-down / unauthed fetch
 * degrades to a notice rather than crashing the protected layout.
 */
export function OrdersView({ status, integrationId, result }: OrdersViewProps) {
  const t = useTranslations('dashboard.orders');

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <OrdersFilters status={status} integrationId={integrationId} />

      {result.ok ? (
        <OrdersTable data={result.data} status={status} integrationId={integrationId} />
      ) : (
        <Card glow={false} className="flex items-start gap-3 bg-[var(--glass-fill)] px-5 py-4">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]"
            aria-hidden="true"
          />
          <p className="text-sm text-[var(--color-text-muted)]">{t('error')}</p>
        </Card>
      )}
    </div>
  );
}
