'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { useRouter } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { AUTH_MOCK_DELAY_MS } from '@/constants/auth';

/** Google "G" mark — official 4-color logo, inline so we ship no extra dep. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function SocialButtons() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    setLoading(true);
    // Fake OAuth — simulate the redirect handoff, then land on the homepage.
    setTimeout(() => router.push(ROUTES.HOME), AUTH_MOCK_DELAY_MS.OAUTH);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-[var(--color-border-strong)]" />
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
          {t('or')}
        </span>
        <span className="h-px flex-1 bg-[var(--color-border-strong)]" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        fullWidth
        loading={loading}
        onClick={handleGoogle}
        leftIcon={<GoogleIcon />}
      >
        {t('continueWithGoogle')}
      </Button>
    </div>
  );
}
