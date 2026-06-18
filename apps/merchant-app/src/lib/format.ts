/**
 * Amount + date display formatting — the single source of truth for turning a
 * loose backend amount (number | numeric string) or timestamp (ISO string |
 * epoch number) into a localized display string. Replaces the per-component
 * `toNumber`/`formatAmount`/`formatCoinAmount` and `formatDate` copies that
 * drifted across the dashboard.
 *
 * ⚠️ Trust / precision: these are **display-only** and round-trip through JS
 * `number` (IEEE‑754 float), which loses precision beyond ~15–17 significant
 * digits. Do NOT use them for financial arithmetic (summing balances, fees,
 * etc.) — use the values the backend already computes, or a decimal library.
 * For showing a single amount up to 8 dp they are safe.
 */

/** Crypto amounts render up to 8 fraction digits (wei-free display precision). */
export const CRYPTO_MAX_FRACTION_DIGITS = 8;
/** Fiat / USDT amounts render with exactly 2 fraction digits. */
export const FIAT_FRACTION_DIGITS = 2;

/**
 * Coerce a backend amount (`number`, numeric `string`, or anything) to a finite
 * number, or `null` when it is missing / not a valid number. Callers decide the
 * fallback (a dash, `0`, the raw value, …) instead of a baked-in `0`.
 */
export function parseAmount(value: unknown): number | null {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN;
  return Number.isFinite(n) ? n : null;
}

/** Localized crypto amount (≤ 8 dp). Pass a finite number (see {@link parseAmount}). */
export function formatCrypto(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: CRYPTO_MAX_FRACTION_DIGITS,
  }).format(value);
}

/** Localized fiat / USDT amount (exactly 2 dp). */
export function formatFiat(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: FIAT_FRACTION_DIGITS,
    maximumFractionDigits: FIAT_FRACTION_DIGITS,
  }).format(value);
}

/** Localized integer count. */
export function formatCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Localized date (no time of day) in the **browser's local timezone**. Pass a
 * backend timestamp (ISO string or epoch number). Returns `fallback` when the
 * value is missing or not a parseable date.
 *
 * ⚠️ Local timezone by design — not UTC. Two users in different zones can see
 * different wall-clock dates for the same instant.
 */
export function formatDate(value: unknown, locale: string, fallback = '—'): string {
  const date = toDate(value);
  return date === null
    ? fallback
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

/**
 * Localized date + time in the **browser's local timezone**. Same parsing and
 * fallback rules as {@link formatDate}; use this where the time of day matters
 * (transaction / order timestamps).
 */
export function formatDateTime(value: unknown, locale: string, fallback = '—'): string {
  const date = toDate(value);
  return date === null ? fallback : date.toLocaleString(locale);
}

/** Coerce a backend timestamp (ISO string / epoch number) to a `Date`, or `null`. */
function toDate(value: unknown): Date | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
