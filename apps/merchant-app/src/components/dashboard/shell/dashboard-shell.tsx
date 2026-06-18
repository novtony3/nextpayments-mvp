'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@nextpayments/ui/lib/utils';

import { SHOW_VERIFY_BANNER } from '@/constants/dashboard';
import type { HeaderUser } from '@/lib/auth/types';
import type { HeaderBalancesResult } from '@/lib/fund/types';
import { SessionExpiryWatcher } from '@/components/shared/session-expiry-watcher';

import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardTopbar } from './dashboard-topbar';
import { VerifyBanner } from './verify-banner';

type DashboardShellProps = {
  children: ReactNode;
  /** Header identity resolved server-side in the protected layout. Drives the
   * topbar account menu (correct on first paint, no flash) and the verify
   * banner gate. */
  user: HeaderUser | null;
  /** Server-rendered spendable balances for the header selector. */
  initialBalances: HeaderBalancesResult;
};

const SIDEBAR_WIDTH = 'w-64';

/**
 * Mobile drawer slide/fade duration (ms). A touch quicker than the bottom
 * Sheet (a nav drawer should feel snappier than a content sheet) while staying
 * in the app's calm motion language; the curve itself reuses the shared
 * `--interaction-easing` token.
 */
const DRAWER_TRANSITION_MS = 320;

/**
 * Dashboard frame: a verify banner (only for unverified accounts), a
 * persistent sidebar (static from `lg`, a slide-in drawer below it), and the
 * top bar. The auth guard stays in the server `(protected)/layout`; this only
 * owns presentation + the mobile drawer state.
 */
export function DashboardShell({ children, user, initialBalances }: DashboardShellProps) {
  const t = useTranslations('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  // `rendered` keeps the drawer in the DOM through its close so the slide-out
  // + backdrop fade play before unmount; `shown` drives the enter/leave
  // transform + opacity. Mirrors the shared bottom Sheet's proven approach.
  const [rendered, setRendered] = useState(false);
  const [shown, setShown] = useState(false);
  const reducedRef = useRef(false);

  // Banner is a feature flag (master switch) AND gated on real account state —
  // hidden once the email is verified.
  const showVerifyBanner = SHOW_VERIFY_BANNER && !user?.emailVerified;

  useEffect(() => {
    reducedRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Drive mount/enter on open and leave/unmount on close. Under reduced motion
  // it snaps instantly (no slide). The two rAFs mount the panel off-screen,
  // then flip `shown` so the browser transitions from the off-screen frame.
  useEffect(() => {
    const rafs: number[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (mobileOpen) {
      setRendered(true);
      if (reducedRef.current) {
        setShown(true);
      } else {
        rafs.push(
          requestAnimationFrame(() => {
            rafs.push(requestAnimationFrame(() => setShown(true)));
          }),
        );
      }
    } else {
      setShown(false);
      if (reducedRef.current) {
        setRendered(false);
      } else {
        timer = setTimeout(() => setRendered(false), DRAWER_TRANSITION_MS);
      }
    }

    return () => {
      rafs.forEach(cancelAnimationFrame);
      if (timer) clearTimeout(timer);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const drawerDuration = reducedRef.current ? 0 : DRAWER_TRANSITION_MS;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--color-bg)]">
      <SessionExpiryWatcher />
      {showVerifyBanner && (
        <div className="shrink-0">
          <VerifyBanner />
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            'hidden h-full shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:block',
            SIDEBAR_WIDTH,
          )}
        >
          <DashboardSidebar />
        </aside>

        {rendered && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop fades with opacity. No `backdrop-blur` here on purpose:
                re-rasterizing a blur every opacity frame janks the slide (the
                same lesson the shared Sheet documents); the tint + panel
                shadow give enough depth. */}
            <button
              type="button"
              aria-label={t('closeMenu')}
              onClick={() => setMobileOpen(false)}
              style={{ transitionDuration: `${drawerDuration}ms` }}
              className={cn(
                'absolute inset-0 bg-[color-mix(in_oklab,var(--color-bg)_72%,transparent)] transition-opacity ease-out',
                shown ? 'opacity-100' : 'opacity-0',
              )}
            />
            <div
              style={{
                transitionDuration: `${drawerDuration}ms`,
                transitionTimingFunction: 'var(--interaction-easing)',
                // Pin the panel to its own compositor layer so the shadow +
                // nav content aren't re-rasterized each frame of the slide.
                willChange: 'transform',
                transform: shown ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)',
              }}
              className={cn(
                'absolute inset-y-0 left-0 transform-gpu border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl transition-transform',
                SIDEBAR_WIDTH,
              )}
            >
              <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <DashboardTopbar
            user={user}
            onMenuClick={() => setMobileOpen(true)}
            initialBalances={initialBalances}
          />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
