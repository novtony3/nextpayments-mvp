'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from '@nextpayments/ui/components/button';

import {
  AUTH_FIELD_PLACEHOLDERS,
  PASSWORD_MIN_LENGTH,
  TWO_FA_CODE_LENGTH,
  TWO_FA_CODE_PATTERN,
} from '@/constants/auth';
import { SECURITY_ERROR_CODE } from '@/constants/security';
import {
  begin2faSetupAction,
  disable2faAction,
  enable2faAction,
} from '@/lib/security/actions';
import { TextField } from '@/components/shared/text-field';
import { PasswordToggle } from '@/components/auth/password-toggle';

import { SecurityCard } from './security-card';
import { StatusPill } from './status-pill';

type TwoFaCardProps = {
  /** Server-side initial state, read from `/user/me`. */
  initialEnabled: boolean;
};

type EnableStep = 'idle' | 'showSecret' | 'confirm';

/** QR pixel size — square. Authenticator scanners read 160-220 px reliably. */
const QR_SIZE_PX = 196;

export function TwoFaCard({ initialEnabled }: TwoFaCardProps) {
  const t = useTranslations('paySettings.security.twoFa');
  const tErr = useTranslations('paySettings.security.errors');
  const [enabled, setEnabled] = useState(initialEnabled);
  const [step, setStep] = useState<EnableStep>('idle');
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [isStarting, startStartTransition] = useTransition();

  const mutationSchema = z.object({
    password: z
      .string()
      .min(1, { message: t('errors.passwordRequired') })
      .min(PASSWORD_MIN_LENGTH, { message: t('errors.passwordTooShort') }),
    token2fa: z
      .string()
      .min(1, { message: t('errors.codeRequired') })
      .regex(TWO_FA_CODE_PATTERN, { message: t('errors.codeInvalid') }),
  });

  const beginEnable = () => {
    startStartTransition(async () => {
      const result = await begin2faSetupAction();
      if (!result.ok) {
        toast.error(t('errors.setupFailed'));
        return;
      }
      setSecret(result.secret);
      setOtpauthUri(result.otpauthUri);
      setStep('showSecret');
    });
  };

  const reset = () => {
    setStep('idle');
    setSecret(null);
    setOtpauthUri(null);
    setShowDisableForm(false);
  };

  const badge = enabled ? (
    <StatusPill label={t('badgeEnabled')} tone="positive" icon="shieldOn" />
  ) : (
    <StatusPill label={t('badgeDisabled')} tone="neutral" icon="shieldOff" />
  );

  if (enabled) {
    return (
      <SecurityCard
        title={t('title')}
        description={t('descriptionEnabled')}
        badge={badge}
        action={
          !showDisableForm ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowDisableForm(true)}
            >
              {t('disableCta')}
            </Button>
          ) : undefined
        }
      >
        {showDisableForm && (
          <TwoFaMutationForm
            schema={mutationSchema}
            submitLabel={t('disableSubmit')}
            submittingLabel={t('disableSubmitting')}
            cancelLabel={t('cancel')}
            tErr={tErr}
            onCancel={() => setShowDisableForm(false)}
            onSubmit={async (values) => {
              const result = await disable2faAction(values);
              if (result.ok) {
                toast.success(t('disableSuccess'));
                setEnabled(false);
                reset();
                return null;
              }
              if (result.reason === 'invalid') {
                const reasonKey = result.code ? SECURITY_ERROR_CODE[result.code] : undefined;
                if (reasonKey === 'wrongPassword') return { field: 'password', reason: reasonKey };
                if (reasonKey === 'invalid2faCode') return { field: 'token2fa', reason: reasonKey };
              }
              toast.error(t('errors.server'));
              return null;
            }}
          />
        )}
      </SecurityCard>
    );
  }

  if (step === 'idle') {
    return (
      <SecurityCard
        title={t('title')}
        description={t('descriptionDisabled')}
        badge={badge}
        action={
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={beginEnable}
            loading={isStarting}
          >
            {isStarting ? t('enableStarting') : t('enableCta')}
          </Button>
        }
      />
    );
  }

  // step === 'showSecret' OR 'confirm' — both show the QR/secret and the form.
  return (
    <SecurityCard title={t('title')} description={t('descriptionScan')} badge={badge}>
      <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-2">
          {otpauthUri && (
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG
                value={otpauthUri}
                size={QR_SIZE_PX}
                level="M"
                aria-label={t('qrAlt')}
              />
            </div>
          )}
          <p className="text-xs text-[var(--color-text-muted)]">{t('qrCaption')}</p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--color-text-muted)]">{t('secretInstruction')}</p>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
              {t('secretLabel')}
            </span>
            <code className="break-all rounded-lg border border-[var(--glass-border)] bg-[var(--glass-fill)] px-3 py-2 font-mono text-sm text-[var(--color-text)]">
              {secret}
            </code>
          </div>
        </div>
      </div>

      <TwoFaMutationForm
        schema={mutationSchema}
        submitLabel={t('enableSubmit')}
        submittingLabel={t('enableSubmitting')}
        cancelLabel={t('cancel')}
        tErr={tErr}
        onCancel={reset}
        onSubmit={async (values) => {
          const result = await enable2faAction(values);
          if (result.ok) {
            toast.success(t('enableSuccess'));
            setEnabled(true);
            reset();
            return null;
          }
          if (result.reason === 'invalid') {
            const reasonKey = result.code ? SECURITY_ERROR_CODE[result.code] : undefined;
            if (reasonKey === 'wrongPassword') return { field: 'password', reason: reasonKey };
            if (reasonKey === 'invalid2faCode') return { field: 'token2fa', reason: reasonKey };
            if (reasonKey === 'twoFaAlreadyEnabled') {
              toast.success(t('alreadyEnabled'));
              setEnabled(true);
              reset();
              return null;
            }
          }
          toast.error(t('errors.server'));
          return null;
        }}
      />
    </SecurityCard>
  );
}

/**
 * Inline password + 6-digit-code form shared by enable and disable flows.
 * `onSubmit` returns either null (handled — close/reset by parent) or a
 * `{ field, reason }` to surface as an inline field error.
 */
type TwoFaFieldError = { field: 'password' | 'token2fa'; reason: string };

type MutationFormProps<S extends z.ZodTypeAny> = {
  schema: S;
  submitLabel: string;
  submittingLabel: string;
  cancelLabel: string;
  tErr: ReturnType<typeof useTranslations>;
  onSubmit: (values: z.infer<S>) => Promise<TwoFaFieldError | null>;
  onCancel: () => void;
};

function TwoFaMutationForm<S extends z.ZodTypeAny>({
  schema,
  submitLabel,
  submittingLabel,
  cancelLabel,
  tErr,
  onSubmit,
  onCancel,
}: MutationFormProps<S>) {
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations('paySettings.security.twoFa');
  const {
    register,
    handleSubmit,
    setError,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = useForm<{ password: string; token2fa: string }>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { password: '', token2fa: '' },
  });

  const submit = handleSubmit(async (values) => {
    const fieldError = await onSubmit(values as z.infer<S>);
    if (fieldError) {
      setError(fieldError.field, { message: tErr(fieldError.reason) });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <TextField
        id="twoFaPassword"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        label={t('passwordLabel')}
        placeholder={AUTH_FIELD_PLACEHOLDERS.PASSWORD}
        error={errors.password?.message}
        trailing={
          <PasswordToggle
            shown={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            labelShow={t('showPassword')}
            labelHide={t('hidePassword')}
          />
        }
        {...register('password')}
      />
      <TextField
        id="twoFaCode"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={TWO_FA_CODE_LENGTH}
        label={t('codeLabel')}
        placeholder={t('codePlaceholder')}
        error={errors.token2fa?.message}
        {...register('token2fa', {
          setValueAs: (value: string) => value.replace(/\D/g, '').slice(0, TWO_FA_CODE_LENGTH),
        })}
      />
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => {
            resetForm({ password: '', token2fa: '' });
            onCancel();
          }}
        >
          {cancelLabel}
        </Button>
        <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
