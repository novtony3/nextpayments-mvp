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
import { AUTH_FIELD_PLACEHOLDERS, PASSWORD_MIN_LENGTH } from '@/constants/auth';
import { loginAction } from '@/lib/auth/actions';
import { TextField } from '@/components/shared/text-field';
import { PasswordToggle } from '@/components/auth/password-toggle';

export function LoginForm() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    const result = await loginAction(values);

    if (result.ok) {
      toast.success(t('successWelcome', { name: result.displayName }));
      router.push(ROUTES.HOME);
      router.refresh(); // let server components observe the new session cookie
      return;
    }

    if (result.reason === 'invalid') {
      const message = t('errors.invalidCredentials');
      setError('email', { message });
      setError('password', { message });
      toast.error(message);
      return;
    }

    // Transport failure (tunnel down), 5xx, or unexpected response shape.
    toast.error(t('errors.serverError'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
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
