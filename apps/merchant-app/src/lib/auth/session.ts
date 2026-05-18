import 'server-only';

import { cookies } from 'next/headers';

import { SESSION_COOKIE, SESSION_MAX_AGE } from '@/constants/auth';

import type { TokenPair } from './types';

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

export async function writeSession(tokens: TokenPair): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE.ACCESS, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: SESSION_MAX_AGE.ACCESS,
  });
  store.set(SESSION_COOKIE.REFRESH, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: SESSION_MAX_AGE.REFRESH,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE.ACCESS);
  store.delete(SESSION_COOKIE.REFRESH);
}
