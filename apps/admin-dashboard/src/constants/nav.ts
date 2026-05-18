import {
  ArrowLeftRight,
  LayoutDashboard,
  Settings,
  Store,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/**
 * Sidebar navigation. `labelKey` resolves against the `nav.*` i18n namespace.
 * Single source — no hardcoded labels/links at call sites.
 */
export const NAV_ITEMS: ReadonlyArray<{
  id: string;
  labelKey: `nav.${string}`;
  icon: LucideIcon;
  href: string;
}> = [
  { id: 'overview', labelKey: 'nav.overview', icon: LayoutDashboard, href: '#' },
  { id: 'transactions', labelKey: 'nav.transactions', icon: ArrowLeftRight, href: '#' },
  { id: 'merchants', labelKey: 'nav.merchants', icon: Store, href: '#' },
  { id: 'payouts', labelKey: 'nav.payouts', icon: Wallet, href: '#' },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings, href: '#' },
];
