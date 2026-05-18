import { z } from 'zod';

import { PASSWORD_MIN_LENGTH } from '@/constants/auth';

/**
 * Auth domain types + zod schemas (source of truth — types are inferred, not
 * hand-written). Backend contract: postman/crypto-payment-be collection.
 * No React, no server APIs here so both server and client code can import it.
 */

/**
 * Thrown when the backend rejects an auth request. `code` is the backend
 * error code (e.g. `USER004` email-taken, `USER006` no-email, `USER007`
 * unverified) when present, so callers can map it to a specific message.
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Validates the raw client input at the Server Action boundary (never trust
 * the client even though the form also validates). `LoginCredentials` is
 * derived from this so the two cannot drift.
 */
export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  /** Empty unless the account has 2FA enabled (backend expects the field). */
  token2fa: z.string().optional(),
});

export type LoginCredentials = z.infer<typeof loginInputSchema>;

/** Register input. Backend wants `userName`; `referralId` is intentionally
 * NOT sent (the backend rejects both null and "" with USER005). */
export const registerInputSchema = z.object({
  userName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
});

export type RegisterCredentials = z.infer<typeof registerInputSchema>;

/**
 * Loose response envelope — only the fields we depend on are validated.
 * Errors come back as `{success:false, error:{code,message}}` (no top-level
 * `message`), so both shapes are read.
 */
export const envelopeSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
    error: z.object({ code: z.string().optional(), message: z.string().optional() }).optional(),
  })
  .passthrough();

const userSchema = z
  .object({
    _id: z.string(),
    userName: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
  })
  .passthrough();

const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const loginResponseSchema = z.object({
  data: tokenPairSchema.extend({ user: userSchema }),
});

export const refreshResponseSchema = z.object({ data: tokenPairSchema });

/** GET /api/user/me → { data: { user } }. */
export const meResponseSchema = z.object({ data: z.object({ user: userSchema }) });

/**
 * Minimal, serializable identity for the header (Server Action → client).
 * Backend only reliably returns `email`; `displayName` is derived.
 */
export interface HeaderUser {
  email: string;
  displayName: string;
}

/** Register success: backend issues an accessToken but NO refreshToken. */
export const registerResponseSchema = z.object({
  data: z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1).optional(),
    user: userSchema,
  }),
});

export type SessionUser = z.infer<typeof userSchema>;
export type TokenPair = z.infer<typeof tokenPairSchema>;
export type LoginSession = z.infer<typeof loginResponseSchema>['data'];
export type RegisterSession = z.infer<typeof registerResponseSchema>['data'];

/**
 * Serializable results the auth Server Actions return to the client forms.
 * `reason` keeps the i18n decision on the client (locale-aware messages).
 */
export type LoginActionResult =
  | { ok: true; displayName: string }
  | { ok: false; reason: 'invalid' | 'error' };

export type RegisterActionResult =
  | { ok: true; displayName: string }
  | { ok: false; reason: 'emailTaken' | 'invalid' | 'error' };
