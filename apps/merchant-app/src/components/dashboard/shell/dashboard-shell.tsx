'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@nextpayments/ui/lib/utils';

import { SHOW_VERIFY_BANNER } from '@/constants/dashboard';

import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardTopbar } from './dashboard-topbar';
import { VerifyBanner } from './verify-banner';

type DashboardShellProps = {
  children: ReactNode;
};

const SIDEBAR_WIDTH = 'w-64';

/**
 * Dashboard frame: optional verify banner, a persistent sidebar (static from
 * `lg`, a slide-in drawer below it), and the top bar. The auth guard stays in
 * the server `(protected)/layout`; this only owns presentation + the mobile
 * drawer state.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const t = useTranslations('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      {SHOW_VERIFY_BANNER && <VerifyBanner />}

      <div className="flex flex-1">
        <aside
          className={cn(
            'sticky top-0 hidden h-screen shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:block',
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

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
