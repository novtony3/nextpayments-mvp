'use client';

import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { Button } from '@nextpayments/ui/components/button';

import { TextField } from '@/components/shared/text-field';
import { INTEGRATION_ERROR_CODE, type CreateApiKeyResult } from '@/lib/integrations/types';

import { SecretReveal } from './secret-reveal';

type ApiKeyStepProps = {
  integrationName: string;
  onSubmit: (label: string) => Promise<CreateApiKeyResult>;
  onDone: () => void;
};

/**
 * Optional step for the `api` type: label → generate key pair. The private
 * key is shown once (same one-time treatment as the IPN secret).
 */
export function ApiKeyStep({ integrationName, onSubmit, onDone }: ApiKeyStepProps) {
  const t = useTranslations('dashboard.integrations');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!label.trim()) {
      setError(t('errors.invalid'));
      return;
    }
    startTransition(async () => {
      const result = await onSubmit(label.trim());
      if (result.ok) {
        setKeys({ publicKey: result.publicKey, privateKey: result.privateKey });
      } else {
        const key = result.code ? INTEGRATION_ERROR_CODE[result.code] : undefined;
        setError(t(`errors.${key ?? 'generic'}`));
      }
    });
  };

  if (keys) {
    return (
      <div className="flex flex-col gap-5">
        <SecretReveal label={t('apiKey.publicKeyLabel')} value={keys.publicKey} />
        <SecretReveal label={t('apiKey.privateKeyLabel')} value={keys.privateKey} />
        <p className="text-xs text-[var(--color-warning)]">{t('success.warning')}</p>
        <Button onClick={onDone} fullWidth>
          {t('success.done')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <div>
        <p className="text-base font-semibold text-[var(--color-text)]">{t('apiKey.title')}</p>
        <p className="text-sm text-[var(--color-text-muted)]">
          {t('apiKey.description', { name: integrationName })}
        </p>
      </div>

      <TextField
        id="api-key-label"
        label={t('apiKey.labelLabel')}
        placeholder={t('apiKey.labelPlaceholder')}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        required
      />

      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <Button type="submit" loading={isPending} fullWidth>
        {isPending ? t('apiKey.submitting') : t('apiKey.submit')}
      </Button>
    </form>
  );
}
