import { z } from 'zod';

import {
  PASSWORD_MIN_LENGTH,
  TWO_FA_CODE_PATTERN,
  TWO_FA_ISSUER,
} from '@/constants/auth';

/**
 * Security domain (account self-service) types + zod schemas. Backend
 * contract: API.md §"User / Auth" routes `change-password`, `get-2fa-key`,
 * `enable-2fa`, `disable-2fa`. Codes captured in
 * `@/constants/security:SECURITY_ERROR_CODE`.
 *
 * No React / Next imports — both server (`lib/security/backend.ts`) and
 * client forms can import this. zod is the source of truth; types are
 * inferred via `z.infer`.
 */

/**
 * `PUT /api/user/change-password`. Backend returns a fresh `accessToken`
 * (rotated) which the Server Action must re-persist so the session keeps
 * working after the change.
 */
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  password: z.string().min(PASSWORD_MIN_LENGTH),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * `PUT /api/user/enable-2fa` and `PUT /api/user/disable-2fa` share the same
 * body shape: current account password + the live TOTP code.
 */
export const twoFaMutationSchema = z.object({
  password: z.string().min(PASSWORD_MIN_LENGTH),
  token2fa: z.string().regex(TWO_FA_CODE_PATTERN),
});

export type TwoFaMutationInput = z.infer<typeof twoFaMutationSchema>;

/** `GET /api/user/get-2fa-key` → `{ data: { secret2FAKey } }` (base32). */
export const get2faKeyResponseSchema = z.object({
  data: z.object({ secret2FAKey: z.string().min(1) }),
});

/** `PUT /api/user/change-password` → `{ data: { accessToken } }`. */
export const changePasswordResponseSchema = z.object({
  data: z.object({ accessToken: z.string().min(1) }),
});

/**
 * Build the `otpauth://` URI expected by authenticator apps (Google
 * Authenticator, Authy, 1Password). Encoding follows the Key Uri Format
 * spec — `label = issuer:account`, `secret` is base32, no padding.
 *
 * The function is pure / synchronous so it can run on either side of the
 * network boundary — the security card renders the URI into a QR locally,
 * so the secret never leaks to a third-party renderer.
 */
export function buildOtpauthUri(secret: string, email: string): string {
  const issuer = encodeURIComponent(TWO_FA_ISSUER);
  const account = encodeURIComponent(email);
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
}

/**
 * Serializable result every mutation Server Action returns to the client
 * form. `code` carries the raw backend `error.code` so the form can map it
 * to a locale-aware field error via {@link SECURITY_ERROR_CODE}.
 */
export type SecurityMutationResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'error'; code?: string };

/** Reader for the security page — gathers everything the page needs to
 * decide which cards to render (enable vs disable, verified banner). */
export type SecurityState = {
  email: string;
  gaEnabled: boolean;
  emailVerified: boolean;
};

/**
 * Result of the "begin enable-2fa" Server Action: fetches the secret +
 * builds the otpauth URI for the QR code. The secret is only kept in
 * memory long enough to render — it's NOT cached anywhere.
 */
export type Begin2faSetupResult =
  | { ok: true; secret: string; otpauthUri: string }
  | { ok: false; reason: 'invalid' | 'error'; code?: string };
