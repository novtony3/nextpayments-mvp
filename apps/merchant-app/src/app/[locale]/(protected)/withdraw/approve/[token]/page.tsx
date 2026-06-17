import { setRequestLocale } from 'next-intl/server';

import { WithdrawApproval } from '@/components/dashboard/wallet/withdraw-approval';

type WithdrawApprovePageProps = {
  params: Promise<{ locale: string; token: string }>;
};

/**
 * Withdrawal-approval landing reached from the email link
 * (`/withdraw/approve/<token>`). Lives under `(protected)` so the layout guard
 * requires a session before the approval PUT runs — a logged-out user opening
 * the link bounces to login with the full pathname (token included) as
 * `returnTo`, then lands back here. The token rides as a path segment precisely
 * so it survives that bounce (the middleware's `x-pathname` drops the query).
 * Renders inside the dashboard shell; a centered card hosts the confirm action.
 */
export default async function WithdrawApprovePage({ params }: WithdrawApprovePageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto w-full max-w-[440px] py-6 sm:py-10">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
        <WithdrawApproval token={token} />
      </div>
    </div>
  );
}
