import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ROUTES } from '@/constants/routes';
import { Link, redirect } from '@/i18n/routing';
import { getRefreshToken, isAuthenticated } from '@/lib/auth/session';
import { Logo } from '@/components/shared/logo';
import { BlueAccent } from '@/components/shared/blue-accent';
import { LoginForm } from '@/components/auth/login-form';
import { SessionRecover } from '@/components/auth/session-recover';
import { SocialButtons } from '@/components/auth/social-buttons';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Already signed in → don't show the login screen.
  if (await isAuthenticated()) {
    redirect({ href: ROUTES.HOME, locale });
  }

  // Access cookie gone but a refresh cookie remains → attempt silent recovery.
  const canRecover = Boolean(await getRefreshToken());
  const t = await getTranslations('auth.login');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)] px-6 py-16">
      {/* Gemini Desktop signature: deep blue aurora rising from the floor. */}
      <BlueAccent intensity="bold" feather={false} />

      {canRecover && <SessionRecover />}

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link href={ROUTES.HOME} className="mb-8">
            <Logo size={32} />
          </Link>
          <h1 className="text-4xl font-normal tracking-tight text-[var(--color-text)]">
            {t('title')}
          </h1>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t('subtitle')}</p>
        </div>

        <LoginForm />

        <div className="mt-6">
          <SocialButtons />
        </div>

        <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
          {t('noAccount')}{' '}
          <Link
            href={ROUTES.REGISTER}
            className="font-medium text-[var(--color-accent)] underline-offset-4 transition-colors hover:underline"
          >
            {t('signUp')}
          </Link>
        </p>
      </div>
    </main>
  );
}
