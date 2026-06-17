'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@nextpayments/ui/components/button';

import { useRouter } from '@/i18n/routing';
import { cancelWithdrawAction } from '@/lib/fund/actions';

type WithdrawCancelButtonProps = {
  /** Withdrawal id from the history row (see the table's id extraction). */
  withdrawId: string;
};

/**
 * Inline cancel control for a pending withdrawal row (`DELETE /fund/withdraw/:id`).
 * Two-step: "Cancel" → "Confirm / Keep" so a stray click never cancels money.
 * The backend is the authority on cancellability — a refusal surfaces as a
 * toast rather than being pre-judged here. On success it `router.refresh()`es so
 * the server-rendered row reflects the new status.
 */
export function WithdrawCancelButton({ withdrawId }: WithdrawCancelButtonProps) {
  const t = useTranslations('dashboard.transactions.cancel');
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  const onConfirm = async () => {
    setPending(true);
    const result = await cancelWithdrawAction(withdrawId);
    setPending(false);
    if (result.ok) {
      setConfirming(false);
      toast.success(t('success'));
      router.refresh();
      return;
    }
    toast.error(result.reason === 'invalid' ? t('notCancellable') : t('error'));
  };

  if (!confirming) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        {t('action')}
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        loading={pending}
        onClick={() => void onConfirm()}
      >
        {pending ? t('cancelling') : t('confirm')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => setConfirming(false)}
      >
        {t('keep')}
      </Button>
    </div>
  );
}
