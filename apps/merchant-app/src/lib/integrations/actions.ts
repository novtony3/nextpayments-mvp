'use server';

import { DEFAULT_API_KEY_LABEL } from '@/constants/integrations';
import { getAccessToken } from '@/lib/auth/session';
import { AuthError } from '@/lib/auth/types';

import { backendCreateApiKey, backendCreateIntegration, backendUpdateIntegration } from './backend';
import {
  createApiKeySchema,
  createIntegrationSchema,
  updateIntegrationSchema,
  type CreateApiKeyResult,
  type CreateIntegrationResult,
  type CreateIntegrationWithKeyResult,
  type UpdateIntegrationResult,
} from './types';

/**
 * Integration mutations — the only place the token is used for writes.
 * Inputs are re-validated here (never trust the client). Results are plain
 * serializable objects so the sheet can drive its state machine; backend
 * `error.code` (INER00x) is surfaced for field-level messaging.
 */

export async function createIntegrationAction(input: unknown): Promise<CreateIntegrationResult> {
  const parsed = createIntegrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };

  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };

  try {
    const { integration, ipnSecret } = await backendCreateIntegration(token, parsed.data);
    const integrationId = integration._id ?? String(integration.id ?? '');
    return {
      ok: true,
      integrationId,
      ipnSecret,
      name: integration.name ?? parsed.data.name,
    };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, reason: 'invalid', code: err.code };
    }
    return { ok: false, reason: 'error' };
  }
}

/**
 * Combined create-flow used by the sheet: POST the integration, then POST an
 * API key for `integration._id` with a default label, and return everything
 * the completed view needs in one round-trip (Name, Store URL, IPN secret,
 * Client ID = publicKey, Client Secret = privateKey).
 *
 * If the API-key call fails after the integration is already created, the
 * integration is NOT rolled back — return `ok:'partial'` so the UI still
 * shows what we have (the merchant can mint a key later from the list).
 */
export async function createIntegrationWithApiKeyAction(
  input: unknown,
): Promise<CreateIntegrationWithKeyResult> {
  const parsed = createIntegrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };

  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };

  let integrationId = '';
  let name = parsed.data.name;
  let storeUrl = parsed.data.siteUrl ?? '';
  let ipnUrl = parsed.data.ipnUrl ?? '';
  let ipnSecret = '';

  try {
    const created = await backendCreateIntegration(token, parsed.data);
    integrationId = created.integration._id ?? String(created.integration.id ?? '');
    name = created.integration.name ?? name;
    storeUrl = created.integration.siteUrl ?? storeUrl;
    ipnUrl = created.integration.ipnUrl ?? ipnUrl;
    ipnSecret = created.ipnSecret;
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, reason: 'invalid', code: err.code };
    return { ok: false, reason: 'error' };
  }

  try {
    const { publicKey, privateKey } = await backendCreateApiKey(
      token,
      integrationId,
      DEFAULT_API_KEY_LABEL,
    );
    return {
      ok: true,
      integrationId,
      name,
      storeUrl,
      ipnUrl,
      ipnSecret,
      publicKey,
      privateKey,
    };
  } catch (err) {
    const code = err instanceof AuthError ? err.code : undefined;
    return { ok: 'partial', integrationId, name, storeUrl, ipnUrl, ipnSecret, code };
  }
}

export async function updateIntegrationAction(
  integrationId: string,
  input: unknown,
): Promise<UpdateIntegrationResult> {
  if (!integrationId) return { ok: false, reason: 'invalid' };

  const parsed = updateIntegrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };

  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };

  try {
    await backendUpdateIntegration(token, integrationId, parsed.data);
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, reason: 'invalid', code: err.code };
    return { ok: false, reason: 'error' };
  }
}

export async function createApiKeyAction(
  integrationId: string,
  label: unknown,
): Promise<CreateApiKeyResult> {
  const parsed = createApiKeySchema.safeParse({ label });
  if (!parsed.success || !integrationId) return { ok: false, reason: 'invalid' };

  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };

  try {
    const { publicKey, privateKey } = await backendCreateApiKey(
      token,
      integrationId,
      parsed.data.label,
    );
    return { ok: true, publicKey, privateKey };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, reason: 'invalid', code: err.code };
    }
    return { ok: false, reason: 'error' };
  }
}
