'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { SESSION_CHECK_INTERVAL_MS } from '@/constants/auth';
import { isSessionActiveAction } from '@/lib/auth/actions';
import { useWindowFocus } from '@/lib/hooks/use-window-focus';
import { usePathname } from '@/i18n/routing';

/** Single stable id so repeated checks never stack duplicate toasts. */
const SESSION_EXPIRED_TOAST_ID = 'session-expired';

/**
 * Watches for an expired session and tells the user, once. The `(protected)`
 * layout guard only runs on full loads — client-side navigation between sibling
 * pages does not re-run it, so when the access cookie lapses mid-session the
 * page's data fetch just 401s into a generic "service unavailable" message with
 * no hint the session ended. This fills that gap: it polls a cookie-only Server
 * Action ({@link isSessionActiveAction}, no backend call) on mount, on every
 * route change, on tab refocus, and on a slow idle interval. The first time the
 * session is gone it raises a persistent toast with a Reload action — reloading
 * self-heals via the login page's silent refresh when the refresh cookie is
 * still valid, otherwise it lands on login. Renders nothing.
 */
export function SessionExpiryWatcher() {
  const t = useTranslations('dashboard.session');
  const pathname = usePathname();
  const notifiedRef = useRef(false);

  const checkSession = useCallback(async () => {
    if (notifiedRef.current) return;
    const active = await isSessionActiveAction();
    if (active || notifiedRef.current) return;
    notifiedRef.current = true;
    toast.error(t('expired.message'), {
      id: SESSION_EXPIRED_TOAST_ID,
      duration: Infinity,
      action: {
        label: t('expired.reload'),
        onClick: () => window.location.reload(),
      },
    });
  }, [t]);

  // On mount and whenever the route changes (catches the stale-nav 401 case).
  useEffect(() => {
    void checkSession();
  }, [checkSession, pathname]);

  // When the user returns to the tab after being away.
  useWindowFocus(() => void checkSession());

  // Idle fallback for a user who stays on one focused page past expiry.
  useEffect(() => {
    const intervalId = window.setInterval(() => void checkSession(), SESSION_CHECK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [checkSession]);

  return null;
}
