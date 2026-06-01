/**
 * Security / account-management constants. Backend error codes are captured
 * here so the Server Actions can surface field-level UX (mirror of
 * `INTEGRATION_ERROR_CODE` in constants/integrations.ts).
 *
 * Codes were probed live against the backend on 2026-06-01 with a fresh
 * registered account (see scripts/tunnel.sh + docs/API.md §"Known error codes").
 */

/**
 * Backend `error.code` → i18n reason key (under `paySettings.security.errors`
 * and `auth.login.errors`). When a code is not in the map the action falls
 * back to a generic `'invalid'` reason.
 */
export const SECURITY_ERROR_CODE: Record<string, string> = {
  USER007: 'emailNotVerified', // login gate before 2FA check
  USER009: 'wrongPassword', // enable/disable-2fa
  USER010: 'invalid2faCode', // enable/disable-2fa, login when 2FA enabled
  USER018: 'wrongOldPassword', // change-password
  USER019: 'twoFaAlreadyEnabled', // enable-2fa called while already on
  USER021: 'passwordTooShort', // change-password new password
};

/**
 * Backend codes that mean "2FA challenge is required for this login". Used by
 * `loginAction` to surface `reason: 'twoFaRequired'` so the form can flip to
 * step 2. `USER010` covers both "code missing" (token2fa: '') and "code wrong"
 * — both paths are handled by the same UX (input the code, submit again).
 */
export const TWO_FA_LOGIN_CODES = new Set(['USER010']);
