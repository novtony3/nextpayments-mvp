'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@nextpayments/ui/components/button';
import { SelectField } from '@nextpayments/ui/components/select-field';
import { Sheet } from '@nextpayments/ui/components/sheet';

import {
  EVM_ADDRESS_REGEX,
  FUND_ASSETS,
  FUND_ERROR_CODE,
  fundAssetValue,
  type FundAsset,
} from '@/constants/fund';
import { requestWithdrawAction } from '@/lib/fund/actions';
import { TextField } from '@/components/shared/text-field';

type WithdrawSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Whether the account has 2FA on — the `token2fa` field is required iff so. */
  gaEnabled: boolean;
  /** Asset the form lands on (set when opened from a balance row's Send). */
  initialAsset: FundAsset;
};

function assetFromValue(value: string): FundAsset {
  return FUND_ASSETS.find((a) => fundAssetValue(a) === value) ?? FUND_ASSETS[0]!;
}

/**
 * Withdraw — `POST /fund/withdraw`. This is the first step of an email-approval
 * flow: the backend emails an approval link; on submit we show a "check your
 * email" confirmation (the link landing page is a later phase). Backend
 * `FUER00x` codes map to the field (network/coin→asset, amount) or a banner
 * (`FUER006`); the EVM address format is gated client-side first.
 */
export function WithdrawSheet({ open, onClose, gaEnabled, initialAsset }: WithdrawSheetProps) {
  const t = useTranslations('dashboard.wallet.withdraw');
  const [submitted, setSubmitted] = useState(false);

  const schema = z.object({
    asset: z.string().min(1),
    address: z.string().regex(EVM_ADDRESS_REGEX, { message: t('errors.address') }),
    amount: z
      .number({ invalid_type_error: t('errors.amount') })
      .positive({ message: t('errors.amount') }),
    memo: z.string().optional(),
    token2fa: gaEnabled
      ? z.string().min(1, { message: t('errors.token2fa') })
      : z.string().optional(),
  });

  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { asset: fundAssetValue(initialAsset), address: '', memo: '', token2fa: '' },
  });

  // The sheet keeps its form state across open/close, so sync to the asset it
  // was opened with (e.g. a balance row's Send) and clear prior input.
  useEffect(() => {
    if (open) {
      setSubmitted(false);
      reset({ asset: fundAssetValue(initialAsset), address: '', memo: '', token2fa: '' });
    }
  }, [open, initialAsset, reset]);

  const close = () => {
    onClose();
  };

  const onSubmit = async (values: Values) => {
    const { network, coin } = assetFromValue(values.asset);
    const result = await requestWithdrawAction({
      network,
      coin,
      address: values.address,
      amount: values.amount,
      memo: values.memo,
      token2fa: values.token2fa,
    });

    if (result.ok) {
      setSubmitted(true);
      return;
    }
    if (result.reason === 'invalid') {
      const code = result.code;
      if (code === FUND_ERROR_CODE.INVALID_AMOUNT) {
        setError('amount', { message: t('errors.amount') });
      } else if (
        code === FUND_ERROR_CODE.INVALID_NETWORK ||
        code === FUND_ERROR_CODE.INVALID_COIN
      ) {
        setError('asset', { message: t('errors.asset') });
      } else if (code === FUND_ERROR_CODE.NOT_SUPPORTED) {
        setError('asset', { message: t('errors.unsupported', { coin, network }) });
      } else {
        toast.error(t('errors.generic'));
      }
      return;
    }
    toast.error(t('errors.generic'));
  };

  const assetOptions = FUND_ASSETS.map((a) => ({
    value: fundAssetValue(a),
    label: t('assetOption', { coin: a.coin, network: a.network }),
  }));

  return (
    <Sheet open={open} onClose={close} title={t('title')} closeLabel={t('close')}>
      {submitted ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <MailCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="text-lg font-semibold text-[var(--color-text)]">{t('emailSentTitle')}</h3>
          <p className="max-w-sm text-sm text-[var(--color-text-muted)]">{t('emailSentBody')}</p>
          <Button type="button" variant="primary" size="md" onClick={close}>
            {t('done')}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--color-text)]">{t('asset')}</span>
            <SelectField
              aria-label={t('asset')}
              options={assetOptions}
              {...register('asset')}
              className="w-full"
            />
            {errors.asset?.message && (
              <p role="alert" className="text-xs text-[var(--color-danger)]">
                {errors.asset.message}
              </p>
            )}
          </label>

          <TextField
            id="withdraw-address"
            label={t('address')}
            placeholder={t('addressPlaceholder')}
            autoComplete="off"
            spellCheck={false}
            error={errors.address?.message}
            {...register('address')}
          />

          <TextField
            id="withdraw-amount"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            label={t('amount')}
            placeholder={t('amountPlaceholder')}
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />

          <TextField
            id="withdraw-memo"
            label={t('memo')}
            placeholder={t('memoPlaceholder')}
            autoComplete="off"
            {...register('memo')}
          />

          {gaEnabled && (
            <TextField
              id="withdraw-2fa"
              inputMode="numeric"
              autoComplete="one-time-code"
              label={t('token2fa')}
              placeholder={t('token2faPlaceholder')}
              error={errors.token2fa?.message}
              {...register('token2fa')}
            />
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" size="md" onClick={close}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </form>
      )}
    </Sheet>
  );
}
