import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { Logo } from '@/components/shared/logo';
import { BlueAccent } from '@/components/shared/blue-accent';
import { LoginForm } from '@/components/auth/login-form';
import { SocialButtons } from '@/components/auth/social-buttons';

export default function LoginPage() {
  const t = useTranslations('auth.login');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)] px-6 py-16">
      {/* Gemini Desktop signature: deep blue aurora rising from the floor. */}
      <BlueAccent intensity="bold" />

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link href={ROUTES.HOME} className="mb-8">
            <Logo size={32} />
          </Link>
          <h1 className="text-4xl font-normal tracking-tight text-[var(--color-text)]">
            {t('title')}
          </h1>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            {t('subtitle')}
          </p>
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
