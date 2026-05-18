'use server';

import { backendLogin, backendLogout, backendRefresh, backendRegister } from './backend';
import { clearSession, getAccessToken, getRefreshToken, writeSession } from './session';
import {
  AuthError,
  loginInputSchema,
  registerInputSchema,
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
    const session = await backendRegister(parsed.data);
    // Backend issues an access token on register → user is signed in.
    await writeSession(session);
    const displayName = session.user.name ?? session.user.userName ?? parsed.data.userName;
    return { ok: true, displayName };
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
