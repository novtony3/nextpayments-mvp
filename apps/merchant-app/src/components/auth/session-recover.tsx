'use client';

import { useEffect, useRef } from 'react';

import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/routing';
import { refreshAction } from '@/lib/auth/actions';

type SessionRecoverProps = {
  /** Internal path to return to after recovery; falls back to the dashboard. */
  returnTo?: string;
};

/**
 * Rendered by the login page only when a refresh cookie exists but the access
 * cookie has expired. Silently attempts the explicit refresh; on success the
 * user is sent back to where they were (`returnTo`) — or the dashboard, never
 * the landing page — otherwise the login form (already on screen) stays. This
 * is genuine external-system sync, so an effect is the right tool.
 */
export function SessionRecover({ returnTo }: SessionRecoverProps) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard StrictMode double-invoke (refresh rotates tokens)
    ran.current = true;

    void (async () => {
      const recovered = await refreshAction();
      if (recovered) {
        router.replace(returnTo ?? ROUTES.DASHBOARD);
        router.refresh();
      }
    })();
  }, [router, returnTo]);

  return null;
}
