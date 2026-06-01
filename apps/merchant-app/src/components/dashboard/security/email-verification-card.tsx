import { useTranslations } from 'next-intl';

import { SecurityCard } from './security-card';
import { StatusPill } from './status-pill';

type EmailVerificationCardProps = {
  /** True when `/user/me` reports `emailVerified:true`. */
  verified: boolean;
  /** Displayed alongside the status — falls back to the empty string. */
  email: string;
};

/**
 * Read-only status card for the email-verification flow. The actual
 * verify-email / forgot-password / reset-password flows aren't wired yet
 * (PR scope is 2FA + change password); this card just exposes the current
 * state so merchants know whether they need to take action.
 */
export function EmailVerificationCard({ verified, email }: EmailVerificationCardProps) {
  const t = useTranslations('paySettings.security.emailVerification');

  const badge = verified ? (
    <StatusPill label={t('badgeVerified')} tone="positive" icon="check" />
  ) : (
    <StatusPill label={t('badgeUnverified')} tone="warning" icon="cross" />
  );

  return (
    <SecurityCard
      title={t('title')}
      description={verified ? t('descriptionVerified') : t('descriptionUnverified')}
      badge={badge}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
          {t('emailLabel')}
        </span>
        <span className="text-sm text-[var(--color-text)]">{email || t('emailUnknown')}</span>
      </div>
      {!verified && <p className="text-xs text-[var(--color-text-muted)]">{t('resendHint')}</p>}
    </SecurityCard>
  );
}
