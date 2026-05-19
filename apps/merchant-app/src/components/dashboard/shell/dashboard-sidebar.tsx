'use client';

import { ChevronDown, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';
import { cn } from '@nextpayments/ui/lib/utils';

import { DASHBOARD_NAV } from '@/constants/dashboard';
import { Link, usePathname } from '@/i18n/routing';
import { Logo } from '@/components/shared/logo';

import { DASHBOARD_ICONS } from './nav-icons';

type DashboardSidebarProps = {
  /** Close the mobile drawer after navigating. */
  onNavigate?: () => void;
};

/**
 * Persistent dashboard navigation. The active item is derived from the
 * locale-stripped pathname (next-intl `usePathname`) so the highlight stays
 * correct in any locale. Single-accent Gemini styling: active = accent-soft
 * pill, idle = muted text.
 */
export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const t = useTranslations('dashboard');
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 px-4 py-6">
      <Link href="/" className="px-2" onClick={onNavigate}>
        <Logo />
      </Link>

      <nav className="flex-1">
        <ul className="flex flex-col gap-1">
          {DASHBOARD_NAV.map((item) => {
            const Icon = DASHBOARD_ICONS[item.icon];
            const active =
              pathname === item.route ||
              (item.route !== '/' && pathname.startsWith(`${item.route}/`));
            return (
              <li key={item.key}>
                <Link
                  href={item.route}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
                    active
                      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--glass-fill)] hover:text-[var(--color-text)]',
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-2 flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-[var(--color-text-subtle)]">
          <ChevronDown className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {t('nav.more')}
        </div>
      </nav>

      <Button variant="outline" size="md" fullWidth leftIcon={<Plus className="h-4 w-4" />}>
        {t('newTransaction')}
      </Button>
    </div>
  );
}
