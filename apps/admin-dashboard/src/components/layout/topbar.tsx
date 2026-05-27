import { PanelLeft, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useUiStore } from '@/store/ui-store';

export function Topbar() {
  const { t } = useTranslation();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_75%,transparent)] px-5 backdrop-blur-2xl">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="hidden h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--glass-fill)] hover:text-[var(--color-text)] lg:inline-flex"
      >
        <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>

      <div className="relative w-full max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]"
          strokeWidth={1.75}
        />
        <input
          type="search"
          placeholder={t('common.search')}
          className="h-10 w-full rounded-xl border border-[var(--color-border-strong)] bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] pl-9 pr-4 text-sm text-[var(--color-text)] backdrop-blur-md transition-colors placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)]"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-sm font-medium text-[var(--color-accent)]"
          aria-hidden
        >
          A
        </span>
      </div>
    </header>
  );
}
