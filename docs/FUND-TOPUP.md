# Fund / Topup Wallet — Implementation Status & Handoff

> Branch: `tai/feat/fund-topup-wallet` (from `dev`). Frontend: `apps/merchant-app`.
> Backend contract: `docs/API.md` §Fund + live probes (2026‑06‑04, tunnel `:13000`).

The Wallet page (`/dashboard`) was restructured to be **Topup‑first**: a deposit
panel is the primary surface, with live balances below and withdrawal behind a
sheet. Order stats moved beneath the fund sections.

---

## Shipped

| Layer                    | Files                                                                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routes                   | `src/constants/api.ts` — added `FUND_BALANCE`, `FUND_GET_ADDRESS`, `FUND_GET_FEE_ADDRESS`, `FUND_VALIDATE_ADDRESS`, `FUND_WITHDRAW`                         |
| Config                   | `src/constants/fund.ts` — default **ETH/ETH**, `FUND_ASSETS`, `EVM_ADDRESS_REGEX`, `FUND_QR_SIZE_PX`, `FUND_ERROR_CODE` (FUER00x)                           |
| Types (zod, loose)       | `src/lib/fund/types.ts` — `balanceResponseSchema`/`BalancesResult`, `getAddressResponseSchema`/`GetAddressResult`, `withdrawInputSchema`/`WithdrawResult`   |
| Backend (server‑only)    | `src/lib/fund/backend.ts` — `backendFundBalance`, `loadFundBalance` (never‑throw reader), `backendGetDepositAddress`, `backendWithdraw`, `ensureOk`         |
| Actions (`'use server'`) | `src/lib/fund/actions.ts` — `getDepositAddressAction`, `requestWithdrawAction` (map FUER → field / banner)                                                  |
| UI                       | `src/components/dashboard/wallet/{wallet-view,deposit-panel,withdraw-sheet}.tsx`; rewired `src/components/dashboard/balances/balances-view.tsx` (real data) |
| Page                     | `src/app/[locale]/(protected)/dashboard/page.tsx` — Topup‑first, parallel reads                                                                             |
| i18n                     | `dashboard.wallet.*` + extended `dashboard.balances.*` in `en.json` + `fr.json` (parity verified)                                                           |

**Crypto business logic baked in:** topup uses `get-address` (`type:"user"`, credits
balance — chosen over the fee address); EVM `0x…` addresses (ETH/Sepolia); deposits
credit after on‑chain confirmations via webhook (no fake live status); **no fabricated
fiat** (balance carries no price); withdraw `token2fa` is required only when
`user.gaEnabled`; withdraw is an email‑approval flow (submit → "check your email").

**Validation gate (all green):** typecheck · lint · prettier · i18n parity (en=fr) · build.

---

## Verified vs blocked

| Flow                                      | Status                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Deposit address ETH/ETH                   | ✅ **Works** — real `type:"user"` address + QR (curl + UI)                                       |
| Balance read                              | ✅ Wired; empty‑state correct (probed account has no balance)                                    |
| History                                   | ✅ Already done pre‑existing (`transactions` page)                                               |
| Withdraw form / validation / FUER mapping | ✅ Verified (amount=0→FUER005, bad address→client EVM error, FUER006→banner)                     |
| Withdraw full happy‑path                  | ⚠️ **Needs a funded balance to test end‑to‑end**                                                 |
| USDT (ETH/BSC) deposit/withdraw           | ⚠️ Backend returns **FUER006** (catalog not enabled) → graceful "temporarily unavailable" banner |

---

## Còn dở dang / deferred (next phases)

1. **Withdraw email‑approval landing page** — `PUT /fund/withdraw/:token`. The submit
   step is done; the in‑app page that consumes the emailed JWT link is not built
   (deferred by decision). Add a `/withdraw/approve?token=…` route calling a new
   `approveWithdrawAction`.
2. **Cancel withdrawal** — `DELETE /fund/withdraw/:withdrawId` from the `sent`
   history rows. Route constant + action + a row action button.
3. **Full withdraw test** — once a balance exists, verify submit → email → success
   end‑to‑end (currently only validation + error paths are verified).
4. **USDT enablement (backend, not FE)** — enable USDT deposit/withdraw on ETH/BSC so
   the FUER006 banner clears; then re‑probe and tighten schemas if shapes differ.
5. **Tighten loose schemas** — `balanceRowSchema` and `getAddressResponseSchema` are
   intentionally loose (`passthrough`). Once a funded balance row and a withdraw
   response are observed, tighten to the real fields.
6. **`validate-address`** — backend currently 500s for ETH/ETH; FE relies on the
   client‑side `EVM_ADDRESS_REGEX` only. Wire `backendValidateAddress` as a soft
   pre‑check once the endpoint is stable.
7. **Fee endpoints** — `get-fee-address` / `fee-balance` are out of scope (route
   constant for fee‑address exists but is unused). Surface fee balance/address if a
   gas‑prefund UX is needed.

---

## Backend error codes (probed)

`FUER001` invalid network · `FUER002` invalid coin · `FUER005` invalid amount ·
`FUER006` coin/pair not enabled. Withdraw validation order: network → coin → amount →
pair. The documented test account password is stale (`USER011`); register returns a
valid auto‑signed‑in token for probing.

## How to test

Tunnel up (`:13000`), `pnpm --filter merchant-app dev`, sign in (register a fresh
account if needed), open `/dashboard`: pick **ETH · ETH** → "Get deposit address" →
real address + QR. Switch to a USDT pair → graceful unavailable banner. Withdraw:
amount 0 / bad address → field errors; valid → "check your email" confirmation.
