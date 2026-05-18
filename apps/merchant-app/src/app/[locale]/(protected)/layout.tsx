import type { ReactNode } from 'react';

import { ROUTES } from '@/constants/routes';
import { redirect } from '@/i18n/routing';
import { isAuthenticated } from '@/lib/auth/session';

type ProtectedLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-side guard for the `(protected)` route group. Reading the session
 * cookie makes these routes dynamic (expected for authed pages). Refresh is
 * NOT done here — a layout cannot mutate cookies; the login page performs the
 * explicit refresh when only a refresh cookie remains.
 */
export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = await params;

  if (!(await isAuthenticated())) {
    redirect({ href: ROUTES.LOGIN, locale });
  }

  return <>{children}</>;
}
