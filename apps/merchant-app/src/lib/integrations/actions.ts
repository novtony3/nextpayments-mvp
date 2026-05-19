'use server';

import { getAccessToken } from '@/lib/auth/session';
import { AuthError } from '@/lib/auth/types';

import { backendCreateApiKey, backendCreateIntegration } from './backend';
import {
  createApiKeySchema,
  createIntegrationSchema,
  type CreateApiKeyResult,
  type CreateIntegrationResult,
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
