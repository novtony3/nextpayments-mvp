'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { verifyEmailAction } from '@/lib/auth/actions';

type Status = 'pending' | 'success' | 'invalid' | 'error';

type VerifyEmailConfirmProps = {
  /** Single-use token from the email link (`?hash=`). */
  hash: string;
};

/**
 * Icon-disc tone per status, kept in one map (mirroring `StatusPill`) so the
 * pending/success/error discs share a single source of truth instead of each
 * branch inlining the same color formula. Success = green, both failure modes
 * = danger, pending reuses the accent disc from the instructional page.
 */
const DISC_CLASS: Record<Status, string> = {
  pending: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  success:
    'bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)]',
  invalid:
    'bg-[color-mix(in_oklab,var(--color-danger)_15%,transparent)] text-[var(--color-danger)]',
  error: 'bg-[color-mix(in_oklab,var(--color-danger)_15%,transparent)] text-[var(--color-danger)]',
};

/**
 * Consumes the verification link reached from the signup email
 * (`/verify-email?hash=`). Calls {@link verifyEmailAction} once on mount and
 * renders pending → success / invalid-link / transport-error, each with the
 * right recovery CTA. Lives in the (auth) shell rendered by the page; this owns
 * only the inner card content. Only the transient `error` state offers a retry
 * — an `invalid` hash is dead, so re-submitting it can't help.
 */
export function VerifyEmailConfirm({ hash }: VerifyEmailConfirmProps) {
  const t = useTranslations('auth.verifyEmail');
  const [status, setStatus] = useState<Status>('pending');
  // Guards React StrictMode's double-fired mount effect (and any re-render) so
  // the single-use hash is submitted exactly once.
  const startedRef = useRef(false);

  const run = useCallback(async () => {
    setStatus('pending');
    const result = await verifyEmailAction(hash);
    setStatus(result.ok ? 'success' : result.reason);
  }, [hash]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void run();
  }, [run]);

  const Icon = status === 'success' ? CheckCircle2 : status === 'pending' ? Loader2 : MailWarning;

  // Explicit literal keys (not built dynamically) so next-intl's message
  // lookup stays statically checkable.
  const title: Record<Status, string> = {
    pending: t('confirm.verifyingTitle'),
    success: t('confirm.successTitle'),
    invalid: t('confirm.invalidTitle'),
    error: t('confirm.errorTitle'),
  };
  const body: Record<Status, string> = {
    pending: t('confirm.verifyingBody'),
    success: t('confirm.successBody'),
    invalid: t('confirm.invalidBody'),
    error: t('confirm.errorBody'),
  };

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full ${DISC_CLASS[status]}`}
      >
        <Icon
          className={`h-7 w-7 ${status === 'pending' ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text)]">
          {title[status]}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">{body[status]}</p>
      </div>

      {status === 'success' && (
        <Button asChild variant="primary" size="lg" fullWidth>
          <Link href={ROUTES.LOGIN}>{t('goToLogin')}</Link>
        </Button>
      )}

      {status === 'invalid' && (
        <div className="flex w-full flex-col gap-2">
          <Button asChild variant="primary" size="lg" fullWidth>
            <Link href={ROUTES.REGISTER}>{t('confirm.signUpAgain')}</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" fullWidth>
            <Link href={ROUTES.LOGIN}>{t('goToLogin')}</Link>
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex w-full flex-col gap-2">
          <Button variant="primary" size="lg" fullWidth onClick={() => void run()}>
            {t('confirm.retry')}
          </Button>
          <Button asChild variant="ghost" size="lg" fullWidth>
            <Link href={ROUTES.LOGIN}>{t('goToLogin')}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
