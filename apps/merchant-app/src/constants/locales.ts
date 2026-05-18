import type { Locale } from '@/i18n/routing';

/**
 * Display metadata for every supported merchant locale — single source of
 * truth for the language switcher. `Record<Locale, …>` is intentional: adding
 * a locale to `routing.locales` without a label here is a compile error, so
 * the switcher always stays in sync.
 *
 * - `short`  — compact code shown in the header trigger (e.g. `EN`).
 * - `native` — the language endonym, shown in its own language. Endonyms are
 *   invariant across UI locales (`Français` is `Français` everywhere), so they
 *   live here, not in i18n messages.
 *
 * To add a language: add it to `routing.locales`, add one entry below, and
 * drop a matching `src/i18n/messages/<code>.json`. Nothing else changes.
 */
export const LOCALE_LABELS = {
  en: { short: 'EN', native: 'English' },
  fr: { short: 'FR', native: 'Français' },
} as const satisfies Record<Locale, { short: string; native: string }>;
