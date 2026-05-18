'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import { currentUserAction } from '@/lib/auth/actions';
import type { HeaderUser } from '@/lib/auth/types';

import { UserMenu } from './user-menu';

type AuthControlsProps = {
  /** Close the mobile menu after a navigation. */
  onNavigate?: () => void;
};

/**
 * Header auth slot. Resolves the session client-side (Server Action reading
 * the httpOnly cookie) so the public landing stays statically rendered. The
 * logged-out CTAs are the stable initial render (server + pre-effect client),
 * so there is no hydration mismatch — it upgrades to the user menu once the
 * session resolves, like the theme toggle's mounted pattern.
 */
export function AuthControls({ onNavigate }: AuthControlsProps) {
  const t = useTranslations('nav');
  const [user, setUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    let active = true;
    void currentUserAction().then((resolved) => {
      if (active) setUser(resolved);
    });
    return () => {
      active = false;
    };
  }, []);

  if (user) {
    return <UserMenu user={user} onNavigate={onNavigate} />;
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={ROUTES.LOGIN}
        onClick={onNavigate}
        className="rounded-full px-3 py-1.5 text-[13px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        {t('login')}
      </Link>
      <Button asChild size="sm">
        <Link href={ROUTES.REGISTER} onClick={onNavigate}>
          {t('getStarted')}
        </Link>
      </Button>
    </div>
  );
}
