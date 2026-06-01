/**
 * Affiliate dashboard constants. Backend contract: API.md §Affiliate.
 * Endpoints are paginated `GET` reads (no mutations) so there is no error
 * code map yet — failures degrade to `{ok:false}` at the backend reader.
 */

/** Default `?limit=` value for downline and commissions tables. */
export const AFFILIATE_PAGE_LIMIT = 20 as const;

/** First page number (backend pages are 1-based, mirroring orders). */
export const AFFILIATE_FIRST_PAGE = 1 as const;

/**
 * Levels the merchant can filter the downline by. The backend accepts any
 * integer ≥ 1; the UI exposes a fixed set so the dropdown stays predictable.
 * Adjust as the affiliate program adds tiers — never inline a level int.
 */
export const AFFILIATE_LEVELS = [1, 2, 3, 4, 5] as const;
export type AffiliateLevel = (typeof AFFILIATE_LEVELS)[number];

/** Search-param name driving the downline level filter (URL ↔ table state). */
export const AFFILIATE_LEVEL_PARAM = 'level' as const;
export const AFFILIATE_DOWNLINE_PAGE_PARAM = 'dPage' as const;
export const AFFILIATE_COMMISSIONS_PAGE_PARAM = 'cPage' as const;
