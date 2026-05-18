import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { Logo } from '@/components/shared/logo';
import { BlueAccent } from '@/components/shared/blue-accent';
import { RegisterForm } from '@/components/auth/register-form';
import { SocialButtons } from '@/components/auth/social-buttons';

export default function RegisterPage() {
  const t = useTranslations('auth.register');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)] px-6 py-16">
      {/* Gemini Desktop signature: deep blue aurora rising from the floor. */}
      <BlueAccent intensity="subtle" feather={false} />

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

        <RegisterForm />

        <div className="mt-6">
          <SocialButtons />
        </div>

        <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
          {t('haveAccount')}{' '}
          <Link
            href={ROUTES.LOGIN}
            className="font-medium text-[var(--color-accent)] underline-offset-4 transition-colors hover:underline"
          >
            {t('signIn')}
          </Link>
        </p>
      </div>
    </main>
  );
}
