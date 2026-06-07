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
 * Single-level referral program: only direct (level 1) referrals are shown,
 * so the downline is always queried at this level and there is no level
 * filter. Reintroduce a level set here if tiers are added later.
 */
export const AFFILIATE_ONLY_LEVEL = 1 as const;

export const AFFILIATE_DOWNLINE_PAGE_PARAM = 'dPage' as const;
export const AFFILIATE_COMMISSIONS_PAGE_PARAM = 'cPage' as const;
