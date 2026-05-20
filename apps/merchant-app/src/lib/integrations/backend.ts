import 'server-only';

import { API_ROUTES, apiPath } from '@/constants/api';
import { getAccessToken } from '@/lib/auth/session';
import { AuthError, envelopeSchema } from '@/lib/auth/types';
import { toPaginatedPage } from '@/lib/pagination';
import { backendFetch } from '@/lib/server/backend-fetch';

import {
  createApiKeyResponseSchema,
  createIntegrationResponseSchema,
  getIntegrationResponseSchema,
  listApiKeysResponseSchema,
  listIntegrationsResponseSchema,
  updateIntegrationResponseSchema,
  type ApiKeyListPage,
  type ApiKeyListResult,
  type CreateIntegrationInput,
  type Integration,
  type IntegrationListPage,
  type IntegrationListResult,
  type UpdateIntegrationInput,
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

export async function backendGetIntegration(
  token: string,
  integrationId: string,
): Promise<Integration> {
  const res = await backendFetch(apiPath.integration(integrationId), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not load the integration');
  return getIntegrationResponseSchema.parse(json).data.integration;
}

/**
 * PUT only the fields actually supplied — undefined keys are dropped so the
 * backend never sees an unintended overwrite. Use `''` for siteUrl/ipnUrl
 * to clear, or `isActive: false` to pause.
 */
export async function backendUpdateIntegration(
  token: string,
  integrationId: string,
  input: UpdateIntegrationInput,
): Promise<Integration> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.siteUrl !== undefined) body.siteUrl = input.siteUrl;
  if (input.ipnUrl !== undefined) body.ipnUrl = input.ipnUrl;
  if (input.isActive !== undefined) body.isActive = input.isActive;

  const res = await backendFetch(apiPath.integration(integrationId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not update the integration');
  return updateIntegrationResponseSchema.parse(json).data.integration;
}

export async function backendDeleteIntegration(
  token: string,
  integrationId: string,
): Promise<void> {
  const res = await backendFetch(apiPath.integration(integrationId), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not delete the integration');
}

export async function backendListApiKeys(
  token: string,
  integrationId: string,
  query: { page: number; limit: number },
): Promise<ApiKeyListPage> {
  const res = await backendFetch(apiPath.integrationApiKeys(integrationId), {
    headers: { Authorization: `Bearer ${token}` },
    query: { page: query.page, limit: query.limit },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not load API keys');
  return toPaginatedPage(listApiKeysResponseSchema.parse(json));
}

export async function backendRevokeApiKey(
  token: string,
  integrationId: string,
  keyId: string,
): Promise<void> {
  const res = await backendFetch(`${apiPath.integrationApiKeys(integrationId)}/${keyId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not revoke the API key');
}

/** Server Component reader for the manage sheet — `{ ok:false }` on any
 * failure so the sheet shows a degraded notice instead of crashing. */
export async function loadIntegrationApiKeys(
  integrationId: string,
  query: { page: number; limit: number },
): Promise<ApiKeyListResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };
  try {
    const data = await backendListApiKeys(token, integrationId, query);
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
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
