import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { RETURN_TO_PARAM } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { redirect } from '@/i18n/routing';
import { stripLocalePrefix } from '@/lib/auth/return-to';
import { getHeaderUser } from '@/lib/auth/session';
import { DashboardShell } from '@/components/dashboard/shell/dashboard-shell';

type ProtectedLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-side guard for the `(protected)` route group. Reading the session
 * cookie makes these routes dynamic (expected for authed pages). Refresh is
 * NOT done here — a layout cannot mutate cookies; the login page performs the
 * explicit refresh when only a refresh cookie remains. The requested path
 * (from the `x-pathname` header the middleware sets) is passed as `returnTo`
 * so recovery sends the user back to where they were, not the landing page.
 *
 * The guard gates on a VALIDATED identity (`getHeaderUser`, which resolves the
 * cached `getCurrentUser` against the backend) rather than mere cookie
 * presence — a stale/invalid `np_access` cookie (e.g. left over after a
 * backend switch) must redirect to login, not let the user into a dashboard
 * whose data fetches will all fail. Resolving it here also threads the header
 * identity to the shell, so the topbar account menu renders correctly on first
 * paint (no "Get started" flash on locale switch) and the verify banner only
 * shows for unverified accounts. `getCurrentUser` is `cache()`d, so this is a
 * single backend call shared with the shell.
 */
export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = await params;

  const user = await getHeaderUser();

  if (!user) {
    const pathname = (await headers()).get('x-pathname') ?? '';
    const returnTo = stripLocalePrefix(pathname, locale);
    redirect({
      href:
        returnTo && returnTo !== '/'
          ? { pathname: ROUTES.LOGIN, query: { [RETURN_TO_PARAM]: returnTo } }
          : ROUTES.LOGIN,
      locale,
    });
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
