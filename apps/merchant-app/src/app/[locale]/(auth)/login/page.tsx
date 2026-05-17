import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth.login');

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t('subtitle')}</p>
      <p className="mt-12 text-xs text-[var(--color-text-subtle)]">
        Login form skeleton — full form will be built in next step.
      </p>
    </main>
  );
}
