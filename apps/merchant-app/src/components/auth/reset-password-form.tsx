'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { MailWarning } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@nextpayments/ui/components/button';

import { Link, useRouter } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { AUTH_FIELD_PLACEHOLDERS, PASSWORD_MIN_LENGTH } from '@/constants/auth';
import { resetPasswordAction } from '@/lib/auth/actions';
import { TextField } from '@/components/shared/text-field';
import { PasswordToggle } from '@/components/auth/password-toggle';

type ResetPasswordFormProps = {
  /** Single-use token from the reset email link (`?token=`). */
  token: string;
};

/**
 * Sets a new password using the token from the reset email. Unlike the
 * verify-email flow, the token is consumed only on submit (a PUT with the new
 * password) — so this is a form, not an auto-firing effect. A rejected token
 * (used/expired) flips to an "invalid link" state with a path to request a new
 * one; success toasts and routes to sign-in. Owns its own header so the invalid
 * state can swap the title.
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations('auth.resetPassword');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // Schema built inside the component so validation messages follow the locale.
  const schema = z
    .object({
      password: z
        .string()
        .min(1, { message: t('errors.passwordRequired') })
        .min(PASSWORD_MIN_LENGTH, { message: t('errors.passwordTooShort') }),
      confirmPassword: z.string().min(1, { message: t('errors.confirmRequired') }),
    })
    .refine((v) => v.password === v.confirmPassword, {
      path: ['confirmPassword'],
      message: t('errors.passwordMismatch'),
    });

  type ResetValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetValues) => {
    const result = await resetPasswordAction({ token, password: values.password });
    if (result.ok) {
      toast.success(t('success'));
      router.push(ROUTES.LOGIN);
      return;
    }
    if (result.reason === 'invalid') {
      setInvalid(true);
      return;
    }
    // Transport failure (tunnel down), 5xx, or unexpected response shape.
    toast.error(t('errors.serverError'));
  };

  if (invalid) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--color-danger)_15%,transparent)] text-[var(--color-danger)]">
          <MailWarning className="h-7 w-7" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text)]">
            {t('invalidTitle')}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">{t('invalidBody')}</p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button asChild variant="primary" size="lg" fullWidth>
            <Link href={ROUTES.FORGOT_PASSWORD}>{t('requestNewLink')}</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" fullWidth>
            <Link href={ROUTES.LOGIN}>{t('backToLogin')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text)]">
          {t('title')}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
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

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </div>
  );
}
