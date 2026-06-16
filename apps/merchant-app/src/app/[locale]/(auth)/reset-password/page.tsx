import { getTranslations, setRequestLocale } from 'next-intl/server';
import { KeyRound } from 'lucide-react';

import { Button } from '@nextpayments/ui/components/button';

import { ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import { firstParam } from '@/lib/search-params';
import { Logo } from '@/components/shared/logo';
import { BlueAccent } from '@/components/shared/blue-accent';
import { CryptoCoinsBackdrop } from '@/components/shared/crypto-coins-backdrop';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Set-a-new-password page reached from the reset email
 * (`${appBaseUrl}/reset-password?token=`). With a `token` it renders {@link
 * ResetPasswordForm}; opened without one (e.g. directly) it shows a "reset link
 * required" notice pointing back to forgot-password. Shares the (auth) shell.
 */
export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const token = firstParam(sp.token);

  const t = await getTranslations('auth.resetPassword');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)] px-6 py-16">
      {/* Gemini Desktop signature: deep blue aurora rising from the floor. */}
      <BlueAccent intensity="subtle" feather={false} />
      {/* Frosted-glass crypto coins floating in 3D behind the card. */}
      <CryptoCoinsBackdrop />

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="mb-10 flex justify-center">
          <Link href={ROUTES.HOME}>
            <Logo size={32} />
          </Link>
        </div>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="flex flex-col items-center gap-5 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <KeyRound className="h-7 w-7" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text)]">
                {t('missingTokenTitle')}
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">{t('missingTokenBody')}</p>
            </div>
            <Button asChild variant="primary" size="lg" fullWidth>
              <Link href={ROUTES.FORGOT_PASSWORD}>{t('requestNewLink')}</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
