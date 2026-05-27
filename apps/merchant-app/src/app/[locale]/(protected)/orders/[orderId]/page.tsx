import { ORDERS_PARAM } from '@/constants/orders';
import { OrderDetailView } from '@/components/dashboard/orders/order-detail-view';
import { loadOrderForUser } from '@/lib/orders/backend';

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Order detail — Server Component. The backend has no JWT detail route; the
 * helper walks `/me` pages to find by `orderId` (capped). `?integrationId=`
 * narrows the search when the caller already knows the integration.
 */
export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { orderId } = await params;
  const sp = await searchParams;
  const integrationId = first(sp[ORDERS_PARAM.INTEGRATION]);

  const result = await loadOrderForUser(orderId, { integrationId });

  return <OrderDetailView orderId={orderId} result={result} />;
}
