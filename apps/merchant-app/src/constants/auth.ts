/**
 * Auth feature constants — validation rules, mock latencies and field
 * placeholders. Centralized so the login/register forms stay in sync and
 * nothing is hardcoded at the call site.
 */

/** Minimum password length, shared by every auth schema. Matches the
 * backend rule (register rejects shorter with USER021). */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * 2FA TOTP code length the backend emits via Google Authenticator (RFC 6238,
 * 6-digit default). Drives input validation, `maxlength`, and the regex below.
 * Never inline a `6` at a call site.
 */
export const TWO_FA_CODE_LENGTH = 6 as const;

/** Strict numeric pattern for the 6-digit TOTP code (shared by client form +
 * Server Action schema). */
export const TWO_FA_CODE_PATTERN = /^\d{6}$/;

/**
 * Issuer label encoded into the `otpauth://` URI shown in the QR code.
 * Authenticator apps group accounts under this string — keep it stable.
 */
export const TWO_FA_ISSUER = 'Nextpayments' as const;

/**
 * Simulated network latency (ms) for the UI-only phase, so loading states are
 * visible. Replace with real requests when the backend lands.
 */
export const AUTH_MOCK_DELAY_MS = {
  CREDENTIALS: 700,
  REGISTER: 800,
  OAUTH: 1000,
} as const;

/** Non-localized example values shown as input placeholders. */
export const AUTH_FIELD_PLACEHOLDERS = {
  NAME: 'Jane Doe',
  EMAIL: 'you@company.com',
  PASSWORD: '••••••••',
} as const;

/**
 * Session cookie names. Tokens live in httpOnly cookies (set server-side by
 * the auth Server Actions) so they are never exposed to client JS.
 */
export const SESSION_COOKIE = {
  ACCESS: 'np_access',
  REFRESH: 'np_refresh',
} as const;

/**
 * Cookie lifetimes (seconds). The backend does not advertise its token TTLs,
 * so these are conservative client-side caps — when the access cookie expires
 * the guard bounces to login, where the refresh cookie silently re-auths.
 */
export const SESSION_MAX_AGE = {
  ACCESS: 60 * 15, // 15 minutes
  REFRESH: 60 * 60 * 24 * 7, // 7 days
} as const;
