'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { AUTH_FIELD_PLACEHOLDERS } from '@/constants/auth';
import { forgotPasswordAction } from '@/lib/auth/actions';
import { TextField } from '@/components/shared/text-field';

/**
 * "Forgot password" entry: collects the account email and triggers the backend
 * to mail a reset link. On success it flips to a generic "check your email"
 * confirmation that echoes the address — the action reports success even for an
 * unknown email, so this view never reveals which addresses are registered.
 * Owns its own header so the sent-state can swap the title cleanly (same
 * approach as VerifyEmailConfirm).
 */
export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword');
  const [sentTo, setSentTo] = useState<string | null>(null);

  // Schema built inside the component so validation messages follow the locale.
  const schema = z.object({
    email: z
      .string()
      .min(1, { message: t('errors.emailRequired') })
      .email({ message: t('errors.emailInvalid') }),
  });

  type ForgotValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotValues) => {
    const result = await forgotPasswordAction(values);
    if (result.ok) {
      setSentTo(values.email);
      return;
    }
    // Transport failure (tunnel down), 5xx, or unexpected response shape.
    toast.error(t('errors.serverError'));
  };

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text)]">
            {t('sentTitle')}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {t('sentBody', { email: sentTo })}
          </p>
          <p className="text-xs text-[var(--color-text-subtle)]">{t('hint')}</p>
        </div>
        <Button asChild variant="primary" size="lg" fullWidth>
          <Link href={ROUTES.LOGIN}>{t('backToLogin')}</Link>
        </Button>
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
          id="email"
          type="email"
          autoComplete="email"
          label={t('email')}
          placeholder={AUTH_FIELD_PLACEHOLDERS.EMAIL}
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-text-muted)]">
        <Link
          href={ROUTES.LOGIN}
          className="font-medium text-[var(--color-accent)] underline-offset-4 transition-colors hover:underline"
        >
          {t('backToLogin')}
        </Link>
      </p>
    </div>
  );
}
