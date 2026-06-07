'use client';

import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@nextpayments/ui/components/button';

import { DEFAULT_FUND_NETWORK, FUND_ASSETS, type FundAsset } from '@/constants/fund';
import type { BalanceRow } from '@/lib/fund/types';
import { BalancesView } from '@/components/dashboard/balances/balances-view';

import { DepositPanel } from './deposit-panel';
import { WithdrawSheet } from './withdraw-sheet';

type WalletViewProps = {
  balances: BalanceRow[];
  /** False when the balance read failed (degraded notice in the list). */
  balancesOk: boolean;
  /** Account 2FA state — gates the withdraw `token2fa` field. */
  gaEnabled: boolean;
};

/** Best (network, coin) for a coin ticker, falling back to the default network. */
function assetForCoin(coin: string): FundAsset {
  return FUND_ASSETS.find((a) => a.coin === coin) ?? { network: DEFAULT_FUND_NETWORK, coin };
}

/**
 * Wallet — Topup-first. The deposit panel is the primary surface (default
 * action), with the live balances list below and withdrawal behind a sheet.
 * A balance row's Receive focuses the deposit panel on that coin; Send opens
 * the withdraw sheet pre-set to it.
 */
export function WalletView({ balances, balancesOk, gaEnabled }: WalletViewProps) {
  const t = useTranslations('dashboard.wallet');
  const [depositAsset, setDepositAsset] = useState<FundAsset>(FUND_ASSETS[0]!);
  const [withdrawAsset, setWithdrawAsset] = useState<FundAsset>(FUND_ASSETS[0]!);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const openWithdraw = (coin?: string) => {
    if (coin) setWithdrawAsset(assetForCoin(coin));
    setWithdrawOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">{t('title')}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{t('subtitle')}</p>
        </div>
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
        onReceive={(coin) => setDepositAsset(assetForCoin(coin))}
        onSend={(coin) => openWithdraw(coin)}
      />

      <WithdrawSheet
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        gaEnabled={gaEnabled}
        initialAsset={withdrawAsset}
      />
    </div>
  );
}
