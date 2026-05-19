import 'server-only';

import { API_ROUTES, apiPath } from '@/constants/api';
import { getAccessToken } from '@/lib/auth/session';
import { AuthError, envelopeSchema } from '@/lib/auth/types';
import { toPaginatedPage } from '@/lib/pagination';
import { backendFetch } from '@/lib/server/backend-fetch';

import {
  createApiKeyResponseSchema,
  createIntegrationResponseSchema,
  listIntegrationsResponseSchema,
  type CreateIntegrationInput,
  type Integration,
  type IntegrationListPage,
  type IntegrationListResult,
} from './types';

/**
 * Server-side integration calls (run only in Server Actions / Components so
 * the access token never reaches the browser). Credential/validation
 * failures become {@link AuthError} carrying the backend `error.code`
 * (INER00x); transport failures propagate for the caller to map.
 */

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new AuthError('Backend returned a non-JSON response');
  }
}

function ensureOk(ok: boolean, json: unknown, fallback: string): void {
  const envelope = envelopeSchema.safeParse(json);
  if (!ok || !envelope.success || !envelope.data.success) {
    const err = envelope.success ? envelope.data.error : undefined;
    throw new AuthError(err?.message ?? fallback, err?.code);
  }
}

export async function backendCreateIntegration(
  token: string,
  input: CreateIntegrationInput,
): Promise<{ integration: Integration; ipnSecret: string }> {
  const res = await backendFetch(API_ROUTES.INTEGRATIONS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: input.name,
      siteUrl: input.siteUrl ?? '',
      ipnUrl: input.ipnUrl ?? '',
    }),
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not create the integration');
  return createIntegrationResponseSchema.parse(json).data;
}

export async function backendListIntegrations(
  token: string,
  query: { page: number; limit: number },
): Promise<IntegrationListPage> {
  const res = await backendFetch(API_ROUTES.INTEGRATIONS, {
    headers: { Authorization: `Bearer ${token}` },
    query: { page: query.page, limit: query.limit },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not load integrations');
  return toPaginatedPage(listIntegrationsResponseSchema.parse(json));
}

export async function backendCreateApiKey(
  token: string,
  integrationId: string,
  label: string,
): Promise<{ publicKey: string; privateKey: string }> {
  const res = await backendFetch(apiPath.integrationApiKeys(integrationId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ label }),
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not create the API key');
  const { apiKey, privateKey } = createApiKeyResponseSchema.parse(json).data;
  return { publicKey: apiKey.publicKey, privateKey };
}

/**
 * Result-returning list read for the Server Component page — never throws
 * into the RSC tree (tunnel-down / not-authed → `{ ok:false }` so the page
 * shows a degraded notice instead of a 500), mirroring `backendFundHistory`.
 */
export async function loadIntegrationList(query: {
  page: number;
  limit: number;
}): Promise<IntegrationListResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };
  try {
    const data = await backendListIntegrations(token, query);
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}
