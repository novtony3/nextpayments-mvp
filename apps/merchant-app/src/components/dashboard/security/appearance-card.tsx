'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@nextpayments/ui/lib/utils';

import {
  ACCENT_COOKIE,
  ACCENT_COOKIE_MAX_AGE,
  ACCENT_PALETTES,
  DEFAULT_ACCENT,
  normalizeAccent,
  type AccentKey,
} from '@/constants/theme';

import { SecurityCard } from './security-card';

/** Apply the accent to <html> + persist it per-device. `blue` (default)
 * removes the attribute so the base token is used. */
function applyAccent(key: AccentKey): void {
  const root = document.documentElement;
  if (key === DEFAULT_ACCENT) {
    root.removeAttribute('data-accent');
  } else {
    root.setAttribute('data-accent', key);
  }
  document.cookie = `${ACCENT_COOKIE}=${key}; path=/; max-age=${ACCENT_COOKIE_MAX_AGE}; samesite=lax`;
}

/**
 * Theme-color picker. Eight swatches; clicking one retunes the whole accent
 * identity instantly (no reload) and stores the choice in a cookie so the
 * pre-paint script restores it on the next load. Initial selection is read
 * from the live `data-accent` attribute the script already set.
 */
export function AppearanceCard() {
  const t = useTranslations('paySettings.appearance');
  const tColors = useTranslations('paySettings.appearance.colors');
  const [active, setActive] = useState<AccentKey>(DEFAULT_ACCENT);

  // The pre-paint script set data-accent before hydration; mirror it into
  // state once mounted (avoids a hydration mismatch on the active ring).
  useEffect(() => {
    setActive(normalizeAccent(document.documentElement.dataset.accent));
  }, []);

  const select = (key: AccentKey) => {
    applyAccent(key);
    setActive(key);
  };

  return (
    <SecurityCard title={t('title')} description={t('description')}>
      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
          {t('colorLabel')}
        </span>
        <div className="flex flex-wrap gap-3">
          {ACCENT_PALETTES.map(({ key, swatch }) => {
            const selected = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => select(key)}
                aria-pressed={selected}
                aria-label={tColors(key)}
                title={tColors(key)}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-full transition-transform',
                  'ring-2 ring-offset-2 ring-offset-[var(--color-surface)] hover:scale-105',
                  'focus-visible:outline-none focus-visible:ring-[var(--color-text)]',
                  selected ? 'ring-[var(--color-text)]' : 'ring-transparent',
                )}
                style={{ backgroundColor: swatch }}
              >
                {selected && (
                  <Check className="h-4 w-4 text-white" strokeWidth={3} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </SecurityCard>
  );
}
