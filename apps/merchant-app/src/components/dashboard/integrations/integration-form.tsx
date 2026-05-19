'use client';

import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { Button } from '@nextpayments/ui/components/button';

import { TextField } from '@/components/shared/text-field';
import {
  INTEGRATION_ERROR_CODE,
  createIntegrationSchema,
  type CreateIntegrationResult,
  type IntegrationType,
} from '@/lib/integrations/types';

type IntegrationFormProps = {
  type: IntegrationType;
  onBack: () => void;
  onSubmit: (input: {
    name: string;
    siteUrl: string;
    ipnUrl: string;
  }) => Promise<CreateIntegrationResult>;
};

/**
 * Step 2: the create form. Same fields for every type (backend takes only
 * `{name,siteUrl,ipnUrl}`) — the per-type difference is the heading/blurb.
 * Client-validates with the shared zod schema; maps the backend `error.code`
 * (INER00x) to a localized message.
 */
export function IntegrationForm({ type, onBack, onSubmit }: IntegrationFormProps) {
  const t = useTranslations('dashboard.integrations');
  const [name, setName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [ipnUrl, setIpnUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = createIntegrationSchema.safeParse({ name, siteUrl, ipnUrl });
    if (!parsed.success) {
      // name is the only required field; anything else failing is a bad URL.
      setError(t(name.trim() ? 'errors.invalidUrl' : 'errors.nameRequired'));
      return;
    }
    startTransition(async () => {
      const result = await onSubmit({ name, siteUrl, ipnUrl });
      if (!result.ok) {
        const key = result.code ? INTEGRATION_ERROR_CODE[result.code] : undefined;
        setError(t(`errors.${key ?? (result.reason === 'invalid' ? 'invalid' : 'generic')}`));
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <div>
        <p className="text-base font-semibold text-[var(--color-text)]">
          {t(`types.${type}.title`)}
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">{t(`types.${type}.description`)}</p>
      </div>

      <TextField
        id="integration-name"
        label={t('form.nameLabel')}
        placeholder={t('form.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <TextField
        id="integration-site"
        label={t('form.siteUrlLabel')}
        placeholder={t('form.siteUrlPlaceholder')}
        inputMode="url"
        value={siteUrl}
        onChange={(e) => setSiteUrl(e.target.value)}
      />
      <TextField
        id="integration-ipn"
        label={t('form.ipnUrlLabel')}
        placeholder={t('form.ipnUrlPlaceholder')}
        inputMode="url"
        value={ipnUrl}
        onChange={(e) => setIpnUrl(e.target.value)}
      />

      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          {t('sheet.back')}
        </Button>
        <Button type="submit" loading={isPending}>
          {isPending ? t('form.submitting') : t('form.submit')}
        </Button>
      </div>
    </form>
  );
}
