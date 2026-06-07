'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@nextpayments/ui/components/button';

import { Link, useRouter } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import {
  AUTH_FIELD_PLACEHOLDERS,
  PASSWORD_MIN_LENGTH,
  TWO_FA_CODE_LENGTH,
  TWO_FA_CODE_PATTERN,
} from '@/constants/auth';
import { loginAction } from '@/lib/auth/actions';
import { TextField } from '@/components/shared/text-field';
import { PasswordToggle } from '@/components/auth/password-toggle';

type Step = 'credentials' | 'twoFa';

type LoginFormProps = {
  /** Internal path to return to after sign-in (the guard's bounce origin). */
  returnTo?: string;
};

export function LoginForm({ returnTo }: LoginFormProps) {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<Step>('credentials');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [twoFaSubmitting, setTwoFaSubmitting] = useState(false);

  // Schema built inside the component so validation messages follow the locale.
  const schema = z.object({
    email: z
      .string()
      .min(1, { message: t('errors.emailRequired') })
      .email({ message: t('errors.emailInvalid') }),
    password: z
      .string()
      .min(1, { message: t('errors.passwordRequired') })
      .min(PASSWORD_MIN_LENGTH, { message: t('errors.passwordTooShort') }),
  });

  type LoginValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const finishSuccess = (displayName: string) => {
    toast.success(t('successWelcome', { name: displayName }));
    router.push(returnTo ?? ROUTES.HOME);
    router.refresh(); // let server components observe the new session cookie
  };

  /**
   * Surface a failed login the same way from either step. Returns the field a
   * caller may want to refocus on (email-related issues) so the 2FA step can
   * drop back to the credentials step when appropriate.
   */
  const showLoginFailure = (
    reason: 'invalid' | 'error' | 'emailNotVerified' | 'noAccount',
  ): void => {
    if (reason === 'error') {
      // Transport failure (tunnel down), 5xx, or unexpected response shape.
      toast.error(t('errors.serverError'));
      return;
    }
    if (reason === 'emailNotVerified') {
      const message = t('errors.emailNotVerified');
      setError('email', { message });
      toast.error(message);
      return;
    }
    if (reason === 'noAccount') {
      const message = t('errors.noAccount');
      setError('email', { message });
      toast.error(message);
      return;
    }
    // reason === 'invalid'
    const message = t('errors.invalidCredentials');
    setError('email', { message });
    setError('password', { message });
    toast.error(message);
  };

  const onCredentialsSubmit = async (values: LoginValues) => {
    const result = await loginAction({ ...values, token2fa: '' });

    if (result.ok) {
      finishSuccess(result.displayName);
      return;
    }

    if (result.reason === 'twoFaRequired') {
      setTwoFaCode('');
      setTwoFaError(null);
      setStep('twoFa');
      return;
    }

    showLoginFailure(result.reason);
  };

  const onTwoFaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!TWO_FA_CODE_PATTERN.test(twoFaCode)) {
      setTwoFaError(t('errors.twoFaCodeInvalid'));
      return;
    }
    setTwoFaSubmitting(true);
    try {
      const { email, password } = getValues();
      const result = await loginAction({ email, password, token2fa: twoFaCode });

      if (result.ok) {
        finishSuccess(result.displayName);
        return;
      }

      if (result.reason === 'twoFaRequired') {
        setTwoFaError(t('errors.twoFaCodeInvalid'));
        return;
      }

      // Any other failure invalidates the whole attempt — drop back to step 1
      // (clearing the password) and surface the reason there.
      setStep('credentials');
      resetField('password');
      showLoginFailure(result.reason);
    } finally {
      setTwoFaSubmitting(false);
    }
  };

  const cancelTwoFa = () => {
    setStep('credentials');
    setTwoFaCode('');
    setTwoFaError(null);
    resetField('password');
  };

  if (step === 'twoFa') {
    return (
      <form onSubmit={onTwoFaSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-[var(--color-text-muted)]">{t('twoFaPrompt')}</p>
        </div>

        <TextField
          id="twoFaCode"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={TWO_FA_CODE_LENGTH}
          label={t('twoFaCode')}
          placeholder={t('twoFaCodePlaceholder')}
          value={twoFaCode}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, '').slice(0, TWO_FA_CODE_LENGTH);
            setTwoFaCode(next);
            if (twoFaError) setTwoFaError(null);
          }}
          error={twoFaError ?? undefined}
          autoFocus
        />

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={twoFaSubmitting}
            disabled={twoFaCode.length !== TWO_FA_CODE_LENGTH}
          >
            {twoFaSubmitting ? t('twoFaSubmitting') : t('twoFaSubmit')}
          </Button>
          <Button type="button" variant="outline" size="lg" fullWidth onClick={cancelTwoFa}>
            {t('twoFaCancel')}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onCredentialsSubmit)} noValidate className="flex flex-col gap-5">
      <TextField
        id="email"
        type="email"
        autoComplete="email"
        label={t('email')}
        placeholder={AUTH_FIELD_PLACEHOLDERS.EMAIL}
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="flex flex-col gap-2">
        <TextField
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          label={t('password')}
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
        <div className="flex justify-end">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-xs text-[var(--color-text-muted)] underline-offset-4 transition-colors hover:text-[var(--color-accent)] hover:underline"
          >
            {t('forgotPassword')}
          </Link>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
