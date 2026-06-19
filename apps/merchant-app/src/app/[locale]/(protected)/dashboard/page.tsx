import { getCurrentUser } from '@/lib/auth/session';
import { loadFundBalance, loadSpendableBalance } from '@/lib/fund/backend';
import { loadOrderStats } from '@/lib/orders/backend';
import { OrderStatsPanel } from '@/components/dashboard/orders/order-stats-panel';
import { WalletView } from '@/components/dashboard/wallet/wallet-view';

/**
 * Wallet dashboard — Topup-first. The Fund wallet is the primary surface; order
 * stats (`/orders/me/stats`) sit below. Reads run in parallel and never throw
 * into the tree (degraded notices instead).
 *
 * Two balance tracks feed the two wallet tabs: the **Top-up** tab shows the
 * fee-balance (`/fund/fee-balance`, the funds available to pay for transactions)
 * via {@link loadFundBalance}; the **Withdraw** tab shows the spendable balance
 * (`/fund/balance`, the withdrawable funds) via {@link loadSpendableBalance},
 * which also drives the withdraw form's available + Max.
 */
export default async function DashboardPage() {
  const [user, stats, feeResult, spendableResult] = await Promise.all([
    getCurrentUser(),
    loadOrderStats({}),
    loadFundBalance(),
    loadSpendableBalance(),
  ]);

  const feeBalances = feeResult.ok ? feeResult.balances : [];
  const spendable = spendableResult.ok ? spendableResult.balances : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <WalletView
        feeBalances={feeBalances}
        feeBalancesOk={feeResult.ok}
        spendableBalances={spendable}
        spendableBalancesOk={spendableResult.ok}
        gaEnabled={user?.gaEnabled ?? false}
      />
      <OrderStatsPanel result={stats} />
    </div>
  );
}
