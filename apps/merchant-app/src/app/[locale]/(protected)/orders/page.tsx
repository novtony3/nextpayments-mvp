import {
  ORDERS_PAGE_SIZE,
  ORDERS_PARAM,
  ORDER_STATUS_FILTER_ALL,
  type OrderStatusFilter,
} from '@/constants/orders';
import { OrdersView } from '@/components/dashboard/orders/orders-view';
import { loadOrderListForUser } from '@/lib/orders/backend';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders/types';

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(raw: string | undefined): OrderStatusFilter {
  if (raw && (ORDER_STATUSES as readonly string[]).includes(raw)) {
    return raw as OrderStatus;
  }
  return ORDER_STATUS_FILTER_ALL;
}

/**
 * Orders — Server Component. Filters live in the URL so this re-fetches
 * server-side (authed via the session cookie, per API.md §6); a failure
 * degrades to a notice rather than throwing into the protected layout.
 *
 * `?integrationId=` is a passthrough deep-link target (e.g. from the
 * integrations table); no picker UI is rendered here yet.
 */
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const status = parseStatus(first(sp[ORDERS_PARAM.STATUS]));
  const integrationId = first(sp[ORDERS_PARAM.INTEGRATION]);
  const pageNum = Number(first(sp[ORDERS_PARAM.PAGE]));
  const page = Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1;

  const result = await loadOrderListForUser({
    page,
    limit: ORDERS_PAGE_SIZE,
    status: status === ORDER_STATUS_FILTER_ALL ? undefined : status,
    integrationId,
  });

  return <OrdersView status={status} integrationId={integrationId} result={result} />;
}
