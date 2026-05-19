'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@nextpayments/ui/components/button';
import { Sheet } from '@nextpayments/ui/components/sheet';

import { INTEGRATION_TYPE_META } from '@/constants/integrations';
import { useRouter } from '@/i18n/routing';
import { createApiKeyAction, createIntegrationAction } from '@/lib/integrations/actions';
import type { IntegrationType } from '@/lib/integrations/types';

import { ApiKeyStep } from './api-key-step';
import { IntegrationForm } from './integration-form';
import { IntegrationTypeCards } from './integration-type-cards';
import { SecretReveal } from './secret-reveal';

type AddIntegrationSheetProps = {
  open: boolean;
  onClose: () => void;
};

type Created = { integrationId: string; ipnSecret: string; name: string };
type Step = 'select' | 'form' | 'success' | 'apikey';

/**
 * Add-integration bottom sheet. State machine: pick type → form → success
 * (IPN secret shown once) → optional API-key step for the `api` type. The
 * list is refreshed on create so the new row appears behind the sheet.
 */
export function AddIntegrationSheet({ open, onClose }: AddIntegrationSheetProps) {
  const t = useTranslations('dashboard.integrations');
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [type, setType] = useState<IntegrationType | null>(null);
  const [created, setCreated] = useState<Created | null>(null);

  const generatesApiKey =
    INTEGRATION_TYPE_META.find((m) => m.key === type)?.generatesApiKey ?? false;

  const close = () => {
    onClose();
    // Reset only after the slide-out so the content doesn't flash.
    setTimeout(() => {
      setStep('select');
      setType(null);
      setCreated(null);
    }, 300);
  };

  return (
    <Sheet open={open} onClose={close} title={t('sheet.title')} closeLabel={t('sheet.close')}>
      {step === 'select' && (
        <IntegrationTypeCards
          onSelect={(selected) => {
            setType(selected);
            setStep('form');
          }}
        />
      )}

      {step === 'form' && type && (
        <IntegrationForm
          type={type}
          onBack={() => setStep('select')}
          onSubmit={async (input) => {
            const result = await createIntegrationAction(input);
            if (result.ok) {
              setCreated({
                integrationId: result.integrationId,
                ipnSecret: result.ipnSecret,
                name: result.name,
              });
              setStep('success');
              router.refresh();
            }
            return result;
          }}
        />
      )}

      {step === 'success' && created && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-base font-semibold text-[var(--color-text)]">{t('success.title')}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{created.name}</p>
          </div>
          <SecretReveal label={t('success.ipnSecretLabel')} value={created.ipnSecret} />
          <p className="text-xs text-[var(--color-warning)]">{t('success.warning')}</p>
          <div className="flex items-center justify-end gap-3">
            {generatesApiKey ? (
              <>
                <Button variant="ghost" size="sm" onClick={close}>
                  {t('success.done')}
                </Button>
                <Button onClick={() => setStep('apikey')}>{t('success.next')}</Button>
              </>
            ) : (
              <Button onClick={close} fullWidth>
                {t('success.done')}
              </Button>
            )}
          </div>
        </div>
      )}

      {step === 'apikey' && created && (
        <ApiKeyStep
          integrationName={created.name}
          onSubmit={(label) => createApiKeyAction(created.integrationId, label)}
          onDone={close}
        />
      )}
    </Sheet>
  );
}
