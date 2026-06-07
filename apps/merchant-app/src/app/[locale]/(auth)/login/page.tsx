import { getTranslations, setRequestLocale } from 'next-intl/server';

import { RETURN_TO_PARAM } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { Link, redirect } from '@/i18n/routing';
import { safeReturnTo } from '@/lib/auth/return-to';
import { getRefreshToken, isAuthenticated } from '@/lib/auth/session';
import { Logo } from '@/components/shared/logo';
import { BlueAccent } from '@/components/shared/blue-accent';
import { LoginForm } from '@/components/auth/login-form';
import { SessionRecover } from '@/components/auth/session-recover';
import { SocialButtons } from '@/components/auth/social-buttons';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Where to land after sign-in / silent recovery (the page the guard bounced
  // from), validated to an internal path. `undefined` → default destination.
  const sp = await searchParams;
  const rawReturn = sp[RETURN_TO_PARAM];
  const returnTo = safeReturnTo(Array.isArray(rawReturn) ? rawReturn[0] : rawReturn);

  // Already signed in → don't show the login screen.
  if (await isAuthenticated()) {
    redirect({ href: returnTo ?? ROUTES.HOME, locale });
  }

  // Access cookie gone but a refresh cookie remains → attempt silent recovery.
  const canRecover = Boolean(await getRefreshToken());
  const t = await getTranslations('auth.login');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)] px-6 py-16">
      {/* Gemini Desktop signature: deep blue aurora rising from the floor. */}
      <BlueAccent intensity="bold" feather={false} />

      {canRecover && <SessionRecover returnTo={returnTo} />}

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

        <LoginForm returnTo={returnTo} />

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
