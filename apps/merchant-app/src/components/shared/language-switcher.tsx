'use client';

import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState, useTransition } from 'react';

import { Button } from '@nextpayments/ui/components/button';
import { cn } from '@nextpayments/ui/lib/utils';

import { LOCALE_LABELS } from '@/constants/locales';
import { routing, usePathname, useRouter, type Locale } from '@/i18n/routing';
import { notifyLocaleSwitch } from '@/lib/locale-switch';

/** Locale option order follows `routing.locales` (single source of truth). */
const LOCALES: ReadonlyArray<{ code: Locale } & (typeof LOCALE_LABELS)[Locale]> =
  routing.locales.map((code) => ({ code, ...LOCALE_LABELS[code] }));

/**
 * Accessible language menu. A `Button` trigger discloses a `role="menu"`
 * panel of `menuitemradio` options — scales to any number of locales (driven
 * by `routing.locales`). Keyboard: ↑/↓/Home/End move, Enter/Space select,
 * Esc closes and restores focus; click-outside closes. Switching is wrapped
 * in a transition so the old page stays painted until the new locale is
 * ready (no blank), and `notifyLocaleSwitch()` suppresses the scroll-reveal
 * replay so there is no entrance "splash".
 */
export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]!;

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const selectLocale = useCallback(
    (code: Locale) => {
      close(true);
      if (code === locale) return;
      // Suppress the reveal replay, then swap inside a transition so the
      // current page stays visible until the new locale is rendered.
      notifyLocaleSwitch();
      startTransition(() => {
        router.replace(pathname, { locale: code });
      });
    },
    [close, locale, pathname, router, startTransition],
  );

  // Close on outside pointer + move focus into the menu when it opens.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);

    const activeIndex = LOCALES.findIndex((l) => l.code === locale);
    itemRefs.current[activeIndex >= 0 ? activeIndex : 0]?.focus();

    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, locale, close]);

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter((el): el is HTMLButtonElement => el !== null);
    if (items.length === 0) return;
    const currentIndex = items.findIndex((el) => el === document.activeElement);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
      case 'ArrowDown':
        e.preventDefault();
        items[(currentIndex + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Tab':
        close(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${t('language')}: ${current.native}`}
        aria-busy={isPending || undefined}
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5 px-3 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        leftIcon={<Globe className="h-3.5 w-3.5" />}
        rightIcon={
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        }
      >
        {current.short}
      </Button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t('language')}
          aria-orientation="vertical"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[10rem] overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill-strong)] p-1 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          {LOCALES.map((l, i) => {
            const active = l.code === locale;
            return (
              <button
                key={l.code}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                tabIndex={-1}
                lang={l.code}
                onClick={() => selectLocale(l.code)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
                  active
                    ? 'text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--glass-fill)] hover:text-[var(--color-text)]',
                )}
              >
                <span>{l.native}</span>
                {active && (
                  <Check
                    className="h-4 w-4 shrink-0 text-[var(--color-accent)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
