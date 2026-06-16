/**
 * Search-param helpers. Next's `searchParams` gives `string | string[] |
 * undefined` per key (a key repeated in the URL arrives as an array); these
 * normalize that to the single value pages actually want.
 */

/** First value of a search param (repeated keys arrive as an array). */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
