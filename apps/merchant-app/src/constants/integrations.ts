import { INTEGRATION_TYPES, type IntegrationType } from '@/lib/integrations/types';

/**
 * Integrations UI config — single source of truth for the type funnel and
 * paging. No React/i18n here: icons are string keys the sheet maps to
 * Lucide; labels/copy are i18n keys (`dashboard.integrations.types.<key>`).
 */

/** Only `api` triggers the extra API-key generation step. */
export type IntegrationTypeMeta = {
  key: IntegrationType;
  icon: IntegrationType;
  /** Whether selecting this type continues to the API-key step after create. */
  generatesApiKey: boolean;
};

export const INTEGRATION_TYPE_META: ReadonlyArray<IntegrationTypeMeta> = INTEGRATION_TYPES.map(
  (key) => ({
    key,
    icon: key,
    generatesApiKey: key === 'api',
  }),
);

/** Backend `?limit=`; also the pager's assumed page size. */
export const INTEGRATIONS_PAGE_SIZE = 10 as const;

/** URL search-param key driving the server list fetch. */
export const INTEGRATIONS_PARAM = { PAGE: 'page' } as const;
