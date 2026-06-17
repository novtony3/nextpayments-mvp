import { getCurrentUser } from '@/lib/auth/session';
import { loadSpendableBalance } from '@/lib/fund/backend';
import { loadOrderStats } from '@/lib/orders/backend';
import { OrderStatsPanel } from '@/components/dashboard/orders/order-stats-panel';
import { WalletView } from '@/components/dashboard/wallet/wallet-view';

/**
 * Wallet dashboard — Topup-first. The Fund wallet (deposit address + balances
 * + withdraw) is the primary surface, fed by `GET /fund/balance` and the
 * deposit/withdraw actions; order stats (`/orders/me/stats`) sit below. Reads
 * run in parallel and never throw into the tree (degraded notices instead).
 *
 * Both the balances list and the withdraw form use the **spendable** balance
 * (`/fund/balance`) — the withdrawable funds. Fee-balance (`/fund/fee-balance`,
 * the gas reserve) is intentionally NOT shown here: surfacing it as "balance"
 * made users expect to withdraw gas-reserve funds that withdraw can't touch.
 */
export default async function DashboardPage() {
  const [user, stats, spendableResult] = await Promise.all([
    getCurrentUser(),
    loadOrderStats({}),
    loadSpendableBalance(),
  ]);

  const spendable = spendableResult.ok ? spendableResult.balances : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <WalletView
        balances={spendable}
        balancesOk={spendableResult.ok}
        spendableBalances={spendable}
        gaEnabled={user?.gaEnabled ?? false}
      />
      <OrderStatsPanel result={stats} />
    </div>
  );
}
