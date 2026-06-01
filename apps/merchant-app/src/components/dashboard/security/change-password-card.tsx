'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@nextpayments/ui/components/button';

import { AUTH_FIELD_PLACEHOLDERS, PASSWORD_MIN_LENGTH } from '@/constants/auth';
import { SECURITY_ERROR_CODE } from '@/constants/security';
import { changePasswordAction } from '@/lib/security/actions';
import { TextField } from '@/components/shared/text-field';
import { PasswordToggle } from '@/components/auth/password-toggle';

import { SecurityCard } from './security-card';

type FieldKey = 'oldPassword' | 'password';
type ChangePasswordFieldErrorKey = 'wrongOldPassword' | 'passwordTooShort';

/** Backend error code → which field gets the inline message. */
const FIELD_BY_REASON: Record<ChangePasswordFieldErrorKey, FieldKey> = {
  wrongOldPassword: 'oldPassword',
  passwordTooShort: 'password',
};

function isFieldErrorKey(value: string | undefined): value is ChangePasswordFieldErrorKey {
  return value === 'wrongOldPassword' || value === 'passwordTooShort';
}

export function ChangePasswordCard() {
  const t = useTranslations('paySettings.security.changePassword');
  const tErr = useTranslations('paySettings.security.errors');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const schema = z
    .object({
      oldPassword: z.string().min(1, { message: t('errors.oldRequired') }),
      password: z
        .string()
        .min(1, { message: t('errors.newRequired') })
        .min(PASSWORD_MIN_LENGTH, { message: t('errors.newTooShort') }),
      confirmPassword: z.string().min(1, { message: t('errors.confirmRequired') }),
    })
    .refine((v) => v.password === v.confirmPassword, {
      path: ['confirmPassword'],
      message: t('errors.mismatch'),
    });

  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { oldPassword: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: Values) => {
    // confirmPassword is a client-only guard — the backend only needs the
    // current + new password.
    const result = await changePasswordAction({
      oldPassword: values.oldPassword,
      password: values.password,
    });
    if (result.ok) {
      toast.success(t('success'));
      reset({ oldPassword: '', password: '', confirmPassword: '' });
      return;
    }
    if (result.reason === 'invalid') {
      const reasonKey = result.code ? SECURITY_ERROR_CODE[result.code] : undefined;
      if (isFieldErrorKey(reasonKey)) {
        const field = FIELD_BY_REASON[reasonKey];
        const message = tErr(reasonKey);
        setError(field, { message });
        toast.error(message);
        return;
      }
      const message = t('errors.invalid');
      setError('oldPassword', { message });
      toast.error(message);
      return;
    }
    toast.error(t('errors.server'));
  };

  return (
    <SecurityCard title={t('title')} description={t('description')}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <TextField
          id="oldPassword"
          type={showOld ? 'text' : 'password'}
          autoComplete="current-password"
          label={t('oldPasswordLabel')}
          placeholder={AUTH_FIELD_PLACEHOLDERS.PASSWORD}
          error={errors.oldPassword?.message}
          trailing={
            <PasswordToggle
              shown={showOld}
              onToggle={() => setShowOld((v) => !v)}
              labelShow={t('showPassword')}
              labelHide={t('hidePassword')}
            />
          }
          {...register('oldPassword')}
        />

        <TextField
          id="newPassword"
          type={showNew ? 'text' : 'password'}
          autoComplete="new-password"
          label={t('newPasswordLabel')}
          placeholder={AUTH_FIELD_PLACEHOLDERS.PASSWORD}
          error={errors.password?.message}
          trailing={
            <PasswordToggle
              shown={showNew}
              onToggle={() => setShowNew((v) => !v)}
              labelShow={t('showPassword')}
              labelHide={t('hidePassword')}
            />
          }
          {...register('password')}
        />

        <TextField
          id="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          label={t('confirmPasswordLabel')}
          placeholder={AUTH_FIELD_PLACEHOLDERS.PASSWORD}
          error={errors.confirmPassword?.message}
          trailing={
            <PasswordToggle
              shown={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              labelShow={t('showPassword')}
              labelHide={t('hidePassword')}
            />
          }
          {...register('confirmPassword')}
        />

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </div>
      </form>
    </SecurityCard>
  );
}
