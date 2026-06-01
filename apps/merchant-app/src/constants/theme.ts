/**
 * Accent-color theming constants. The user picks one of these palettes in
 * /pay-settings → Appearance; the choice persists per-device in a cookie and
 * is applied to `<html data-accent="…">` before first paint (see
 * components/shared/accent-script.tsx). Each key maps to a
 * `:root[data-accent='<key>']` override in
 * packages/config/tailwind/theme.css — keep the three lists in sync.
 */

/** Cookie that stores the chosen accent key (per-device, not httpOnly so the
 * client picker + the pre-paint script can read/write it). */
export const ACCENT_COOKIE = 'np_accent' as const;

/** Cookie lifetime — 1 year. The preference is a device-level convenience. */
export const ACCENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The selectable palettes. `swatch` is only used to paint the picker dots —
 * the real applied color flows through the `--color-brand-blue` CSS var per
 * `data-accent`, never a hardcoded hex at a call site.
 */
export const ACCENT_PALETTES = [
  { key: 'blue', swatch: '#4796e3' },
  { key: 'violet', swatch: '#8b5cf6' },
  { key: 'emerald', swatch: '#2fb87a' },
  { key: 'rose', swatch: '#f43f6b' },
  { key: 'amber', swatch: '#f59e0b' },
  { key: 'cyan', swatch: '#1ca6c4' },
  { key: 'indigo', swatch: '#6366f1' },
  { key: 'teal', swatch: '#14b8a6' },
] as const;

export type AccentKey = (typeof ACCENT_PALETTES)[number]['key'];

/** Default accent — the original Gemini blue, applied when no cookie is set
 * (no `data-accent` attribute → base token). */
export const DEFAULT_ACCENT: AccentKey = 'blue';

/** All valid keys — used to validate the cookie value before applying it. */
export const ACCENT_KEYS: readonly AccentKey[] = ACCENT_PALETTES.map((p) => p.key);

/** Narrow an untrusted string to a known accent key, else the default. */
export function normalizeAccent(value: string | undefined): AccentKey {
  return value && (ACCENT_KEYS as readonly string[]).includes(value)
    ? (value as AccentKey)
    : DEFAULT_ACCENT;
}
