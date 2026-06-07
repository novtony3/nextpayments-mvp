'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { IconButton } from '@nextpayments/ui/components/icon-button';

import { DASHBOARD_NAV } from '@/constants/dashboard';
import { usePathname } from '@/i18n/routing';
import type { HeaderUser } from '@/lib/auth/types';
import { AuthControls } from '@/components/auth/auth-controls';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { ThemeToggle } from '@/components/shared/theme-toggle';

import { DASHBOARD_ICONS } from './nav-icons';

type DashboardTopbarProps = {
  /** Header identity resolved server-side (protected layout → shell). */
  user: HeaderUser | null;
  /** Opens the mobile navigation drawer. */
  onMenuClick: () => void;
};

const DEFAULT_NAV = DASHBOARD_NAV[0]!;

/**
 * Dashboard top bar — shows the active section (icon + title, derived from
 * the pathname so it stays in sync without prop drilling) and the account
 * controls. Reuses the shared language/theme/auth chrome rather than forking
 * a second copy.
 */
export function DashboardTopbar({ user, onMenuClick }: DashboardTopbarProps) {
  const t = useTranslations('dashboard');
  const pathname = usePathname();

  const current =
    DASHBOARD_NAV.find(
      (item) =>
        pathname === item.route || (item.route !== '/' && pathname.startsWith(`${item.route}/`)),
    ) ?? DEFAULT_NAV;
  const Icon = DASHBOARD_ICONS[current.icon];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_72%,transparent)] backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <IconButton
          aria-label={t('openMenu')}
          icon={<Menu className="h-5 w-5" />}
          onClick={onMenuClick}
          className="lg:hidden"
        />

        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <h1 className="text-lg font-semibold text-[var(--color-text)]">
          {t(`nav.${current.key}`)}
        </h1>

        <div className="ml-auto flex items-center gap-1.5">
          {/* TODO: re-enable — display-currency ($ USD) selector temporarily hidden.
          <SelectField
            aria-label={t('fiatSelector')}
            defaultValue={FIAT.code}
            options={[{ value: FIAT.code, label: `${FIAT.symbol} ${FIAT.code}` }]}
            className="hidden sm:inline-flex"
          />
          */}
          <LanguageSwitcher />
          <ThemeToggle />
          <AuthControls user={user} />
        </div>
      </div>
    </header>
  );
}
