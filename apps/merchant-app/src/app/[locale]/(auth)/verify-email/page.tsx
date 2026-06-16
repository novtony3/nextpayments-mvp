import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MailCheck } from 'lucide-react';

import { Button } from '@nextpayments/ui/components/button';

import { ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/shared/logo';
import { BlueAccent } from '@/components/shared/blue-accent';
import { CryptoCoinsBackdrop } from '@/components/shared/crypto-coins-backdrop';
import { VerifyEmailConfirm } from '@/components/auth/verify-email-confirm';

type VerifyEmailPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** First value of a search param (repeated keys arrive as an array). */
function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Two modes sharing the (auth) shell (aurora + floating coins + centered card):
 *
 * 1. `?hash=` present — the link from the verification email. {@link
 *    VerifyEmailConfirm} consumes it against `GET /user/verify-email?hash=` and
 *    shows the verifying → verified / invalid result.
 * 2. otherwise — the "check your email" notice shown after signup. The register
 *    flow redirects here with `?email=` to echo the address back; a generic
 *    variant renders when it's absent (e.g. opened directly).
 */
export default async function VerifyEmailPage({ params, searchParams }: VerifyEmailPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const hash = firstParam(sp.hash);
  const email = firstParam(sp.email);

  const t = await getTranslations('auth.verifyEmail');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)] px-6 py-16">
      {/* Gemini Desktop signature: deep blue aurora rising from the floor. */}
      <BlueAccent intensity="subtle" feather={false} />
      {/* Frosted-glass crypto coins floating in 3D behind the card. */}
      <CryptoCoinsBackdrop />

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="mb-10 flex justify-center">
          <Link href={ROUTES.HOME}>
            <Logo size={32} />
          </Link>
        </div>

        {hash ? (
          <VerifyEmailConfirm hash={hash} />
        ) : (
          <div className="flex flex-col items-center gap-5 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <MailCheck className="h-7 w-7" aria-hidden="true" />
            </span>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text)]">
                {t('title')}
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">
                {email ? t('body', { email }) : t('genericBody')}
              </p>
              <p className="text-xs text-[var(--color-text-subtle)]">{t('hint')}</p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Button asChild variant="primary" size="lg" fullWidth>
                <Link href={ROUTES.LOGIN}>{t('goToLogin')}</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" fullWidth>
                <Link href={ROUTES.REGISTER}>{t('backToRegister')}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
