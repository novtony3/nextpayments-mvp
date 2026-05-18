import { NextResponse } from 'next/server';

import { API_ROUTES } from '@/constants/api';
import { backendFetch, getBackendTarget } from '@/lib/server/backend-fetch';

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
  const target = getBackendTarget();

  try {
    const res = await backendFetch(API_ROUTES.HEALTH);
    let body: unknown = res.raw;
    try {
      body = JSON.parse(res.raw) as unknown;
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
