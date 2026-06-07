import 'server-only';

import { API_ROUTES } from '@/constants/api';
import { backendFetch } from '@/lib/server/backend-fetch';

import {
  AuthError,
  envelopeSchema,
  loginResponseSchema,
  meResponseSchema,
  refreshResponseSchema,
  registerResponseSchema,
  type LoginCredentials,
  type LoginSession,
  type RegisterCredentials,
  type RegisterSession,
  type SessionUser,
  type TokenPair,
} from './types';

/**
 * Server-side backend auth calls. Run only inside Server Actions (never the
 * browser) so tokens stay server-side. Transport failures (tunnel down)
 * propagate; credential rejections become {@link AuthError}.
 */

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error('Backend returned a non-JSON response');
  }
}

/** Build an AuthError from the failure envelope, preferring the nested
 * `error.{message,code}` the backend actually returns. */
function rejection(
  envelope: { message?: string; error?: { code?: string; message?: string } },
  fallback: string,
): AuthError {
  return new AuthError(
    envelope.error?.message ?? envelope.message ?? fallback,
    envelope.error?.code,
  );
}

export async function backendLogin(credentials: LoginCredentials): Promise<LoginSession> {
  const res = await backendFetch(API_ROUTES.USER_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      token2fa: credentials.token2fa ?? '',
    }),
  });

  const json = parseJson(res.raw);
  const envelope = envelopeSchema.parse(json);
  if (!res.ok || !envelope.success) {
    throw rejection(envelope, 'Authentication failed');
  }
  return loginResponseSchema.parse(json).data;
}

export async function backendRegister(credentials: RegisterCredentials): Promise<RegisterSession> {
  const res = await backendFetch(API_ROUTES.USER_REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // referralId only sent when present — backend rejects null and "" (USER005).
    body: JSON.stringify({
      userName: credentials.userName,
      email: credentials.email,
      password: credentials.password,
      ...(credentials.referralId ? { referralId: credentials.referralId } : {}),
    }),
  });

  const json = parseJson(res.raw);
  const envelope = envelopeSchema.parse(json);
  if (!res.ok || !envelope.success) {
    throw rejection(envelope, 'Registration failed');
  }
  return registerResponseSchema.parse(json).data;
}

export async function backendRefresh(refreshToken: string): Promise<TokenPair> {
  const res = await backendFetch(API_ROUTES.USER_REFRESH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const json = parseJson(res.raw);
  const envelope = envelopeSchema.parse(json);
  if (!res.ok || !envelope.success) {
    throw rejection(envelope, 'Session refresh failed');
  }
  return refreshResponseSchema.parse(json).data;
}

export async function backendMe(accessToken: string): Promise<SessionUser> {
  const res = await backendFetch(API_ROUTES.USER_ME, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = parseJson(res.raw);
  const envelope = envelopeSchema.parse(json);
  if (!res.ok || !envelope.success) {
    throw rejection(envelope, 'Failed to load the current user');
  }
  return meResponseSchema.parse(json).data.user;
}

/** Best-effort backend logout — failure here must not block clearing cookies. */
export async function backendLogout(accessToken: string): Promise<void> {
  try {
    await backendFetch(API_ROUTES.USER_LOGOUT, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    /* ignore — local cookies are cleared regardless */
  }
}
