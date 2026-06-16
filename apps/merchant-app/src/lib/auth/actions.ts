'use server';

import { LOGIN_ERROR_CODE } from '@/constants/auth';
import { TWO_FA_LOGIN_CODES } from '@/constants/security';

import {
  backendForgotPassword,
  backendLogin,
  backendLogout,
  backendRefresh,
  backendRegister,
  backendResetPassword,
  backendVerifyEmail,
} from './backend';
import {
  clearSession,
  getAccessToken,
  getHeaderUser,
  getRefreshToken,
  writeSession,
} from './session';
import {
  AuthError,
  forgotPasswordInputSchema,
  loginInputSchema,
  registerInputSchema,
  resetPasswordInputSchema,
  verifyEmailInputSchema,
  type ForgotPasswordActionResult,
  type HeaderUser,
  type LoginActionResult,
  type RegisterActionResult,
  type ResetPasswordActionResult,
  type VerifyEmailActionResult,
} from './types';

/** Backend error code for an already-registered email. */
const EMAIL_TAKEN_CODE = 'USER004';

/**
 * Auth Server Actions — the only place tokens are handled. They call the
 * backend server-side and persist tokens as httpOnly cookies, so nothing
 * sensitive ever reaches client JS. Inputs are re-validated here (never trust
 * the client). Results are plain serializable objects; the client form maps
 * `reason` to locale-aware messages.
 */

export async function loginAction(input: unknown): Promise<LoginActionResult> {
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  try {
    const session = await backendLogin(parsed.data);
    await writeSession(session);
    const displayName = session.user.name ?? session.user.userName ?? parsed.data.email;
    return { ok: true, displayName };
  } catch (err) {
    if (err instanceof AuthError) {
      // 2FA challenge: the account has 2FA on but the submitted token2fa was
      // missing or wrong. The form flips to step 2 and re-submits with the
      // code filled in. `token2fa: ''` is the step-1 case.
      if (err.code && TWO_FA_LOGIN_CODES.has(err.code)) {
        return { ok: false, reason: 'twoFaRequired' };
      }
      // Email exists but isn't verified — distinct from bad credentials so the
      // form can prompt the user to verify rather than blame the password.
      if (err.code === LOGIN_ERROR_CODE.EMAIL_NOT_VERIFIED) {
        return { ok: false, reason: 'emailNotVerified' };
      }
      // Email isn't registered at all.
      if (err.code === LOGIN_ERROR_CODE.NO_ACCOUNT) {
        return { ok: false, reason: 'noAccount' };
      }
      return { ok: false, reason: 'invalid' };
    }
    // Transport failure (tunnel down), 5xx, or unexpected response shape.
    return { ok: false, reason: 'error' };
  }
}

export async function registerAction(input: unknown): Promise<RegisterActionResult> {
  const parsed = registerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  try {
    // Backend issues a valid access token on register, but the account is
    // unverified and a later login is blocked until verification (USER007).
    // We intentionally DO NOT persist that token — instead the form routes to
    // a "verify your email" step, keeping register and login symmetric.
    await backendRegister(parsed.data);
    return { ok: true, email: parsed.data.email };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        ok: false,
        reason: err.code === EMAIL_TAKEN_CODE ? 'emailTaken' : 'invalid',
      };
    }
    // Transport failure (tunnel down), 5xx, or unexpected response shape.
    return { ok: false, reason: 'error' };
  }
}

/**
 * Consume the verification link from the signup email. Re-validates the hash at
 * the boundary, then calls the backend. A rejected/expired hash becomes
 * `invalid`; a transport failure becomes `error`. No session is written — the
 * user still signs in afterwards (register never persisted a token).
 */
export async function verifyEmailAction(hash: unknown): Promise<VerifyEmailActionResult> {
  const parsed = verifyEmailInputSchema.safeParse({ hash });
  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  try {
    await backendVerifyEmail(parsed.data);
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, reason: 'invalid' };
    }
    // Transport failure (tunnel down), 5xx, or unexpected response shape.
    return { ok: false, reason: 'error' };
  }
}

/**
 * Request a password-reset email. Always reports success on a well-formed
 * request — including when the backend rejects the address (e.g. no such
 * account) — so the response never reveals which emails are registered. Only a
 * transport failure / 5xx surfaces as `error`.
 */
export async function forgotPasswordAction(input: unknown): Promise<ForgotPasswordActionResult> {
  const parsed = forgotPasswordInputSchema.safeParse(input);
  if (!parsed.success) {
    // Malformed input (the client form validates first) — no-op success keeps
    // the generic "check your email" response, leaking nothing.
    return { ok: true };
  }

  try {
    await backendForgotPassword(parsed.data);
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      // Unknown email / backend rejection — still report success (anti-enumeration).
      return { ok: true };
    }
    // Transport failure (tunnel down), 5xx, or unexpected response shape.
    return { ok: false, reason: 'error' };
  }
}

/**
 * Set a new password using the reset token from the email link. A rejected
 * token (missing/used/expired) or a backend-rejected password becomes
 * `invalid`; a transport failure becomes `error`. No session is written — the
 * user signs in afterwards with the new password.
 */
export async function resetPasswordAction(input: unknown): Promise<ResetPasswordActionResult> {
  const parsed = resetPasswordInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  try {
    await backendResetPassword(parsed.data);
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, reason: 'invalid' };
    }
    // Transport failure (tunnel down), 5xx, or unexpected response shape.
    return { ok: false, reason: 'error' };
  }
}

export async function logoutAction(): Promise<void> {
  const accessToken = await getAccessToken();
  if (accessToken) {
    await backendLogout(accessToken);
  }
  await clearSession();
}

/**
 * Explicit refresh — invoked at the guard boundary (login page) when only a
 * refresh cookie remains. Rotates both tokens; clears the session on failure.
 */
export async function refreshAction(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return false;
  }
  try {
    const tokens = await backendRefresh(refreshToken);
    await writeSession(tokens);
    return true;
  } catch {
    await clearSession();
    return false;
  }
}

/**
 * Resolve the signed-in user for client chrome. Thin Server Action wrapper
 * over {@link getHeaderUser} (the marketing layout resolves it directly in a
 * Server Component for the header).
 */
export async function currentUserAction(): Promise<HeaderUser | null> {
  return getHeaderUser();
}
