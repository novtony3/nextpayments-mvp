'use server';

import { getAccessToken, writeSession } from '@/lib/auth/session';
import { AuthError } from '@/lib/auth/types';

import {
  backendChangePassword,
  backendDisable2fa,
  backendEnable2fa,
  backendGet2faKey,
} from './backend';
import {
  buildOtpauthUri,
  changePasswordSchema,
  twoFaMutationSchema,
  type Begin2faSetupResult,
  type SecurityMutationResult,
} from './types';

/**
 * Security mutations — the only place the access token is used for these
 * writes. Inputs are re-validated server-side (never trust the client). Each
 * action returns a plain serializable result; backend `error.code` is
 * surfaced so the form can map to field-level UX
 * (see `SECURITY_ERROR_CODE` in `@/constants/security`).
 */

function failure(err: unknown): SecurityMutationResult {
  if (err instanceof AuthError) {
    return { ok: false, reason: 'invalid', code: err.code };
  }
  return { ok: false, reason: 'error' };
}

/**
 * Step 1 of the enable-2FA flow: fetch the TOTP secret from the backend and
 * pair it with the user's email into an `otpauth://` URI for QR rendering.
 * Email is read from the session (`/user/me`) so a hostile client can't
 * influence the label encoded into the QR.
 */
export async function begin2faSetupAction(): Promise<Begin2faSetupResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };
  try {
    const secret = await backendGet2faKey(token);
    // Email is read inside the same render as the QR; fall back to the secret
    // alone if /me momentarily fails — the secret + issuer is still a valid
    // URI, just without an account label.
    const { loadSecurityState } = await import('./backend');
    const state = await loadSecurityState();
    const email = state?.email ?? '';
    return { ok: true, secret, otpauthUri: buildOtpauthUri(secret, email) };
  } catch (err) {
    return failure(err) as Begin2faSetupResult;
  }
}

export async function enable2faAction(input: unknown): Promise<SecurityMutationResult> {
  const parsed = twoFaMutationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };
  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };
  try {
    await backendEnable2fa(token, parsed.data);
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

export async function disable2faAction(input: unknown): Promise<SecurityMutationResult> {
  const parsed = twoFaMutationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };
  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };
  try {
    await backendDisable2fa(token, parsed.data);
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

/**
 * Change the account password. Backend rotates the access token in the
 * response; we re-persist it so the user stays signed in (the existing
 * refresh cookie, if any, also remains valid).
 */
export async function changePasswordAction(
  input: unknown,
): Promise<SecurityMutationResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };
  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };
  try {
    const accessToken = await backendChangePassword(token, parsed.data);
    await writeSession({ accessToken });
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}
