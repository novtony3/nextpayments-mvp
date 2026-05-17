import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
  const t = useTranslations('common');
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t('comingSoon')}</p>
    </main>
  );
}
