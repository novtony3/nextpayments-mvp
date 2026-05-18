import { z } from 'zod';

import { API_ROUTES } from '@/constants/api';
import { apiFetch } from '@/lib/api';

/**
 * Auth API calls. Talks to the backend through the same-origin `/api` proxy
 * (see next.config.ts / SSH tunnel). Pure logic — no React, no UI.
 *
 * Backend contract (postman/crypto-payment-be collection):
 *   POST /api/user/login  { email, password, token2fa }
 *   → 2xx { success: true,  data: { accessToken, refreshToken, user } }
 *   → either non-2xx, or 2xx { success: false, message } on bad credentials.
 */

export interface LoginCredentials {
  email: string;
  password: string;
  /** Empty unless the account has 2FA enabled (backend expects the field). */
  token2fa?: string;
}

/** Backend response envelope (loose — only what we rely on is validated). */
const envelopeSchema = z
  .object({ success: z.boolean(), message: z.string().optional() })
  .passthrough();

const loginDataSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  user: z
    .object({
      _id: z.string(),
      userName: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
    })
    .passthrough(),
});

export type LoginSession = z.infer<typeof loginDataSchema>;

/** Thrown when the backend reports the credentials/2FA are wrong. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Authenticate against the backend. Resolves with the session (tokens +
 * user) on success; throws {@link AuthError} for rejected credentials and
 * lets transport/parse failures (ApiRequestError, ZodError) propagate so the
 * caller can show a generic error.
 */
export async function login(credentials: LoginCredentials): Promise<LoginSession> {
  const payload: Required<LoginCredentials> = {
    email: credentials.email,
    password: credentials.password,
    token2fa: credentials.token2fa ?? '',
  };

  const raw = await apiFetch<unknown>(API_ROUTES.USER_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const envelope = envelopeSchema.parse(raw);
  if (!envelope.success) {
    throw new AuthError(envelope.message ?? 'Authentication failed');
  }

  return z.object({ data: loginDataSchema }).parse(raw).data;
}
