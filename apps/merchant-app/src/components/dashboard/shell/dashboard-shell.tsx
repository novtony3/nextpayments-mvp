'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@nextpayments/ui/lib/utils';

import { SHOW_VERIFY_BANNER } from '@/constants/dashboard';
import type { HeaderUser } from '@/lib/auth/types';

import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardTopbar } from './dashboard-topbar';
import { VerifyBanner } from './verify-banner';

type DashboardShellProps = {
  children: ReactNode;
  /** Header identity resolved server-side in the protected layout. Drives the
   * topbar account menu (correct on first paint, no flash) and the verify
   * banner gate. */
  user: HeaderUser | null;
};

const SIDEBAR_WIDTH = 'w-64';

/**
 * Dashboard frame: a verify banner (only for unverified accounts), a
 * persistent sidebar (static from `lg`, a slide-in drawer below it), and the
 * top bar. The auth guard stays in the server `(protected)/layout`; this only
 * owns presentation + the mobile drawer state.
 */
export function DashboardShell({ children, user }: DashboardShellProps) {
  const t = useTranslations('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Banner is a feature flag (master switch) AND gated on real account state —
  // hidden once the email is verified.
  const showVerifyBanner = SHOW_VERIFY_BANNER && !user?.emailVerified;

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--color-bg)]">
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

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label={t('closeMenu')}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-[color-mix(in_oklab,var(--color-bg)_70%,transparent)] backdrop-blur-sm"
            />
            <div
              className={cn(
                'absolute inset-y-0 left-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl',
                SIDEBAR_WIDTH,
              )}
            >
              <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <DashboardTopbar user={user} onMenuClick={() => setMobileOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
