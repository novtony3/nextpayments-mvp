import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';

import { SESSION_COOKIE, SESSION_MAX_AGE } from '@/constants/auth';

import { backendMe } from './backend';
import type { SessionUser, TokenPair } from './types';

/**
 * httpOnly session cookies. Reads are safe anywhere on the server (layouts,
 * pages). Writes (`writeSession`/`clearSession`) mutate cookies, so they may
 * only be called from a Server Action or Route Handler — never a Server
 * Component render — per Next.js.
 */

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
} as const;

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE.ACCESS)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE.REFRESH)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getAccessToken());
}

/**
 * Persist the session. `refreshToken` is optional because register issues
 * only an access token — without it there is simply no silent refresh.
 */
export async function writeSession(
  tokens: { accessToken: string } & Partial<Pick<TokenPair, 'refreshToken'>>,
): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE.ACCESS, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: SESSION_MAX_AGE.ACCESS,
  });
  if (tokens.refreshToken) {
    store.set(SESSION_COOKIE.REFRESH, tokens.refreshToken, {
      ...baseCookieOptions,
      maxAge: SESSION_MAX_AGE.REFRESH,
    });
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE.ACCESS);
  store.delete(SESSION_COOKIE.REFRESH);
}

/**
 * The signed-in user, or null when there is no (valid) session. Any failure
 * — no cookie, expired token, tunnel down — resolves to null so callers can
 * treat it as "logged out". `cache()` dedupes within a single server pass.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  try {
    return await backendMe(accessToken);
  } catch {
    return null;
  }
});
