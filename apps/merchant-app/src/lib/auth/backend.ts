import 'server-only';

import { API_ROUTES } from '@/constants/api';
import { backendFetch } from '@/lib/server/backend-fetch';

import {
  AuthError,
  envelopeSchema,
  loginResponseSchema,
  refreshResponseSchema,
  type LoginCredentials,
  type LoginSession,
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
    throw new AuthError(envelope.message ?? 'Authentication failed');
  }
  return loginResponseSchema.parse(json).data;
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
    throw new AuthError(envelope.message ?? 'Session refresh failed');
  }
  return refreshResponseSchema.parse(json).data;
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
