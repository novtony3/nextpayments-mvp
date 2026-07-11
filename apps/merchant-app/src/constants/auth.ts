/**
 * Auth feature constants — validation rules, mock latencies and field
 * placeholders. Centralized so the login/register forms stay in sync and
 * nothing is hardcoded at the call site.
 */

/** Minimum password length, shared by every auth schema. Matches the
 * backend rule (register rejects shorter with USER021). */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Backend login `error.code`s that warrant a specific (non-generic) message
 * instead of the catch-all "invalid email or password". `USER006` = the email
 * isn't registered; `USER007` = the account exists but its email is still
 * unverified (the backend blocks login until verification, even though
 * register itself auto-signs-in — see the register flow note in actions.ts).
 */
export const LOGIN_ERROR_CODE = {
  NO_ACCOUNT: 'USER006',
  EMAIL_NOT_VERIFIED: 'USER007',
} as const;

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
 * (Rebranded with OMNIPAYX, 2026-07: pre-rebrand enrollments keep the old
 * label in their authenticator app but continue to validate.)
 */
export const TWO_FA_ISSUER = 'OMNIPAYX' as const;

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

/**
 * How often the client session watcher re-checks whether the access cookie is
 * still present (ms), as an idle fallback. Tab refocus, route changes and mount
 * are the primary triggers; this interval only catches a user who stays on one
 * focused page past the access-cookie lifetime. Derived from the access lifetime
 * (a fraction of it) so it is never an independent magic number.
 */
export const SESSION_CHECK_INTERVAL_MS = (SESSION_MAX_AGE.ACCESS / 5) * 1000;

/**
 * Query param the protected-route guard appends when bouncing to login, so the
 * post-recovery redirect returns the user to the page they were on (not the
 * landing page). Read back on the login page and validated as an internal path.
 */
export const RETURN_TO_PARAM = 'returnTo' as const;
