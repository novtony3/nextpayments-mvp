'use server';

import { FUND_ERROR_CODE } from '@/constants/fund';
import { getAccessToken } from '@/lib/auth/session';
import { AuthError } from '@/lib/auth/types';

import {
  backendApproveWithdraw,
  backendCancelWithdraw,
  backendGetDepositAddress,
  backendValidateAddress,
  backendWithdraw,
} from './backend';
import {
  validateAddressInputSchema,
  withdrawInputSchema,
  type ApproveWithdrawResult,
  type CancelWithdrawResult,
  type GetAddressResult,
  type ValidateAddressResult,
  type WithdrawResult,
} from './types';

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

/**
 * Soft/advisory address check (`POST /fund/validate-address`). Returns the
 * backend verdict (or `valid:null` when unclear) — the form surfaces a warning
 * on an explicit `false` but never blocks submit on it. Any failure resolves to
 * `{ ok:false }` so the form silently skips the advisory (endpoint may be off).
 */
export async function validateAddressAction(input: unknown): Promise<ValidateAddressResult> {
  const parsed = validateAddressInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const token = await getAccessToken();
  if (!token) return { ok: false };

  try {
    const valid = await backendValidateAddress(token, parsed.data);
    return { ok: true, valid };
  } catch {
    return { ok: false };
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

/**
 * Approve a pending withdrawal from the email link (`PUT /fund/withdraw/:token`).
 * Requires a server session — the page is auth-guarded, but we re-check here and
 * map a missing session to `error`. A backend rejection (token used/expired/not
 * found) maps to `invalid`; transport/5xx to `error`. Never auto-called — the
 * page fires this only on the user's explicit "Approve" click.
 */
export async function approveWithdrawAction(
  approvalToken: unknown,
): Promise<ApproveWithdrawResult> {
  if (typeof approvalToken !== 'string' || !approvalToken) {
    return { ok: false, reason: 'invalid' };
  }

  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };

  try {
    const summary = await backendApproveWithdraw(token, approvalToken);
    return { ok: true, summary };
  } catch (err) {
    // Any backend non-success (incl. an expired session mid-action) → the token
    // can't be acted on; surface as invalid. Transport/5xx → error (retryable).
    if (err instanceof AuthError) return { ok: false, reason: 'invalid' };
    return { ok: false, reason: 'error' };
  }
}

/**
 * Cancel a pending withdrawal (`DELETE /fund/withdraw/:withdrawId`). The id
 * comes from a withdraw-history row. A backend refusal (already sent/approved,
 * unknown id, not cancellable) maps to `invalid` so the table can toast it;
 * transport/5xx to `error`.
 */
export async function cancelWithdrawAction(withdrawId: unknown): Promise<CancelWithdrawResult> {
  if (typeof withdrawId !== 'string' || !withdrawId) {
    return { ok: false, reason: 'invalid' };
  }

  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };

  try {
    await backendCancelWithdraw(token, withdrawId);
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, reason: 'invalid' };
    return { ok: false, reason: 'error' };
  }
}
