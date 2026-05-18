import { useTranslation } from 'react-i18next';

import { cn } from '@nextpayments/ui/lib/utils';

import { NAV_ITEMS } from '@/constants/nav';
import { useUiStore } from '@/store/ui-store';
import { BrandMark } from '@/components/brand-mark';

export function Sidebar() {
  const { t } = useTranslation();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  // Static demo: first item is the active route (no router yet, UI-only phase).
  const activeId = NAV_ITEMS[0]?.id;

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-5 transition-[width] duration-300 lg:flex',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <div className={cn('px-2', collapsed && 'flex justify-center px-0')}>
        <BrandMark
          appName={t('common.appName')}
          suffix={t('common.appSuffix')}
          collapsed={collapsed}
        />
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, labelKey, icon: Icon, href }) => {
          const active = id === activeId;
          return (
            <a
              key={id}
              href={href}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? t(labelKey) : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--glass-fill)] hover:text-[var(--color-text)]',
              )}
            >
              <Icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0',
                  active && 'text-[var(--color-accent)]',
                )}
                strokeWidth={1.75}
              />
              {!collapsed && <span>{t(labelKey)}</span>}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
