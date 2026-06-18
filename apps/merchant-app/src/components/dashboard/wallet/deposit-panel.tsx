'use client';

import { Info, QrCode } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useTransition } from 'react';

import { Button } from '@nextpayments/ui/components/button';
import { Card } from '@nextpayments/ui/components/card';
import { SelectField } from '@nextpayments/ui/components/select-field';

import { FUND_QR_SIZE_PX, TOPUP_ASSETS, fundAssetValue, type FundAsset } from '@/constants/fund';
import { getDepositAddressAction } from '@/lib/fund/actions';
import { ReadOnlyField } from '@/components/dashboard/integrations/read-only-field';

type DepositPanelProps = {
  /** Selected (network, coin) — lifted so a balance row's "Receive" can set it. */
  asset: FundAsset;
  onAssetChange: (asset: FundAsset) => void;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; address: string; memo?: string }
  | { kind: 'unsupported' }
  | { kind: 'error' };

function assetFromValue(value: string): FundAsset {
  return TOPUP_ASSETS.find((a) => fundAssetValue(a) === value) ?? TOPUP_ASSETS[0]!;
}

/**
 * Topup / Deposit — the primary Wallet surface. Pick a (network, coin) and
 * fetch the deposit address (`POST /fund/get-fee-address`) with a scannable
 * QR. Degrades calmly when the backend reports the pair is
 * not enabled (`FUER006`): a notice instead of an address. No live polling —
 * deposits credit the balance only after on-chain confirmations (webhook), so
 * the panel states that rather than faking a status.
 */
export function DepositPanel({ asset, onAssetChange }: DepositPanelProps) {
  const t = useTranslations('dashboard.wallet.deposit');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [pending, startTransition] = useTransition();

  const options = TOPUP_ASSETS.map((a) => ({
    value: fundAssetValue(a),
    label: t('assetOption', { coin: a.coin, network: a.network }),
  }));

  const getAddress = () => {
    setStatus({ kind: 'loading' });
    startTransition(async () => {
      const result = await getDepositAddressAction({ network: asset.network, coin: asset.coin });
      if (result.ok) {
        setStatus({ kind: 'ready', address: result.address, memo: result.memo });
      } else if (result.reason === 'unsupported') {
        setStatus({ kind: 'unsupported' });
      } else {
        setStatus({ kind: 'error' });
      }
    });
  };

  return (
    <Card glow={false} className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">{t('title')}</h2>
        <p className="text-sm text-[var(--color-text-muted)]">{t('subtitle')}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
            {t('asset')}
          </span>
          <SelectField
            aria-label={t('asset')}
            value={fundAssetValue(asset)}
            options={options}
            onChange={(e) => {
              onAssetChange(assetFromValue(e.target.value));
              setStatus({ kind: 'idle' });
            }}
            className="w-full"
          />
        </label>
        <Button
          type="button"
          variant="primary"
          size="md"
          loading={pending}
          leftIcon={<QrCode className="h-4 w-4" />}
          onClick={getAddress}
        >
          {t('getAddress')}
        </Button>
      </div>

      {status.kind === 'ready' && (
        <div className="mt-1 flex flex-col items-center gap-4 pt-2 sm:flex-row sm:items-start">
          <div className="shrink-0 rounded-2xl bg-white p-3">
            <QRCodeSVG
              value={status.address}
              size={FUND_QR_SIZE_PX}
              level="M"
              aria-label={t('qrAlt')}
            />
          </div>
          <div className="flex w-full min-w-0 flex-col gap-3">
            <ReadOnlyField
              label={t('addressLabel', { coin: asset.coin, network: asset.network })}
              value={status.address}
              copyable
              monospace
              truncate
              copyLabel={t('copy')}
            />
            {status.memo ? (
              <ReadOnlyField
                label={t('memoLabel')}
                value={status.memo}
                copyable
                monospace
                copyLabel={t('copy')}
              />
            ) : null}
            <p className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t('confirmationsNote', { coin: asset.coin, network: asset.network })}
            </p>
          </div>
        </div>
      )}

      {status.kind === 'unsupported' && (
        <p className="rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
          {t('unavailable', { coin: asset.coin, network: asset.network })}
        </p>
      )}

      {status.kind === 'error' && (
        <p className="rounded-xl border border-[var(--color-danger)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {t('error')}
        </p>
      )}
    </Card>
  );
}
