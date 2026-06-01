import 'server-only';

import { API_ROUTES } from '@/constants/api';
import { getAccessToken } from '@/lib/auth/session';
import { AuthError, envelopeSchema } from '@/lib/auth/types';
import { backendFetch } from '@/lib/server/backend-fetch';

import {
  changePasswordResponseSchema,
  get2faKeyResponseSchema,
  type ChangePasswordInput,
  type SecurityState,
  type TwoFaMutationInput,
} from './types';

/**
 * Server-side calls for the account-self-service routes (`change-password`,
 * `get-2fa-key`, `enable-2fa`, `disable-2fa`). Mirrors the integrations
 * backend: transport / shape failures throw, credential rejections become
 * {@link AuthError} carrying `error.code` so the Server Action can map to
 * field-level UX (`SECURITY_ERROR_CODE`).
 */

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new AuthError('Backend returned a non-JSON response');
  }
}

function ensureOk(ok: boolean, json: unknown, fallback: string): void {
  const envelope = envelopeSchema.safeParse(json);
  if (!ok || !envelope.success || !envelope.data.success) {
    const err = envelope.success ? envelope.data.error : undefined;
    throw new AuthError(err?.message ?? fallback, err?.code);
  }
}

export async function backendGet2faKey(token: string): Promise<string> {
  const res = await backendFetch(API_ROUTES.USER_GET_2FA_KEY, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not start 2FA setup');
  return get2faKeyResponseSchema.parse(json).data.secret2FAKey;
}

export async function backendEnable2fa(token: string, input: TwoFaMutationInput): Promise<void> {
  const res = await backendFetch(API_ROUTES.USER_ENABLE_2FA, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  ensureOk(res.ok, parseJson(res.raw), 'Could not enable 2FA');
}

export async function backendDisable2fa(token: string, input: TwoFaMutationInput): Promise<void> {
  const res = await backendFetch(API_ROUTES.USER_DISABLE_2FA, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  ensureOk(res.ok, parseJson(res.raw), 'Could not disable 2FA');
}

/**
 * Returns the rotated access token. Caller MUST re-persist it via
 * `writeSession` — otherwise the next request fires with the now-stale token
 * and bounces through silent refresh (best case) or login (worst).
 */
export async function backendChangePassword(
  token: string,
  input: ChangePasswordInput,
): Promise<string> {
  const res = await backendFetch(API_ROUTES.USER_CHANGE_PASSWORD, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not change the password');
  return changePasswordResponseSchema.parse(json).data.accessToken;
}

/**
 * Server Component reader for the security page. Returns null when there is
 * no (valid) session so the page can degrade to a "session lost" notice
 * instead of crashing the protected layout.
 */
export async function loadSecurityState(): Promise<SecurityState | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await backendFetch(API_ROUTES.USER_ME, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = parseJson(res.raw);
    ensureOk(res.ok, json, 'Could not load account state');
    const userEnvelope = (json as { data?: { user?: Record<string, unknown> } }).data?.user ?? {};
    return {
      email: typeof userEnvelope.email === 'string' ? userEnvelope.email : '',
      gaEnabled: Boolean(userEnvelope.gaEnabled),
      emailVerified: Boolean(userEnvelope.emailVerified),
    };
  } catch {
    return null;
  }
}
