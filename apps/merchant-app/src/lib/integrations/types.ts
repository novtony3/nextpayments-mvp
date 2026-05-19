import { z } from 'zod';

/**
 * Integrations domain — zod is the source of truth, types inferred. Backend
 * contract (API.md Integrations + live probe 2026-05-19):
 *   POST /api/integrations { name, siteUrl?, ipnUrl? }
 *     → { integration:{…,ipnSecret}, ipnSecret }  (ipnSecret shown once)
 *   name is required & unique; siteUrl/ipnUrl optional but must be valid URLs.
 *   Errors: INER001 name required · INER002 name taken · INER004 invalid url.
 *   POST /api/integrations/:id/api-keys { label }
 *     → { apiKey:{ _id, publicKey }, privateKey }  (privateKey shown once)
 */

/** UX funnel type (Image 6). All map to the one create endpoint; `api`
 * additionally generates an API key. */
export const INTEGRATION_TYPES = ['plugins', 'api', 'buttons'] as const;
export type IntegrationType = (typeof INTEGRATION_TYPES)[number];
export const integrationTypeSchema = z.enum(INTEGRATION_TYPES);

/** Optional URL field: empty string OR a valid URL (backend INER004). */
const optionalUrl = z.union([z.literal(''), z.string().url()]).optional();

export const createIntegrationSchema = z.object({
  name: z.string().trim().min(1),
  siteUrl: optionalUrl,
  ipnUrl: optionalUrl,
});

export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;

export const createApiKeySchema = z.object({
  label: z.string().trim().min(1),
});

/** Loose row — exact shape only partly documented; passthrough + optional. */
export const integrationSchema = z
  .object({
    _id: z.string().optional(),
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().optional(),
    siteUrl: z.string().optional(),
    ipnUrl: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

export type Integration = z.infer<typeof integrationSchema>;

export const createIntegrationResponseSchema = z.object({
  data: z.object({
    integration: integrationSchema,
    ipnSecret: z.string(),
  }),
});

export const listIntegrationsResponseSchema = z.object({
  data: z.object({
    data: z.array(integrationSchema),
    total: z.number(),
    totalPages: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
});

export const createApiKeyResponseSchema = z.object({
  data: z.object({
    apiKey: z.object({ _id: z.string().optional(), publicKey: z.string() }).passthrough(),
    privateKey: z.string(),
  }),
});

/** Backend error code → i18n reason key (under `dashboard.integrations.errors`). */
export const INTEGRATION_ERROR_CODE: Record<string, string> = {
  INER001: 'nameRequired',
  INER002: 'nameTaken',
  INER004: 'invalidUrl',
};

export type IntegrationListPage = {
  rows: Integration[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

export type IntegrationListResult = { ok: true; data: IntegrationListPage } | { ok: false };

/** Serializable result the create Server Action returns to the sheet. */
export type CreateIntegrationResult =
  | { ok: true; integrationId: string; ipnSecret: string; name: string }
  | { ok: false; reason: 'invalid' | 'error'; code?: string };

export type CreateApiKeyResult =
  | { ok: true; publicKey: string; privateKey: string }
  | { ok: false; reason: 'invalid' | 'error'; code?: string };
