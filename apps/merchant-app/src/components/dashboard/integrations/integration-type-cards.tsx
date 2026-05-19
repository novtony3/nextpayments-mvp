'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { INTEGRATION_TYPE_META } from '@/constants/integrations';
import type { IntegrationType } from '@/lib/integrations/types';

import { INTEGRATION_TYPE_ICONS } from './type-icons';

type IntegrationTypeCardsProps = {
  onSelect: (type: IntegrationType) => void;
};

/** Step 1 of the sheet: pick the integration type (Image 6). */
export function IntegrationTypeCards({ onSelect }: IntegrationTypeCardsProps) {
  const t = useTranslations('dashboard.integrations');

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base font-semibold text-[var(--color-text)]">{t('sheet.question')}</p>
      {INTEGRATION_TYPE_META.map(({ key }) => {
        const Icon = INTEGRATION_TYPE_ICONS[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className="group flex items-center gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)] p-4 text-left transition-colors duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--color-text)]">
                {t(`types.${key}.title`)}
              </span>
              <span className="block text-xs text-[var(--color-text-muted)]">
                {t(`types.${key}.description`)}
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-[var(--color-text-subtle)] transition-colors group-hover:text-[var(--color-accent)]"
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
