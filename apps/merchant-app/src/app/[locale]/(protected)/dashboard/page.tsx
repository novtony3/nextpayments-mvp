import { getCurrentUser } from '@/lib/auth/session';
import { loadFundBalance, loadSpendableBalance } from '@/lib/fund/backend';
import { loadOrderStats } from '@/lib/orders/backend';
import { OrderStatsPanel } from '@/components/dashboard/orders/order-stats-panel';
import { WalletView } from '@/components/dashboard/wallet/wallet-view';

/**
 * Wallet dashboard — Topup-first. The Fund wallet (deposit address + balances
 * + withdraw) is the primary surface, fed by `GET /fund/balance` and the
 * deposit/withdraw actions; order stats (`/orders/me/stats`) sit below. Reads
 * run in parallel and never throw into the tree (degraded notices instead).
 */
export default async function DashboardPage() {
  const [balanceResult, user, stats, spendableResult] = await Promise.all([
    loadFundBalance(),
    getCurrentUser(),
    loadOrderStats({}),
    loadSpendableBalance(),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <WalletView
        balances={balanceResult.ok ? balanceResult.balances : []}
        balancesOk={balanceResult.ok}
        spendableBalances={spendableResult.ok ? spendableResult.balances : []}
        gaEnabled={user?.gaEnabled ?? false}
      />
      <OrderStatsPanel result={stats} />
    </div>
  );
}
