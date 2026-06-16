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

/** Register input. Backend wants `userName`; `referralId` (the upline's id /
 * referral code) is optional and only sent when non-empty — the backend
 * rejects both null and "" with USER005. */
export const registerInputSchema = z.object({
  userName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
  referralId: z.string().min(1).optional(),
});

export type RegisterCredentials = z.infer<typeof registerInputSchema>;

/**
 * Email-verification input. The `hash` is the single-use token from the link
 * the backend emails after signup (`GET /user/verify-email?hash=`); re-validated
 * here so a blank/garbage value never reaches the backend.
 */
export const verifyEmailInputSchema = z.object({
  hash: z.string().min(1),
});

export type VerifyEmailCredentials = z.infer<typeof verifyEmailInputSchema>;

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
    /** Account lifecycle (`pending` until verified, then `active`). */
    state: z.string().optional(),
    /** True once the verification email link has been used. */
    emailVerified: z.boolean().optional(),
    /** True once 2FA (Google Authenticator) is enabled on the account. */
    gaEnabled: z.boolean().optional(),
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
 * `emailVerified` drives the verified badge overlaid on the avatar.
 */
export interface HeaderUser {
  email: string;
  displayName: string;
  emailVerified: boolean;
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
/**
 * `twoFaRequired` is surfaced when the backend rejects a login with a
 * 2FA-related error code (see `TWO_FA_LOGIN_CODES`). The form flips to step 2
 * (code input) and re-submits with `token2fa` filled. `emailNotVerified`
 * (USER007) and `noAccount` (USER006) drive distinct messages instead of the
 * generic `invalid`.
 */
export type LoginActionResult =
  | { ok: true; displayName: string }
  | {
      ok: false;
      reason: 'invalid' | 'error' | 'twoFaRequired' | 'emailNotVerified' | 'noAccount';
    };

/**
 * Register no longer auto-signs-in: even though the backend issues a valid
 * token on register, the account is `emailVerified:false` and a later login
 * is blocked until verification (USER007). To keep register/login symmetric
 * we discard that token and route the user to a "verify your email" step, so
 * the result carries `email` (to display) rather than a session.
 */
export type RegisterActionResult =
  | { ok: true; email: string }
  | { ok: false; reason: 'emailTaken' | 'invalid' | 'error' };

/**
 * Email-verification result. `invalid` = the backend rejected the hash (missing,
 * already used, or expired link); `error` = transport failure / 5xx. The confirm
 * page maps both to locale-aware copy with the right recovery action.
 */
export type VerifyEmailActionResult = { ok: true } | { ok: false; reason: 'invalid' | 'error' };
