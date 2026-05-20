'use client';

import { Info, KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { INTEGRATION_API_URL } from '@/constants/integrations';

import { ReadOnlyField } from './read-only-field';
import { WebhooksPanel } from './webhooks-panel';

type IntegrationCompletedViewProps = {
  integrationId: string;
  name: string;
  storeUrl: string;
  /** publicKey from POST /integrations/:id/api-keys. Empty in the partial
   * fallback (integration created, key call failed). */
  clientId: string;
  /** privateKey shown once — empty in the partial fallback. */
  clientSecret: string;
  /** Initial ipnUrl on the integration (empty for a fresh create). */
  initialWebhookUrl: string;
  /** Set when the auto API-key call failed — surfaces a warning band. */
  apiKeyError?: string;
  onDone: () => void;
};

/**
 * Completed view shown after the sheet's create step succeeds. Two columns:
 *
 *  - Left  — read-only summary of the integration + the credentials the
 *            backend just generated (Client ID, Client Secret, the API URL
 *            consumers will call). PERMISSIONS and ALLOWED IPS are UI-only
 *            placeholders (no backend support yet) but match the design.
 *  - Right — Manage Webhooks panel (PUT integration.ipnUrl).
 *
 * The whole panel is purely presentational beyond the WebhooksPanel — it
 * never re-calls create; the sheet sends `onDone` to close.
 */
export function IntegrationCompletedView({
  integrationId,
  name,
  storeUrl,
  clientId,
  clientSecret,
  initialWebhookUrl,
  apiKeyError,
  onDone,
}: IntegrationCompletedViewProps) {
  const t = useTranslations('dashboard.integrations.completed');

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* LEFT — integration summary + credentials */}
      <section className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
            {t('eyebrow')}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">{t('description')}</p>
        </div>

        <ReadOnlyField label={t('name')} value={name} />
        <ReadOnlyField label={t('storeUrl')} value={storeUrl} truncate />

        <ReadOnlyField
          label={t('permissions')}
          value={t('permissionsAll')}
          trailing={
            <KeyRound className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden="true" />
          }
        />

        <AllowedIpsField label={t('allowedIps')} placeholder={t('allowedIpsPlaceholder')} />

        <ReadOnlyField
          label={t('apiUrl')}
          value={INTEGRATION_API_URL}
          copyable
          truncate
          copyLabel={t('copy')}
        />
        <ReadOnlyField
          label={t('clientId')}
          value={clientId}
          copyable
          monospace
          truncate
          copyLabel={t('copy')}
        />
        <ReadOnlyField
          label={t('clientSecret')}
          value={clientSecret}
          copyable
          monospace
          truncate
          copyLabel={t('copy')}
        />

        {apiKeyError ? (
          <Banner tone="danger" message={apiKeyError} />
        ) : (
          <Banner tone="info" message={t('secretWarning')} />
        )}
      </section>

      {/* RIGHT — webhooks */}
      <section>
        <WebhooksPanel
          integrationId={integrationId}
          initialUrl={initialWebhookUrl}
          onDone={onDone}
        />
      </section>
    </div>
  );
}

/**
 * UI-only Allowed IPs input. The backend has no `allowedIps` field on the
 * integration yet, so the value is captured locally and discarded on close.
 * Kept here (not a shared input) so the visual matches the rest of the panel.
 */
function AllowedIpsField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
        {label}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)]"
      />
    </div>
  );
}

function Banner({ tone, message }: { tone: 'info' | 'danger'; message: string }) {
  const isDanger = tone === 'danger';
  return (
    <div
      className={
        isDanger
          ? 'flex items-start gap-2 rounded-xl border border-[var(--color-danger)] bg-[color-mix(in_oklab,var(--color-danger)_12%,transparent)] px-3 py-2 text-xs text-[var(--color-danger)]'
          : 'flex items-start gap-2 rounded-xl bg-[var(--color-accent-soft)] px-3 py-2 text-xs text-[var(--color-text)]'
      }
      role={isDanger ? 'alert' : undefined}
    >
      <Info
        className={
          isDanger
            ? 'mt-px h-3.5 w-3.5 shrink-0 text-[var(--color-danger)]'
            : 'mt-px h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]'
        }
        aria-hidden="true"
      />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
