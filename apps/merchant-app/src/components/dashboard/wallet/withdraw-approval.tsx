'use client';

import { useState } from 'react';
import { CheckCircle2, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { approveWithdrawAction } from '@/lib/fund/actions';
import type { WithdrawApprovalSummary } from '@/lib/fund/types';

type Status = 'idle' | 'approving' | 'approved' | 'invalid' | 'error';

type WithdrawApprovalProps = {
  /** Single-use approval token from the email link (path segment). */
  token: string;
};

/**
 * Icon-disc tone per status (mirrors StatusPill/VerifyEmailConfirm): accent
 * while confirming/approving, success-green when approved, danger on both
 * failure modes — one source of truth instead of inlining per branch.
 */
const DISC_CLASS: Record<Status, string> = {
  idle: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  approving: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  approved:
    'bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]',
  invalid:
    'bg-[color-mix(in_oklab,var(--color-danger)_15%,transparent)] text-[var(--color-danger)]',
  error: 'bg-[color-mix(in_oklab,var(--color-danger)_15%,transparent)] text-[var(--color-danger)]',
};

/**
 * Withdrawal-approval confirmation reached from the email link
 * (`/withdraw/approve/<token>`, under the auth-guarded `(protected)` group —
 * the PUT requires the user's JWT). Money movement, so the approval is an
 * EXPLICIT button press, never auto-fired on mount: idle → approving →
 * approved / invalid (token used or expired) / error (retryable). On success it
 * surfaces whatever summary the backend returned (no GET-by-token exists to
 * show details beforehand).
 */
export function WithdrawApproval({ token }: WithdrawApprovalProps) {
  const t = useTranslations('dashboard.wallet.withdrawApproval');
  const [status, setStatus] = useState<Status>('idle');
  const [summary, setSummary] = useState<WithdrawApprovalSummary | undefined>(undefined);

  const approve = async () => {
    setStatus('approving');
    const result = await approveWithdrawAction(token);
    if (result.ok) {
      setSummary(result.summary);
      setStatus('approved');
      return;
    }
    setStatus(result.reason);
  };

  const backToWallet = (
    <Button asChild variant="ghost" size="lg" fullWidth>
      <Link href={ROUTES.DASHBOARD}>{t('backToWallet')}</Link>
    </Button>
  );

  // Confirm screen — also shown while the approve PUT is in flight (button
  // loading), so the token is only ever submitted on an explicit click.
  if (status === 'idle' || status === 'approving') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full ${DISC_CLASS[status]}`}
        >
          <ShieldCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text)]">
            {t('title')}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">{t('body')}</p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            loading={status === 'approving'}
            onClick={() => void approve()}
          >
            {status === 'approving' ? t('approving') : t('approve')}
          </Button>
          {backToWallet}
        </div>
      </div>
    );
  }

  const Icon =
    status === 'approved' ? CheckCircle2 : status === 'invalid' ? ShieldAlert : TriangleAlert;
  const title =
    status === 'approved'
      ? t('successTitle')
      : status === 'invalid'
        ? t('invalidTitle')
        : t('errorTitle');
  const body =
    status === 'approved'
      ? t('successBody')
      : status === 'invalid'
        ? t('invalidBody')
        : t('errorBody');

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full ${DISC_CLASS[status]}`}
      >
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text)]">{title}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{body}</p>
      </div>

      {status === 'approved' && summary && (summary.amount || summary.address) && (
        <dl className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left text-sm">
          {summary.amount && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--color-text-muted)]">{t('summaryAmount')}</dt>
              <dd className="font-medium text-[var(--color-text)]">
                {`${summary.amount} ${summary.coin ?? ''}`.trim()}
              </dd>
            </div>
          )}
          {summary.address && (
            <div className="mt-3 flex flex-col gap-1">
              <dt className="text-[var(--color-text-muted)]">{t('summaryTo')}</dt>
              <dd className="break-all font-mono text-xs text-[var(--color-text)]">
                {summary.address}
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="flex w-full flex-col gap-2">
        {status === 'error' && (
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => void approve()}
          >
            {t('retry')}
          </Button>
        )}
        {backToWallet}
      </div>
    </div>
  );
}
