import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { RETURN_TO_PARAM } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { redirect } from '@/i18n/routing';
import { stripLocalePrefix } from '@/lib/auth/return-to';
import { getHeaderUser, isAuthenticated } from '@/lib/auth/session';
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
 * Resolves the header identity here (server-side, cookie-authed) and threads
 * it to the shell, so the topbar account menu renders correctly on first
 * paint (no "Get started" flash on locale switch) and the verify banner only
 * shows for unverified accounts.
 */
export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = await params;

  if (!(await isAuthenticated())) {
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

  const user = await getHeaderUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
