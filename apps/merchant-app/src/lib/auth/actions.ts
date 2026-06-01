'use server';

import { LOGIN_ERROR_CODE } from '@/constants/auth';
import { TWO_FA_LOGIN_CODES } from '@/constants/security';

import { backendLogin, backendLogout, backendRefresh, backendRegister } from './backend';
import {
  clearSession,
  getAccessToken,
  getHeaderUser,
  getRefreshToken,
  writeSession,
} from './session';
import {
  AuthError,
  loginInputSchema,
  registerInputSchema,
  type HeaderUser,
  type LoginActionResult,
  type RegisterActionResult,
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
