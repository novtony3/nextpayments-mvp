'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import type { HeaderUser } from '@/lib/auth/types';

import { UserMenu } from './user-menu';

type AuthControlsProps = {
  /** Session identity resolved server-side (marketing layout → Header). When
   * non-null the user menu renders; otherwise the logged-out CTAs. */
  user: HeaderUser | null;
  /** Close the mobile menu after a navigation. */
  onNavigate?: () => void;
};

/**
 * Header auth slot — a pure function of the server-resolved `user`. No client
 * session fetch and no local state, so it renders the correct chrome on the
 * first paint and never flashes "Get started" before resolving. (The previous
 * useEffect approach re-initialised to null on every mount, flashing the CTA
 * on each locale switch — which remounts this subtree.) After login/logout,
 * `router.refresh()` re-renders the layout and a fresh `user` flows down.
 */
export function AuthControls({ user, onNavigate }: AuthControlsProps) {
  const t = useTranslations('nav');

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
