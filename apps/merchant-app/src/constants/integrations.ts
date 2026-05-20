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

/**
 * Public API URL shown in the completed view (the URL clients of the
 * integration will call). Placeholder until the backend exposes a definitive
 * value — keep here so call sites don't hardcode it. */
export const INTEGRATION_API_URL = 'https://api.nextpayments.io' as const;

/** Default label sent to `POST /integrations/:id/api-keys` when the sheet
 * auto-creates an initial key right after the integration itself. */
export const DEFAULT_API_KEY_LABEL = 'Default' as const;

/**
 * Events covered by every webhook (the backend doesn't yet expose
 * subscription filtering — each webhook receives all of them). Used to
 * render the "(N EVENTS)" badge + the expand-to-list affordance next to
 * each webhook URL in the Manage Webhooks panel.
 */
export const WEBHOOK_EVENTS = [
  'invoiceCreated',
  'invoicePending',
  'invoicePaid',
  'invoiceCompleted',
  'invoiceCancelled',
  'invoiceTimedOut',
  'paymentCreated',
  'paymentTimedOut',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const WEBHOOK_EVENT_COUNT = WEBHOOK_EVENTS.length;
