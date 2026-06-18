'use client';

import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Button } from '@nextpayments/ui/components/button';
import { Card } from '@nextpayments/ui/components/card';
import { EmptyState } from '@nextpayments/ui/components/empty-state';
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

/** Wallet sections. Top-up holds all the live UI; withdraw is a placeholder
 * until its own surface is built — both are kept here so the tab values are not
 * inline literals. */
const WALLET_TAB = { WITHDRAW: 'withdraw', TOPUP: 'topup' } as const;
type WalletTab = (typeof WALLET_TAB)[keyof typeof WALLET_TAB];

type WalletViewProps = {
  balances: BalanceRow[];
  /** False when the balance read failed (degraded notice in the list). */
  balancesOk: boolean;
  /** Spendable balances (`/fund/balance`) driving the withdraw form's
   * available + Max — distinct from the fee-reserve `balances` shown in the list. */
  spendableBalances: BalanceRow[];
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
 * Wallet — split into a (placeholder) Withdraw tab and the Top-up tab that holds
 * all the live surface: the deposit panel, the live balances list, and the
 * withdraw trigger (its sheet stays mounted, opened from here). Top-up is the
 * default tab so users never land on the empty Withdraw placeholder. A balance
 * row's Receive focuses the deposit panel on that coin; Send opens the withdraw
 * sheet pre-set to it.
 */
export function WalletView({
  balances,
  balancesOk,
  spendableBalances,
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
      />

      {tab === WALLET_TAB.TOPUP ? (
        <div className="flex flex-col gap-8">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={<ArrowUpRight className="h-4 w-4" />}
              onClick={() => openWithdraw()}
            >
              {t('withdraw.trigger')}
            </Button>
          </div>

          <DepositPanel asset={depositAsset} onAssetChange={setDepositAsset} />

          <BalancesView
            balances={balances}
            ok={balancesOk}
            canReceive={(coin) => TOPUP_COINS.includes(coin)}
            onReceive={(coin) => setDepositAsset(topupAssetForCoin(coin))}
            onSend={(coin) => openWithdraw(coin)}
          />
        </div>
      ) : (
        <Card glow={false}>
          <EmptyState
            icon={<Sparkles className="h-5 w-5" />}
            title={t('withdrawTab.emptyTitle')}
            description={t('withdrawTab.emptyDescription')}
          />
        </Card>
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
