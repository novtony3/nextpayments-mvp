import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ChangePasswordCard } from '@/components/dashboard/security/change-password-card';
import { EmailVerificationCard } from '@/components/dashboard/security/email-verification-card';
import { TwoFaCard } from '@/components/dashboard/security/two-fa-card';
import { loadSecurityState } from '@/lib/security/backend';

type PaySettingsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Account security & self-service hub — replaces the previous ComingSoon
 * stub. Three stacked cards: change password, enable/disable 2FA (Google
 * Authenticator), and an email-verification status pill. State is read
 * server-side from `/user/me` so the cards render with the right CTAs
 * already (e.g. "Disable 2FA" instead of "Enable" when `gaEnabled:true`).
 *
 * The page degrades gracefully when the session lookup fails (tunnel down,
 * stale cookies) — `loadSecurityState()` returns null and the cards fall
 * back to disabled / empty defaults.
 */
export default async function PaySettingsPage({ params }: PaySettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const state = await loadSecurityState();
  const t = await getTranslations('paySettings.security');

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium text-[var(--color-text)]">{t('pageTitle')}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{t('pageSubtitle')}</p>
      </header>

      <ChangePasswordCard />
      <TwoFaCard initialEnabled={state?.gaEnabled ?? false} />
      <EmailVerificationCard
        verified={state?.emailVerified ?? false}
        email={state?.email ?? ''}
      />
    </div>
  );
}
