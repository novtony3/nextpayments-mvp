import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

/**
 * Admin i18n — same react-i18next stack the merchant app's Sprint-4 plan
 * specifies (PLAN §5.2). English only for now; Vietnamese is intentionally
 * not wired yet. To add it later: drop `locales/vi.json`, register it in
 * `resources`, and expose a language switcher — no other change needed.
 */
export const DEFAULT_LOCALE = 'en' as const;
export const SUPPORTED_LOCALES = ['en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LOCALES,
  interpolation: { escapeValue: false },
});

export default i18n;
