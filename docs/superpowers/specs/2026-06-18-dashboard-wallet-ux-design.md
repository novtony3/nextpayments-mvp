# Dashboard & Wallet UX — Design Spec

Date: 2026-06-18 · Branch: `tai/feat/dashboard-wallet-ux`

Four related dashboard/wallet changes, agreed via brainstorming.

---

## Task 1 — Session-expiry toast

**Problem.** When the access cookie (`np_access`, 15 min) expires while the user
stays on the SPA, the App Router does **not** re-run the `(protected)` layout
guard on client-side navigation between sibling pages — only the page segment is
re-fetched. That RSC fetch goes out without the (now dropped) cookie → backend
`401` → loaders return `{ ok: false }` → the user sees a misleading generic
message (e.g. Orders: _"Couldn't load orders. The service may be unavailable —
try again shortly."_) with no hint that their session ended.

**Solution.** A client `SessionExpiryWatcher`, mounted once in `DashboardShell`
(covers every protected page). It calls a lightweight server action
`isSessionActiveAction()` that returns whether the `np_access` cookie is still
present (reuses `isAuthenticated()` / `getAccessToken()` — **no backend call**;
when the cookie hits its `maxAge` the browser drops it, so absence == expired).

Triggers (re-check session on each):

- on mount,
- on **route change** (`usePathname`) — fires the toast exactly when the
  misleading data-load error appears,
- on `visibilitychange → visible` and window `focus` (tab return),
- on a periodic interval fallback.

On the first detection of an inactive session it shows **one** Sonner toast
(guarded by a ref + stable `id`, `duration: Infinity`, so it never duplicates)
with an action button **"Reload"** → `window.location.reload()`. Reloading
self-heals: if the refresh cookie (7 days) is still valid the login page silently
refreshes and returns the user; otherwise it lands on login. One button covers
both recoverable and fully-expired sessions.

Out of scope: changing the inline per-loader fallback messages
(`dashboard.orders.error`, etc.) — they remain generic; the toast is the clear
session signal.

**Files**

- `src/components/shared/session-expiry-watcher.tsx` (new, client).
- `src/lib/auth/actions.ts` — add `isSessionActiveAction()` (`'use server'`,
  returns `boolean`).
- `src/components/dashboard/shell/dashboard-shell.tsx` — mount the watcher.
- `src/constants/auth.ts` — add `SESSION_CHECK_INTERVAL_MS` (derived from
  `SESSION_MAX_AGE.ACCESS`).
- i18n `dashboard.session.expired.{message,reload}` in `en.json` + `fr.json`.
- Shared focus/visibility hook (e.g. `src/lib/hooks/use-window-focus.ts`),
  reused by Task 4.

---

## Task 2 — Wallet split into two tabs

`WalletView` keeps the page header (title + subtitle), then renders the reusable
`Tabs` (`@nextpayments/ui/components/tabs`) with items **[Withdraw, Top-up]**.

- **Default active tab = Top-up** (Withdraw is empty; don't land users on a
  blank panel).
- **Top-up panel**: the existing Withdraw trigger button (kept here, per user
  choice) + `DepositPanel` + `BalancesView`, plus the `WithdrawSheet` modal —
  i.e. all current UI moves here unchanged.
- **Withdraw panel**: a simple empty placeholder ("coming soon" empty state;
  reuse an existing empty-state pattern if one exists).
- Tab state via local `useState`.

**Files**

- `src/components/dashboard/wallet/wallet-view.tsx` — introduce tabs + panels.
- i18n `dashboard.wallet.tabs.{withdraw,topup}` and an empty-state string under
  `dashboard.wallet.withdrawTab.*` in `en.json` + `fr.json`.

---

## Task 3 — Remove USDT-ERC20 from Top-up

In `src/constants/fund.ts`, remove `{ network: 'ERC20', coin: 'USDT' }` from
`FUND_ASSETS`, leaving only `{ network: 'ETH', coin: 'ETH' }`.

`FUND_ASSETS` is the single source of truth, so the deposit selector becomes a
single option **and** the withdraw form's asset list narrows to ETH (expected
ripple). `FUND_BALANCE_COINS` auto-narrows to `['ETH']`. This is independent of
the Task 4 header balance, which uses its own coin constant.

**Files**: `src/constants/fund.ts` only.

---

## Task 4 — Header balance selector

A coin **selector** in the dashboard topbar showing the spendable balance of the
selected coin via `GET /fund/balance?coin=<coin>` (spendable track — reuses
`backendBalance` / `loadSpendableBalance`; **not** the fee/gas reserve). Built as
a select (not a static pill) because more coins come later; default = first
coin. No navigation link.

- New constant `HEADER_BALANCE_COINS` in `src/constants/fund.ts`, starting as
  `['USDT']` (extend later); the first entry is the default. Independent of
  `FUND_ASSETS` so Task 3 doesn't affect it.
- **Initial load**: server-side in the `(protected)` layout for the default coin
  (reads `getAccessToken`, graceful loader returning `{ ok, amount }`), threaded
  down `DashboardShell → DashboardTopbar → HeaderBalance` like `user` (correct on
  first paint, no flash).
- **Client `HeaderBalance`** (in topbar): a compact `SelectField` of
  `HEADER_BALANCE_COINS` + the formatted amount (`formatFiat`, 2 decimals,
  `{amount} {coin}`). State persists across client-side navigations (topbar lives
  in the persistent shell layout).
  - On **coin change** → `getFundBalanceAction(coin)` (validates coin against the
    constant, reads token, calls `backendBalance`) → update amount (brief loading
    state).
  - On **window focus / visibility → visible** → re-fetch the current coin
    (reuses the Task 1 focus hook). Both refresh modes apply.
  - On failure / no session → show a muted `— {coin}`.

**Files**

- `src/components/dashboard/shell/header-balance.tsx` (new, client).
- `src/lib/fund/actions.ts` — add `getFundBalanceAction(coin)`.
- `src/lib/fund/backend.ts` — add a graceful single-coin loader if needed
  (`loadCoinBalance`/reuse `loadSpendableBalance`).
- `src/constants/fund.ts` — add `HEADER_BALANCE_COINS`.
- `src/app/[locale]/(protected)/layout.tsx` — load default-coin balance, pass
  down.
- `src/components/dashboard/shell/dashboard-shell.tsx` +
  `dashboard-topbar.tsx` — thread `initialBalance` / coin list, render
  `HeaderBalance` left of `LanguageSwitcher`.
- i18n `dashboard.headerBalance.*` (aria-label, unavailable) in `en.json` +
  `fr.json`.

---

## Conventions

- No hardcoding: all literals (coins, interval) extracted to constants.
- i18n parity en/fr; locale-safe routing.
- Reuse existing UI (`Tabs`, `SelectField`, `Card`, format helpers); only build
  new where none fits.
- Validate the output gate (typecheck, lint, format, i18n parity) before each
  commit.
