# Wallet — complete the Withdraw tab (two balance tracks)

Date: 2026-06-19 · Branch: `tai/feat/wallet-withdraw-tab` (from `dev`).
Frontend: `apps/merchant-app`. Backend contract: `docs/API.md` §Fund.

Brainstormed + agreed with the user. Completes the wallet split started in the
`2026-06-18` UX spec: the **Top-up** tab already works; the **Withdraw** tab is
still an empty placeholder. This wires it up.

---

## Product model (confirmed)

The API exposes two balance tracks on the **same** user wallet. Each wallet tab
owns one track:

| Tab                                     | Purpose                                                          | Deposit/write                                        | Balance read                  |
| --------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------- |
| **Top-up** (default, already works)     | Nạp tiền vào ví user để có số dư **chi trả cho các transaction** | `POST /fund/get-address` (`type:"user"`) — unchanged | `GET /fund/fee-balance?coin=` |
| **Withdraw** (the empty tab — build it) | "Ví bình thường": xem số dư rút được + rút ra ngoài              | `POST /fund/withdraw` (+ email approve + cancel)     | `GET /fund/balance?coin=`     |

Decisions captured during brainstorming:

- **Top-up stays as-is** (deposit via `get-address`); we do **not** introduce
  `get-fee-address`. Its balance list switches from spendable → `fee-balance`
  (the "số dư chi trả giao dịch"), matching the user's note `top-up = fee`.
- **Withdraw tab** reads the spendable balance (`/fund/balance`) and hosts the
  withdraw entry point.
- **Default tab = Top-up** (keep current behaviour).
- The withdraw sub-flow (request → email approval landing
  `/withdraw/approve/[token]` → cancel pending in transactions) is **already
  built** — this task only surfaces it inside the Withdraw tab.

---

## Changes (file by file)

All readers already exist; the work is wiring + UI, maximal reuse.

### 1. `src/app/[locale]/(protected)/dashboard/page.tsx`

Load **both** balance tracks in parallel and pass each to the matching tab:

- `loadFundBalance()` → fee-balance rows → Top-up tab list.
- `loadSpendableBalance()` → spendable rows → Withdraw tab list **and** the
  withdraw form's available/Max.
- Update the docstring (it currently says fee-balance is intentionally hidden —
  no longer true).

### 2. `src/components/dashboard/wallet/wallet-view.tsx`

- Props become two tracks: `feeBalances` + `feeBalancesOk` (Top-up) and
  `spendableBalances` + `spendableBalancesOk` (Withdraw); `gaEnabled` kept.
- **Top-up panel** (unchanged behaviour, new data): `DepositPanel` +
  `BalancesView` fed by `feeBalances` (`canReceive` = `TOPUP_COINS`, focuses the
  deposit panel; **no Send** — fee track isn't withdrawable). Remove the
  Withdraw trigger button from here (moves to the Withdraw tab).
- **Withdraw panel** (was the empty placeholder): a primary "Withdraw funds"
  button → opens `WithdrawSheet`, plus `BalancesView` fed by `spendableBalances`
  with **Send enabled** (`onSend` → `openWithdraw(coin)`) and Receive off.
- `WithdrawSheet` stays mounted, fed by `spendableBalances` (available + Max).

### 3. `src/components/dashboard/balances/balances-view.tsx`

- Add a `canSend?: (coin: string) => boolean` prop (default `() => false`) and
  **re-enable** the currently commented-out Send `IconButton`, gated by it.
- Top-up passes `canSend` off; Withdraw passes it on. Keeps one shared list
  component for both tabs (component-reuse).

### 4. `src/components/dashboard/wallet/deposit-panel.tsx`

- Fix the stale docstring claiming `get-fee-address` — it uses (correctly)
  `get-address`. No behaviour change.

### 5. i18n — `src/i18n/messages/{en,fr}.json` (parity)

- Repurpose `dashboard.wallet.withdrawTab.*` from the "coming soon" empty-state
  into the Withdraw tab's heading/subtitle (e.g. "Withdraw" + "Your spendable
  balance — send funds to an external address").
- Reuse `dashboard.balances.*` for both lists; reuse `dashboard.wallet.withdraw.*`
  and `deposit.*` as-is. Add keys only where new copy is required; keep en = fr.

---

## Reuse (no new components)

`Tabs`, `Card`, `SelectField`, `BalancesView`, `DepositPanel`, `WithdrawSheet`,
`EmptyState`, `loadFundBalance`, `loadSpendableBalance`, `findBalanceAmount`,
`CoinAvatar`, format helpers — all existing. New code is limited to props +
wiring.

## Verification

- Output gate before every commit: `pnpm --filter merchant-app typecheck`,
  `lint`, `pnpm format`, i18n parity (en = fr), `build` (broad change).
- Live E2E (SSH tunnel `:13000` + a funded account) is the follow-up: confirm
  `fee-balance` renders on Top-up and a real withdraw round-trips. Today only
  validation + degrade paths are verifiable (USDT pairs may return `FUER006` →
  the existing graceful "temporarily unavailable" notices apply).
- **Caveat to verify live:** internal docs note `get-address` deposits credit
  the spendable balance while Top-up now displays `fee-balance` — so a fresh
  top-up may surface under Withdraw rather than Top-up. We build to the agreed
  mapping (Top-up→`fee-balance`); reconcile against real backend behaviour when a
  funded account is available.

## Out of scope

`get-fee-address`; enabling more coins/pairs (backend); fiat pricing; changing
the withdraw approval/cancel sub-flow (already built).
