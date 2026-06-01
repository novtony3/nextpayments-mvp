import { BalancesView } from '@/components/dashboard/balances/balances-view';
import { OrderStatsPanel } from '@/components/dashboard/orders/order-stats-panel';
import { loadOrderStats } from '@/lib/orders/backend';

/**
 * Wallet dashboard — order stats (live, from `/api/orders/me/stats`) above
 * the wallet balances list (still UI-only mocks until Fund is wired).
 * Stats are aggregated across all the user's integrations.
 */
export default async function DashboardPage() {
  const stats = await loadOrderStats({});

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <OrderStatsPanel result={stats} />
      <BalancesView />
    </div>
  );
}
