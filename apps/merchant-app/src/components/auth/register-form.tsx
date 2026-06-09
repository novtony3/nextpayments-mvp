'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@nextpayments/ui/components/button';
import { Checkbox } from '@nextpayments/ui/components/checkbox';

import { useRouter } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { AUTH_FIELD_PLACEHOLDERS, PASSWORD_MIN_LENGTH } from '@/constants/auth';
import { registerAction } from '@/lib/auth/actions';
import { TextField } from '@/components/shared/text-field';
import { PasswordToggle } from '@/components/auth/password-toggle';

export function RegisterForm() {
  const t = useTranslations('auth.register');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Schema built inside the component so validation messages follow the locale.
  const schema = z
    .object({
      name: z.string().min(1, { message: t('errors.nameRequired') }),
      email: z
        .string()
        .min(1, { message: t('errors.emailRequired') })
        .email({ message: t('errors.emailInvalid') }),
      password: z
        .string()
        .min(1, { message: t('errors.passwordRequired') })
        .min(PASSWORD_MIN_LENGTH, { message: t('errors.passwordTooShort') }),
      confirmPassword: z.string().min(1, { message: t('errors.confirmRequired') }),
      // Optional referral code (upline id); only sent to the backend when filled.
      referral: z.string().optional(),
      // Client-side consent gate — must be ticked to submit; never sent to the
      // backend (it takes name/email/password/referralId only).
      agreeTerms: z.boolean().refine((v) => v, { message: t('errors.termsRequired') }),
    })
    .refine((v) => v.password === v.confirmPassword, {
      path: ['confirmPassword'],
      message: t('errors.passwordMismatch'),
    });

  type RegisterValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      referral: '',
      agreeTerms: false,
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    const result = await registerAction({
      userName: values.name,
      email: values.email,
      password: values.password,
      // Trim and drop empty so the backend never sees "" (USER005).
      referralId: values.referral?.trim() || undefined,
    });

    if (result.ok) {
      // No auto-login: the account is unverified and a later login is blocked
      // until verification, so we send the user to the dedicated "check your
      // email" page (carrying the address) instead of dropping them into the
      // dashboard with an unverified session.
      toast.success(t('verify.toast'));
      router.push({ pathname: ROUTES.VERIFY_EMAIL, query: { email: result.email } });
      return;
    }

    if (result.reason === 'emailTaken') {
      const message = t('errors.emailTaken');
      setError('email', { message });
      toast.error(message);
      return;
    }

    // Unexpected validation rejection, transport failure, or 5xx.
    toast.error(t('errors.serverError'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <TextField
        id="name"
        type="text"
        autoComplete="name"
        label={t('name')}
        placeholder={AUTH_FIELD_PLACEHOLDERS.NAME}
        error={errors.name?.message}
        {...register('name')}
      />

      <TextField
        id="email"
        type="email"
        autoComplete="email"
        label={t('email')}
        placeholder={AUTH_FIELD_PLACEHOLDERS.EMAIL}
        error={errors.email?.message}
        {...register('email')}
      />

      <TextField
        id="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
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

      <TextField
        id="confirmPassword"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        label={t('confirmPassword')}
        placeholder={AUTH_FIELD_PLACEHOLDERS.PASSWORD}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <TextField
        id="referral"
        type="text"
        autoComplete="off"
        label={t('referral')}
        placeholder={t('referralPlaceholder')}
        error={errors.referral?.message}
        {...register('referral')}
      />

      <div className="flex flex-col gap-2">
        {/* Links are interactive content, so clicking them never toggles the
            box (per the <label> activation spec) — only the text/box do. */}
        <label htmlFor="agreeTerms" className="flex cursor-pointer items-start gap-3">
          <Checkbox
            id="agreeTerms"
            aria-invalid={!!errors.agreeTerms}
            {...register('agreeTerms')}
          />
          <span className="text-sm leading-snug text-[var(--color-text-muted)]">
            {t.rich('agreeTerms', {
              // Placeholder anchors until the legal pages land — matches the
              // footer's terms/privacy links (no real routes exist yet).
              terms: (chunks) => (
                <a
                  href="#"
                  className="font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
                >
                  {chunks}
                </a>
              ),
              privacy: (chunks) => (
                <a
                  href="#"
                  className="font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
                >
                  {chunks}
                </a>
              ),
            })}
          </span>
        </label>
        {errors.agreeTerms && (
          <p role="alert" className="text-xs text-[var(--color-danger)]">
            {errors.agreeTerms.message}
          </p>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
