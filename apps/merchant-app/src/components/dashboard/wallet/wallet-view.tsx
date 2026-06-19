'use client';

import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Button } from '@nextpayments/ui/components/button';
import { Tabs } from '@nextpayments/ui/components/tabs';

import {
  DEFAULT_FUND_NETWORK,
  FUND_ASSETS,
  TOPUP_ASSETS,
  TOPUP_COINS,
  type FundAsset,
} from '@/constants/fund';
import type { BalanceRow } from '@/lib/fund/types';
import { BalancesView } from '@/components/dashboard/balances/balances-view';

import { DepositPanel } from './deposit-panel';
import { WithdrawSheet } from './withdraw-sheet';

/** Wallet sections. Each tab owns one balance track: Top-up funds the wallet
 * (deposit + fee-balance), Withdraw sends spendable funds out. */
const WALLET_TAB = { WITHDRAW: 'withdraw', TOPUP: 'topup' } as const;
type WalletTab = (typeof WALLET_TAB)[keyof typeof WALLET_TAB];

type WalletViewProps = {
  /** Fee-reserve balances (`/fund/fee-balance`) shown on the Top-up tab — the
   * funds available to pay for transactions. */
  feeBalances: BalanceRow[];
  /** False when the fee-balance read failed (degraded notice in the list). */
  feeBalancesOk: boolean;
  /** Spendable balances (`/fund/balance`) shown on the Withdraw tab, and driving
   * the withdraw form's available + Max — the withdrawable funds. */
  spendableBalances: BalanceRow[];
  /** False when the spendable-balance read failed (degraded notice in the list). */
  spendableBalancesOk: boolean;
  /** Account 2FA state — gates the withdraw `token2fa` field. */
  gaEnabled: boolean;
};

/** Best withdraw (network, coin) for a coin ticker, falling back to the default
 * network — uses the full {@link FUND_ASSETS} catalog. */
function assetForCoin(coin: string): FundAsset {
  return FUND_ASSETS.find((a) => a.coin === coin) ?? { network: DEFAULT_FUND_NETWORK, coin };
}

/** Best top-up (network, coin) for a depositable coin; falls back to the default
 * top-up asset (the Receive affordance is gated to {@link TOPUP_COINS}). */
function topupAssetForCoin(coin: string): FundAsset {
  return TOPUP_ASSETS.find((a) => a.coin === coin) ?? TOPUP_ASSETS[0]!;
}

/**
 * Wallet — two tabs, each owning one balance track on the same user wallet.
 *
 * - **Top-up** (default): fund the wallet. The deposit panel (`get-address`)
 *   credits the wallet; the balances list shows the fee-balance (the funds
 *   available to pay for transactions). A row's Receive focuses the deposit
 *   panel on that coin.
 * - **Withdraw**: send spendable funds (`/fund/balance`) out. A primary trigger
 *   and each row's Send open the withdraw sheet (request → email approval →
 *   cancel-while-pending, all wired elsewhere).
 *
 * Top-up is the default so users land on the funding surface, not the (possibly
 * empty) withdrawable list.
 */
export function WalletView({
  feeBalances,
  feeBalancesOk,
  spendableBalances,
  spendableBalancesOk,
  gaEnabled,
}: WalletViewProps) {
  const t = useTranslations('dashboard.wallet');
  const [tab, setTab] = useState<WalletTab>(WALLET_TAB.TOPUP);
  const [depositAsset, setDepositAsset] = useState<FundAsset>(TOPUP_ASSETS[0]!);
  const [withdrawAsset, setWithdrawAsset] = useState<FundAsset>(FUND_ASSETS[0]!);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const tabItems = useMemo(
    () => [
      { value: WALLET_TAB.WITHDRAW, label: t('tabs.withdraw') },
      { value: WALLET_TAB.TOPUP, label: t('tabs.topup') },
    ],
    [t],
  );

  const openWithdraw = (coin?: string) => {
    if (coin) setWithdrawAsset(assetForCoin(coin));
    setWithdrawOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">{t('title')}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{t('subtitle')}</p>
      </div>

      <Tabs
        aria-label={t('title')}
        items={tabItems}
        value={tab}
        onValueChange={(value) => setTab(value as WalletTab)}
        className="justify-center"
      />

      {tab === WALLET_TAB.TOPUP ? (
        <div className="flex flex-col gap-8">
          <DepositPanel asset={depositAsset} onAssetChange={setDepositAsset} />

          <BalancesView
            balances={feeBalances}
            ok={feeBalancesOk}
            canReceive={(coin) => TOPUP_COINS.includes(coin)}
            onReceive={(coin) => setDepositAsset(topupAssetForCoin(coin))}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="md"
              leftIcon={<ArrowUpRight className="h-4 w-4" />}
              onClick={() => openWithdraw()}
            >
              {t('withdraw.trigger')}
            </Button>
          </div>

          <BalancesView
            balances={spendableBalances}
            ok={spendableBalancesOk}
            canSend={() => true}
            onSend={(coin) => openWithdraw(coin)}
          />
        </div>
      )}

      <WithdrawSheet
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        gaEnabled={gaEnabled}
        initialAsset={withdrawAsset}
        spendableBalances={spendableBalances}
      />
    </div>
  );
}
