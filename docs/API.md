# Nextpayments Backend API — Frontend Integration Reference

> Source: `postman/crypto-payment-be.postman_collection.json` +
> `postman/crypto-payment-be.local.postman_environment.json`, augmented with
> live responses probed against the running backend (2026‑05‑18).
> This is the working contract for wiring the merchant frontend.

---

## 1. Connection

|                              |                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| Backend origin (server-side) | `http://localhost:3000` (Postman `baseUrl`)                                                        |
| Reached locally via          | SSH tunnel `local 13000 → remote 3000` (`SSH-README.md`)                                           |
| Server                       | `motmi@103.160.4.145` (Debian, backend bound `127.0.0.1:3000`)                                     |
| Browser calls                | same-origin `/api/*` → Next rewrite → `API_PROXY_TARGET` (`.env.local` = `http://localhost:13000`) |
| Diagnostic                   | `GET /api/diag/health` → `{"ok":true,...}` when tunnel is up                                       |
| Verified test account        | `tony@example.com` / `123123123` (email-verified)                                                  |

Open the tunnel:

```bash
ssh -i ~/.ssh/id_ed25519 -N -L 13000:localhost:3000 motmi@103.160.4.145
# or: ./SSH-README.md --host 103.160.4.145 --user motmi \
#       --identity ~/.ssh/id_ed25519 --remote-port 3000 --local-port 13000 --bg
```

---

## 2. Response conventions (empirically confirmed)

**Success**

```json
{
  "success": true,
  "data": {
    /* endpoint payload */
  }
}
```

**Error** — note: nested `error`, NOT a top-level `message`:

```json
{
  "success": false,
  "error": { "status": 400, "code": "USER006", "message": "Email does not exist" }
}
```

HTTP status is often `200` even on logical failure — **always branch on
`success`**, not the HTTP code. (Our `envelopeSchema` already reads both
`error.{code,message}` and a top-level `message`.)

**Paginated list** (deposit/withdraw/balance history, integrations,
affiliate commissions, orders):

```json
{
  "success": true,
  "data": {
    "data": [
      /* rows */
    ],
    "total": 0,
    "totalPages": 0,
    "page": 1,
    "limit": 20
  }
}
```

Query params: `page` (1-based), `limit`, plus endpoint-specific filters
(`coin`, `status`, `level`).

### Known error codes

| Code      | Meaning                                                     | Where    |
| --------- | ----------------------------------------------------------- | -------- |
| `USER004` | Email already exists                                        | register |
| `USER005` | Invalid referral id (sent `null`/`""` — **omit the field**) | register |
| `USER006` | Email does not exist                                        | login    |
| `USER007` | Email is not verified                                       | login    |
| `USER021` | Password must be at least **8** characters                  | register |

> Codes are partial — extend this table as new ones surface. `AuthError.code`
> already carries `error.code` for mapping to messages.

---

## 3. Auth model

- **Bearer**: collection-level `Authorization: Bearer {{accessToken}}`. Every
  endpoint requires it **except** those marked `noauth` below.
- **Login/Register** return `{ accessToken, refreshToken?, user }`.
  - Login returns **both** tokens. **Register returns only `accessToken`**
    (no refresh) and the user is `emailVerified:false, state:"pending"` —
    but the token is valid (auto-signed-in).
- **Refresh**: `POST /user/refresh-token { refreshToken }` → new token pair.
- **Email verification gate**: login is blocked with `USER007` until the
  account is verified (`GET /user/verify-email?hash=…`, hash normally emailed).
- **2FA**: optional `token2fa` on login/withdraw/enable/disable; empty string
  when not enabled.
- **User object** (`/user/me`): `{ _id, id, email, avatar, state,
emailVerified, gaEnabled, createdAt, updatedAt, __v }` — **no `name`/
  `userName`** even though register accepts `userName`.

---

## 4. Endpoint reference

Auth column: 🔓 = `noauth`, 🔒 = Bearer access token required.
✅ = already wired in the frontend.

### Health

|     | Method | Path          | Auth |                                                     |
| --- | ------ | ------------- | ---- | --------------------------------------------------- |
| ✅  | GET    | `/api/health` | 🔓   | `{success,data:{ok:true}}` (via `/api/diag/health`) |

### User / Auth

|     | Method | Path                               | Auth | Body / Query                                        | Response `data`                     |
| --- | ------ | ---------------------------------- | ---- | --------------------------------------------------- | ----------------------------------- |
| ✅  | POST   | `/api/user/register`               | 🔓   | `{userName,email,password}` — **omit `referralId`** | `{user, accessToken}` (no refresh)  |
| ✅  | POST   | `/api/user/login`                  | 🔓   | `{email,password,token2fa}`                         | `{user, accessToken, refreshToken}` |
| ✅  | POST   | `/api/user/refresh-token`          | 🔓   | `{refreshToken}`                                    | `{accessToken, refreshToken}`       |
| ✅  | DELETE | `/api/user/logout`                 | 🔒   | —                                                   | —                                   |
| ✅  | GET    | `/api/user/me`                     | 🔒   | —                                                   | `{user}`                            |
|     | GET    | `/api/user/verify-email?hash=`     | 🔓   | `?hash=`                                            | —                                   |
|     | GET    | `/api/user/forgot-password?email=` | 🔓   | `?email=`                                           | — (sends reset email)               |
|     | PUT    | `/api/user/reset-password`         | 🔓   | `{token,password}`                                  | —                                   |
|     | PUT    | `/api/user/change-password`        | 🔒   | `{oldPassword,password}`                            | `{accessToken}` (rotates)           |
|     | GET    | `/api/user/get-2fa-key`            | 🔒   | —                                                   | `{secret2FAKey}`                    |
|     | GET    | `/api/user/get-2fa-token`          | 🔒   | —                                                   | dev helper (TOTP)                   |
|     | PUT    | `/api/user/enable-2fa`             | 🔒   | `{password,token2fa}`                               | —                                   |
|     | PUT    | `/api/user/disable-2fa`            | 🔒   | `{password,token2fa}`                               | —                                   |

### Fund

| Method | Path                             | Auth | Body / Query                                  | Response `data`                            |
| ------ | -------------------------------- | ---- | --------------------------------------------- | ------------------------------------------ |
| POST   | `/api/fund/get-address`          | 🔒   | `{network,coin}`                              | deposit address                            |
| POST   | `/api/fund/validate-address`     | 🔒   | `{network,coin,address}`                      | validity                                   |
| GET    | `/api/fund/balance?coin=`        | 🔒   | `?coin=`                                      | `{balances:[]}`                            |
| POST   | `/api/fund/notify`               | 🔓   | `{deposits:[…]}`                              | webhook (IP-restricted — backend only)     |
| POST   | `/api/fund/withdraw`             | 🔒   | `{network,coin,address,memo,amount,token2fa}` | `{withdrawal:{_id,id,…}}` (email approval) |
| PUT    | `/api/fund/withdraw/:token`      | 🔓   | —                                             | approve via emailed token                  |
| DELETE | `/api/fund/withdraw/:withdrawId` | 🔒   | —                                             | cancel                                     |
| POST   | `/api/fund/confirm-withdrawal`   | 🔓   | `{externalId,status,transactionHash}`         | webhook (backend only)                     |
| GET    | `/api/fund/deposit-history`      | 🔒   | `?page&limit&coin`                            | paginated                                  |
| GET    | `/api/fund/withdraw-history`     | 🔒   | `?page&limit&coin`                            | paginated                                  |
| GET    | `/api/fund/balance-history`      | 🔒   | `?page&limit&coin`                            | paginated                                  |

### Affiliate

| Method | Path                         | Auth | Query               | Response `data` |
| ------ | ---------------------------- | ---- | ------------------- | --------------- |
| GET    | `/api/affiliate/downline`    | 🔒   | `?page&limit&level` | paginated       |
| GET    | `/api/affiliate/commissions` | 🔒   | `?page&limit`       | paginated       |
| GET    | `/api/affiliate/totals`      | 🔒   | —                   | `{totals:[]}`   |

### Integrations (merchant dashboard)

| Method | Path                                    | Auth | Body                             | Response `data`                                             |
| ------ | --------------------------------------- | ---- | -------------------------------- | ----------------------------------------------------------- |
| POST   | `/api/integrations`                     | 🔒   | `{name,siteUrl,ipnUrl}`          | `{integration, ipnSecret}` (secret shown once)              |
| GET    | `/api/integrations`                     | 🔒   | —                                | paginated `{data:[],total,…}`                               |
| GET    | `/api/integrations/:id`                 | 🔒   | —                                | `{integration}`                                             |
| PUT    | `/api/integrations/:id`                 | 🔒   | `{name,siteUrl,ipnUrl,isActive}` | `{integration}`                                             |
| DELETE | `/api/integrations/:id`                 | 🔒   | —                                | soft delete                                                 |
| POST   | `/api/integrations/:id/api-keys`        | 🔒   | `{label}`                        | `{apiKey:{_id,publicKey}, privateKey}` (private shown once) |
| GET    | `/api/integrations/:id/api-keys`        | 🔒   | —                                | list                                                        |
| DELETE | `/api/integrations/:id/api-keys/:keyId` | 🔒   | —                                | revoke                                                      |

### Orders

Two auth modes coexist on `/api/orders` (see
`crypto-payment-be/src/modules/order/order.routes.js`):

- **HMAC** (`apiKeyRequired`) — merchant server-to-server calls
- **JWT** (`loginRequired`) — merchant _dashboard UI_ (browser session)

|     | Method | Path                            | Auth    | Body / Query                             | Response `data`                                                                                   |
| --- | ------ | ------------------------------- | ------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
|     | POST   | `/api/orders`                   | 🔐 HMAC | `{amount,coin,network?,externalOrderId}` | `{order:{orderId,…}}`                                                                             |
|     | GET    | `/api/orders?page&limit&status` | 🔐 HMAC | list for the caller's integration        | paginated                                                                                         |
|     | GET    | `/api/orders/:orderId`          | 🔐 HMAC | one order                                | `{order}`                                                                                         |
| ✅  | GET    | `/api/orders/me`                | 🔒 JWT  | `?page&limit&status&integrationId`       | paginated `{data:[order],total,…}` (rows keep `integrationId`; hide `apiKeyId/userId/ipnUrl/__v`) |
| ✅  | GET    | `/api/orders/me/stats`          | 🔒 JWT  | `?integrationId`                         | `{totalOrders, paidOrders, byCoin:[{coin,totalAmount,count,priceUsd,totalUsdt}], totalUsdt}`      |

Status enum (filter + row): `pending | paid | expired | cancelled`.
HMAC POST/GET/`:orderId` are signed by the merchant's backend with the
integration's API key pair — do not call from the browser with the user
session. The `/me` and `/me/stats` routes are the dashboard reads.

### Webhooks (backend-inbound — never called by the FE)

| Method | Path                   | Note                                                |
| ------ | ---------------------- | --------------------------------------------------- |
| POST   | `/api/webhooks/wallet` | wallet-service → backend, `X-Webhook-Secret` header |

---

## 5. Frontend implementation status

**Done (merchant-app):** health diagnostic, register, login, refresh,
logout, me, session (httpOnly cookies + Server Actions), `(protected)`
route guard, signed-in header menu, i18n en/fr. **Integrations** CRUD +
per-integration API-key management (mint/list/revoke), with the
"secret-shown-once" UX for `ipnSecret` and `privateKey`. **Orders** —
JWT `/me` list page (status + integrationId filters, paginated) and the
`/me/stats` dashboard panel (totals + `byCoin`).

**Not yet wired:** everything in Fund and Affiliate; verify-email /
forgot-password / reset-password / change-password / 2FA; the HMAC
checkout widget (browser only reads order _state_).

---

## 6. How to wire a new endpoint (codebase recipe)

The auth feature already establishes the pattern — follow it:

1. **Route constant** → add to `API_ROUTES` in
   `src/constants/api.ts` (no hardcoded paths).
2. **Zod schema** → `src/lib/<feature>/types.ts`: schema is the source of
   truth, derive types with `z.infer`. Reuse the `{success,data}` /
   paginated envelope shapes from §2.
3. **Server-side call** → `src/lib/<feature>/backend.ts`
   (`import 'server-only'`), using `backendFetch(route, { headers:{
Authorization: 'Bearer '+token } })` from `src/lib/server/backend-fetch.ts`.
   Get the token via `getAccessToken()` (`src/lib/auth/session.ts`).
4. **Mutations** → Server Actions (`'use server'`), validate input with a
   zod schema, return a **serializable** discriminated result
   (`{ok:true,…} | {ok:false,reason}`); map `error.code` for specific UX.
5. **Reads in pages** → call the server-side fn directly from a Server
   Component (it's authed via the cookie). Make the section a `(protected)`
   route so the guard handles unauthenticated access.
6. **Client mutations** → call the Server Action from the form; map result
   to locale-aware toasts/field errors; `router.refresh()` after session-
   affecting changes.
7. **i18n** → add keys to **both** `src/i18n/messages/en.json` and
   `fr.json` (keep parity), namespaced.
8. Run `pnpm --filter merchant-app typecheck && lint`, `pnpm format`.

Browser GET helper `apiFetch` (`src/lib/api.ts`) exists for client calls
that go through the `/api/*` proxy — but prefer server-side reads for
anything needing the token.

---

## 7. Quirks to remember (cost real debugging time)

- **Register**: must **omit `referralId`** entirely (`null` and `""` →
  `USER005`). Returns **no `refreshToken`**.
- **Login**: blocked by `USER007` until the email is verified. Min
  password length is **8** (`USER021`) — client `PASSWORD_MIN_LENGTH`
  aligned to 8.
- Backend user has **no name/userName** field → header shows email local-part.
- Errors come back **200 + `{success:false,error:{code,message}}`** — branch
  on `success`, surface `error.message`, map `error.code`.
- `referralId`/affiliate implies a referral system — relevant when building
  the affiliate dashboard.
- **Order stats** (`/me/stats`): `byCoin` is **already sorted desc by
  `totalUsdt`** server-side — don't re-sort. A coin with `priceUsd === 0`
  means the `Coin` doc has no seeded price; the row still appears (with
  `totalUsdt:0`) so the UI can surface a single "USDT conversion missing"
  notice rather than silently under-reporting `totalUsdt`.
- **Order error codes** (HMAC create path): `ORER001` invalid amount ·
  `ORER002` invalid coin · `ORER003` not found.

---

## 8. Suggested build order for tomorrow

1. **Account self-service** (small, high value, all 🔒 with known shapes):
   `change-password`, `forgot-password` → `reset-password`,
   `verify-email` landing, then 2FA enable/disable + `get-2fa-key`.
2. ✅ **Merchant dashboard – Integrations** (CRUD + API keys) — wired.
3. ✅ **Orders dashboard reads** (`/me`, `/me/stats`) — wired: list page at
   `/orders` + stats panel on `/dashboard`. Integration-picker UI for the
   `?integrationId=` filter is still a passthrough deep-link only.
4. **Fund**: balance + deposit address (`get-address`), then histories
   (paginated), then withdraw (multi-step: request → email approval).
5. **Affiliate dashboard**: `totals` + `downline`/`commissions` (paginated).
6. **Checkout widget** (Orders HMAC): the browser-facing _state view_ of a
   single order during checkout — coordinate with backend on the read path
   (order creation stays server-to-server).

Login error-code mapping (`USER006`/`USER007` → distinct messages +
"resend verification") is a quick win to do alongside #1.
