import { z } from 'zod';

/**
 * Auth domain types + zod schemas (source of truth — types are inferred, not
 * hand-written). Backend contract: postman/crypto-payment-be collection.
 * No React, no server APIs here so both server and client code can import it.
 */

/** Thrown when the backend rejects the credentials / 2FA token. */
export class AuthError extends Error {
  constructor(message: string) {
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

/** Loose response envelope — only the fields we depend on are validated. */
export const envelopeSchema = z
  .object({ success: z.boolean(), message: z.string().optional() })
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

export type SessionUser = z.infer<typeof userSchema>;
export type TokenPair = z.infer<typeof tokenPairSchema>;
export type LoginSession = z.infer<typeof loginResponseSchema>['data'];

/**
 * Serializable result the login Server Action returns to the client form.
 * `reason` keeps the i18n decision on the client (locale-aware messages).
 */
export type LoginActionResult =
  | { ok: true; displayName: string }
  | { ok: false; reason: 'invalid' | 'error' };
