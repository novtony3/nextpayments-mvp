/**
 * Auth feature constants — validation rules, mock latencies and field
 * placeholders. Centralized so the login/register forms stay in sync and
 * nothing is hardcoded at the call site.
 */

/** Minimum password length, shared by every auth schema. */
export const PASSWORD_MIN_LENGTH = 6;

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
