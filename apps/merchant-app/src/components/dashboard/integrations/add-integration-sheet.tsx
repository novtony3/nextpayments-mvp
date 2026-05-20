'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Sheet, SHEET_TRANSITION_MS } from '@nextpayments/ui/components/sheet';

import { useRouter } from '@/i18n/routing';
import { createIntegrationWithApiKeyAction } from '@/lib/integrations/actions';
import type { CreateIntegrationWithKeyResult, IntegrationType } from '@/lib/integrations/types';

import { IntegrationCompletedView } from './integration-completed-view';
import { IntegrationForm } from './integration-form';
import { IntegrationTypeCards } from './integration-type-cards';

type AddIntegrationSheetProps = {
  open: boolean;
  onClose: () => void;
};

type CompletedData = {
  integrationId: string;
  name: string;
  storeUrl: string;
  ipnUrl: string;
  ipnSecret: string;
  clientId: string;
  clientSecret: string;
  /** Set when the auto-API-key call failed; surfaces a warning in the view. */
  apiKeyError?: string;
};

type Step = 'select' | 'form' | 'completed';

/**
 * Add-integration sheet. Three steps:
 *   1. `select`    — pick integration type (cards)
 *   2. `form`      — Name + Store URL (IPN URL is set later in webhooks)
 *   3. `completed` — combined view: read-only credentials (Client ID/Secret
 *                    from the auto-created default API key) + manage webhooks
 *
 * The create step calls `createIntegrationWithApiKeyAction`, which posts the
 * integration AND a default API key in one round-trip (using
 * `integration._id` from the first response). The sheet widens on the
 * completed step so the two-column layout fits.
 */
export function AddIntegrationSheet({ open, onClose }: AddIntegrationSheetProps) {
  const t = useTranslations('dashboard.integrations');
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [, setType] = useState<IntegrationType | null>(null);
  const [completed, setCompleted] = useState<CompletedData | null>(null);

  const close = () => {
    onClose();
    // Reset only after the slide-out finishes so content doesn't flash.
    setTimeout(() => {
      setStep('select');
      setType(null);
      setCompleted(null);
    }, SHEET_TRANSITION_MS);
  };

  const handleCreate = async (input: {
    name: string;
    siteUrl: string;
    ipnUrl: string;
  }): Promise<CreateIntegrationWithKeyResult> => {
    const result = await createIntegrationWithApiKeyAction(input);

    if (result.ok === true || result.ok === 'partial') {
      setCompleted({
        integrationId: result.integrationId,
        name: result.name,
        storeUrl: result.storeUrl,
        ipnUrl: result.ipnUrl,
        ipnSecret: result.ipnSecret,
        clientId: result.ok === true ? result.publicKey : '',
        clientSecret: result.ok === true ? result.privateKey : '',
        apiKeyError: result.ok === 'partial' ? t('errors.apiKeyFailed') : undefined,
      });
      setStep('completed');
      router.refresh();
    }
    return result;
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      title={t('sheet.title')}
      closeLabel={t('sheet.close')}
      className={step === 'completed' ? 'sm:max-w-4xl' : undefined}
    >
      {step === 'select' && (
        <IntegrationTypeCards
          onSelect={(selected) => {
            setType(selected);
            setStep('form');
          }}
        />
      )}

      {step === 'form' && (
        <IntegrationForm onBack={() => setStep('select')} onSubmit={handleCreate} />
      )}

      {step === 'completed' && completed && (
        <IntegrationCompletedView
          integrationId={completed.integrationId}
          name={completed.name}
          storeUrl={completed.storeUrl}
          clientId={completed.clientId}
          clientSecret={completed.clientSecret}
          initialWebhookUrl={completed.ipnUrl}
          apiKeyError={completed.apiKeyError}
          onDone={close}
        />
      )}
    </Sheet>
  );
}
