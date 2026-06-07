import { useTranslations } from 'next-intl';

import { Notice } from '@nextpayments/ui/components/notice';

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
        <Notice tone="danger">{t('error')}</Notice>
      )}
    </div>
  );
}
