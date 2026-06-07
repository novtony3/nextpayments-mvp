'use server';

import { FUND_ERROR_CODE } from '@/constants/fund';
import { getAccessToken } from '@/lib/auth/session';
import { AuthError } from '@/lib/auth/types';

import { backendGetDepositAddress, backendWithdraw } from './backend';
import { withdrawInputSchema, type GetAddressResult, type WithdrawResult } from './types';

/**
 * Fund mutations — the only place the token is used for deposit/withdraw
 * writes. Inputs are re-validated here (never trust the client). Backend
 * `FUER00x` codes are surfaced via `code` so the UI maps each to a field error
 * or the "temporarily unavailable" (FUER006) banner — never a raw code.
 */

const { INVALID_NETWORK, INVALID_COIN, NOT_SUPPORTED } = FUND_ERROR_CODE;

export async function getDepositAddressAction(input: {
  network: unknown;
  coin: unknown;
}): Promise<GetAddressResult> {
  const network = typeof input.network === 'string' ? input.network : '';
  const coin = typeof input.coin === 'string' ? input.coin : '';
  if (!network || !coin) return { ok: false, reason: 'invalid' };

  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };

  try {
    const { address, memo } = await backendGetDepositAddress(token, { network, coin });
    return { ok: true, address, memo };
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.code === NOT_SUPPORTED) return { ok: false, reason: 'unsupported', code: err.code };
      if (err.code === INVALID_NETWORK || err.code === INVALID_COIN) {
        return { ok: false, reason: 'invalid', code: err.code };
      }
    }
    return { ok: false, reason: 'error' };
  }
}

export async function requestWithdrawAction(input: unknown): Promise<WithdrawResult> {
  const parsed = withdrawInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };

  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };

  try {
    await backendWithdraw(token, parsed.data);
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, reason: 'invalid', code: err.code };
    return { ok: false, reason: 'error' };
  }
}
