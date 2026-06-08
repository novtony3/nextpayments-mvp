/**
 * Illustrative sample values for the landing hero mockup card. Display-only
 * dummy data (UI phase) — labels/status text live in i18n, not here.
 */
export const DEMO_TX = {
  AMOUNT: '0.0428',
  TICKER: 'BTC',
  FIAT: '≈ $4,820.00',
  ADDRESS: 'bc1q…7x4k',
} as const;

/**
 * Decorative values for the floating glass card in the web3 hero (display-only,
 * never a real PAN). The card label lives in i18n (`landing.web3.hero.cardLabel`).
 */
export const HERO_CARD = {
  /** Masked card number — purely illustrative. */
  NUMBER: '•••• •••• •••• 9120',
} as const;
