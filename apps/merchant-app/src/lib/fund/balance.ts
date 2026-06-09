import { parseAmount } from '@/lib/format';

import type { BalanceRow } from './types';

/**
 * Defensive readers for the loose backend balance row (`z.record`). The probed
 * account is empty so the exact field names are unconfirmed — read the common
 * candidates and tolerate misses. Shared by the wallet list and the withdraw
 * form so the "which field is the ticker/amount" logic lives in one place.
 */

/** A balance row's coin ticker (`coin` / `currency` / `ticker`), or null. */
export function readBalanceTicker(row: BalanceRow): string | null {
  const value = row.coin ?? row.currency ?? row.ticker;
  return typeof value === 'string' && value ? value : null;
}

/** A balance row's amount as a finite number, or null when missing/invalid. */
export function readBalanceAmount(row: BalanceRow): number | null {
  return parseAmount(row.amount);
}

/**
 * Available amount for a coin across balance rows, or null when the coin is not
 * present (distinct from a real zero balance). Sums in case the backend splits
 * a coin across rows.
 */
export function findBalanceAmount(
  balances: ReadonlyArray<BalanceRow>,
  coin: string,
): number | null {
  const matches = balances.filter((row) => readBalanceTicker(row) === coin);
  if (matches.length === 0) return null;
  return matches.reduce((sum, row) => sum + (readBalanceAmount(row) ?? 0), 0);
}
