import type { ReactNode } from 'react';

import { ROUTES } from '@/constants/routes';
import { redirect } from '@/i18n/routing';
import { getCurrentUser, isAuthenticated } from '@/lib/auth/session';
import { DashboardShell } from '@/components/dashboard/shell/dashboard-shell';

type ProtectedLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-side guard for the `(protected)` route group. Reading the session
 * cookie makes these routes dynamic (expected for authed pages). Refresh is
 * NOT done here — a layout cannot mutate cookies; the login page performs the
 * explicit refresh when only a refresh cookie remains.
 *
 * Resolves `emailVerified` here (server-side, cookie-authed) and threads it
 * to the shell so the verify banner only shows for unverified accounts.
 */
export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = await params;

  if (!(await isAuthenticated())) {
    redirect({ href: ROUTES.LOGIN, locale });
  }

  const user = await getCurrentUser();
  const emailVerified = Boolean(user?.emailVerified);

  return <DashboardShell emailVerified={emailVerified}>{children}</DashboardShell>;
}
