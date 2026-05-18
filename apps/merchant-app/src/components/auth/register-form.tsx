'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@nextpayments/ui/components/button';

import { useRouter } from '@/i18n/routing';
import { DUMMY_USERS } from '@/constants/dummy-users';
import { ROUTES } from '@/constants/routes';
import {
  AUTH_FIELD_PLACEHOLDERS,
  AUTH_MOCK_DELAY_MS,
  PASSWORD_MIN_LENGTH,
} from '@/constants/auth';
import { TextField } from '@/components/auth/text-field';
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
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterValues) => {
    // Simulate a network round-trip so the loading state is visible (UI-only phase).
    await new Promise((resolve) => setTimeout(resolve, AUTH_MOCK_DELAY_MS.REGISTER));

    const taken = DUMMY_USERS.some((u) => u.email === values.email);
    if (taken) {
      const message = t('errors.emailTaken');
      setError('email', { message });
      toast.error(message);
      return;
    }

    toast.success(t('success', { name: values.name }));
    router.push(ROUTES.HOME);
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

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
