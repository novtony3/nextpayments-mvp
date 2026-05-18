import { NextResponse } from 'next/server';

import {
  API_BASE_URL,
  API_PROXY_TARGET_ENV,
  API_ROUTES,
  DEFAULT_API_PROXY_TARGET,
} from '@/constants/api';

/**
 * Dev diagnostic — server-side probe of the backend health endpoint through
 * the tunnel. Visit `/api/diag/health` to confirm the SSH tunnel + proxy
 * target are wired before any real feature calls the API.
 *
 * The `/api/diag/*` prefix is excluded from the `/api/*` proxy rewrite (see
 * next.config.ts), so this handler resolves locally and does not collide with
 * the backend's own `/api/health`. It runs server-side and reads the upstream
 * origin from a server-only env, so the real backend host is never exposed to
 * the browser. (`diag`, not `_diag`: `_`-prefixed folders are private and
 * excluded from the App Router.)
 */
export const dynamic = 'force-dynamic';

interface HealthProbeResult {
  ok: boolean;
  target: string;
  upstreamStatus: number | null;
  body: unknown;
  error?: string;
}

export async function GET(): Promise<NextResponse<HealthProbeResult>> {
  const target = process.env[API_PROXY_TARGET_ENV] ?? DEFAULT_API_PROXY_TARGET;
  const url = `${target}${API_BASE_URL}${API_ROUTES.HEALTH}`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    const text = await res.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      /* upstream returned non-JSON — keep the raw text */
    }

    return NextResponse.json(
      { ok: res.ok, target, upstreamStatus: res.status, body },
      { status: res.ok ? 200 : 502 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        target,
        upstreamStatus: null,
        body: null,
        error: err instanceof Error ? err.message : 'Unknown error reaching the tunnel',
      },
      { status: 502 },
    );
  }
}
