import { setRequestLocale } from 'next-intl/server';

import { ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/shared/logo';
import { BlueAccent } from '@/components/shared/blue-accent';
import { CryptoCoinsBackdrop } from '@/components/shared/crypto-coins-backdrop';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * "Forgot password" page — collects the account email and asks the backend to
 * send a reset link (`${appBaseUrl}/reset-password?token=`). Shares the (auth)
 * shell (aurora + floating coins + centered card) with login/register; the
 * form owns its header so it can swap to the "check your email" confirmation.
 */
export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

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

        <ForgotPasswordForm />
      </div>
    </main>
  );
}
