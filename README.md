# Nextpayments

Cổng thanh toán crypto cho doanh nghiệp — Frontend Monorepo (UI/UX-only, dummy data).
Cảm hứng thiết kế: Gemini Desktop. Cảm hứng nghiệp vụ: nowpayments.io.

Toàn bộ spec & quyết định kiến trúc xem ở [PLAN.md](./PLAN.md).

---

## Yêu cầu môi trường

| Tool | Phiên bản | Ghi chú |
| --- | --- | --- |
| Node.js | ≥ 20 LTS | Khuyến nghị `20.x` hoặc `22.x` |
| pnpm | ≥ 9 (project pin `11.1.2`) | Bắt buộc — không dùng npm/yarn |
| Git | bất kỳ | |

Kiểm tra nhanh:

```bash
node --version    # v20.x.x trở lên
pnpm --version    # 9.x.x trở lên
```

Nếu chưa có `pnpm`, cài qua npm (yêu cầu quyền user-level) hoặc dùng [corepack](https://nodejs.org/api/corepack.html):

```bash
# Cách A — corepack (đi kèm Node 16+)
corepack enable
corepack prepare pnpm@latest --activate

# Cách B — npm
npm install -g pnpm@latest
```

---

## Cài đặt

```bash
git clone <repo-url> nextpayments
cd nextpayments
pnpm install
```

Lần install đầu sẽ download ~350 packages (~1-2 phút tuỳ mạng). Sau khi xong:

- `node_modules/` ở root + mỗi workspace
- `pnpm-lock.yaml` ở root (commit vào git)
- Build scripts của `sharp` và `unrs-resolver` đã được whitelist sẵn trong `pnpm-workspace.yaml`

---

## Chạy dev

Quy ước port của project:

| App | Port | Trạng thái |
| --- | --- | --- |
| `merchant-app` (Next.js) | **5001** | Đã sẵn sàng |
| `admin-dashboard` (Vite) | **5002** | Reserved — sẽ thêm sau |

Chạy merchant-app:

```bash
pnpm dev
# hoặc tường minh:
pnpm dev:merchant
```

Mở trình duyệt:

- `http://localhost:5001` → tự redirect về `http://localhost:5001/vi` (locale mặc định)
- `http://localhost:5001/vi` — Landing tiếng Việt
- `http://localhost:5001/en` — Landing tiếng Anh
- `http://localhost:5001/vi/login` — Login page (đang là skeleton)
- `http://localhost:5001/vi/dashboard` — Placeholder

Dev server dùng **Turbopack** (`next dev --turbopack`) — hot reload gần như tức thì khi sửa code.

### Đổi port tạm thời

```bash
pnpm --filter merchant-app dev -- -p 5050
```

Nếu muốn đổi cố định, sửa script `dev` và `start` trong `apps/merchant-app/package.json`.

---

## Build production

```bash
# Build merchant-app
pnpm build:merchant

# Build toàn bộ workspace (hiện tại chỉ có merchant-app cần build)
pnpm build
```

Output ở `apps/merchant-app/.next/`. Chạy production bundle local:

```bash
pnpm --filter merchant-app start
```

---

## Cấu trúc thư mục

```text
nextpayments/
├── apps/
│   └── merchant-app/          # Next.js 15 App Router — UI chính
├── packages/
│   ├── ui/                    # Component dùng chung (framework-agnostic)
│   └── config/
│       ├── tsconfig/          # TypeScript base configs
│       ├── eslint/            # ESLint shared configs
│       └── tailwind/          # Tailwind v4 preset (theme.css với Gemini tokens)
├── PLAN.md                    # Spec đầy đủ
├── README.md                  # File này
├── package.json               # Root workspace + scripts
├── pnpm-workspace.yaml        # Khai báo workspaces + allowBuilds
└── pnpm-lock.yaml
```

Chi tiết kiến trúc + lý do tách từng package: xem `PLAN.md` mục 2.

---

## Các script chính

Từ root:

| Lệnh | Tác dụng |
| --- | --- |
| `pnpm dev` | Alias cho `dev:merchant` (default — chạy merchant-app) |
| `pnpm dev:merchant` | Chỉ chạy merchant-app dev (port 5001, Turbopack) |
| `pnpm dev:admin` | Chỉ chạy admin-dashboard dev (port 5002) — _khi admin được init_ |
| `pnpm dev:all` | Chạy song song **mọi app** có script `dev` trong workspace |
| `pnpm build` | Build toàn bộ workspace |
| `pnpm build:merchant` | Build riêng merchant-app |
| `pnpm build:admin` | Build riêng admin-dashboard |
| `pnpm lint` | Lint toàn bộ workspace |
| `pnpm format` | Prettier format toàn bộ source |
| `pnpm clean` | Xoá `node_modules`, `.next`, `dist` ở mọi package |

### Chạy song song 2 app

```bash
pnpm dev:all
```

Lệnh này dùng `pnpm -r --parallel --stream` để khởi động đồng thời `merchant-app` (port **5001**) và `admin-dashboard` (port **5002**) trong cùng 1 terminal, output có prefix tên app để dễ phân biệt log.

Vì 2 app dùng port khác nhau, không có conflict. Mở 2 tab trình duyệt:
- `http://localhost:5001` — Merchant
- `http://localhost:5002` — Admin

Muốn 2 terminal riêng cho dễ đọc log? Mở 2 tab terminal:

```bash
# Terminal 1
pnpm dev:merchant

# Terminal 2
pnpm dev:admin
```

> **Lưu ý:** `admin-dashboard` hiện chưa được init (Sprint 4 mới làm). Đến lúc đó scripts `dev:admin` và `dev:all` sẽ hoạt động đầy đủ. Tạm thời chạy `pnpm dev:all` chỉ khởi động merchant-app.

### Chạy từng app riêng

Trong từng app, có thể chạy trực tiếp:

```bash
pnpm --filter merchant-app <script>
# ví dụ
pnpm --filter merchant-app typecheck
pnpm --filter merchant-app lint
```

---

## Tech stack tóm tắt

**Merchant App (`apps/merchant-app`):**
- Next.js 15.1.3 (App Router) + React 19
- Tailwind CSS v4 + Shadcn UI conventions
- next-themes (Dark mặc định) + next-intl v3 (path-based `/vi`, `/en`)
- Framer Motion (scroll animations)
- react-hook-form + zod (form validation)
- lucide-react (icons)

**Shared (`packages/`):**
- `@nextpayments/ui` — Button + utilities (`cn()`)
- `@nextpayments/tailwind-config` — `theme.css` định nghĩa Gemini design tokens
- `@nextpayments/tsconfig` — base / nextjs / react-library
- `@nextpayments/eslint-config` — base + Next.js preset

---

## Dummy login

Trong giai đoạn này KHÔNG có backend thật. Login validate client-side bằng dummy users ở `apps/merchant-app/src/constants/dummy-users.ts`:

| Email | Password |
| --- | --- |
| `demo@nextpayments.io` | `demo1234` |
| `admin@nextpayments.io` | `admin1234` |

Nút "Continue with Google" là UI giả — click sẽ redirect thẳng tới `/dashboard` sau 1s.

---

## Quy ước code

- File: `kebab-case.tsx`
- Component: `PascalCase`, mặc định Server Component, chỉ `'use client'` khi cần hook/event
- Imports: dùng alias `@/...` (đã config trong tsconfig)
- Không import `next/*` trong `packages/ui` (giữ framework-agnostic cho Admin Vite tương lai)
- Chi tiết: xem `PLAN.md` mục 11

---

## Troubleshooting

**`pnpm install` báo `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`**
Đảm bảo `pnpm-workspace.yaml` có đủ 3 globs:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'packages/config/*'
```

**`Ignored build scripts: sharp, unrs-resolver`**
Đã được whitelist sẵn trong `pnpm-workspace.yaml` (mục `allowBuilds`). Nếu vẫn báo, chạy:
```bash
pnpm install
```

**Lỗi font Inter vietnamese subset khi build**
`next/font/google` cần network để fetch font lần build đầu. Nếu offline, có thể tạm đổi subset chỉ còn `['latin']` trong `apps/merchant-app/src/app/[locale]/layout.tsx`.

**Port 5001 bị chiếm**
```bash
# Tạm thời chạy ở port khác
pnpm --filter merchant-app dev -- -p 5050

# Hoặc tìm và kill process đang chiếm port
lsof -ti:5001 | xargs kill -9
```

**Hot reload không hoạt động trên macOS**
Tăng giới hạn file watcher: `ulimit -n 4096` trước khi chạy `pnpm dev`.

**Theme nhấp nháy trắng khi reload**
Đã xử lý bằng `suppressHydrationWarning` + `next-themes`. Nếu vẫn xảy ra, kiểm tra browser extension can thiệp.

---

## Roadmap

Sprint hiện tại tập trung Landing + Login. Các sprint sau:

1. Merchant Dashboard (Sidebar, Hóa đơn, API Key)
2. Checkout Widget (route `/checkout/[id]`, state machine Pending→Confirming→Success)
3. Admin Dashboard (app riêng Vite + Zustand)
4. MSW + TanStack Query khi có async flow thật, Vitest + Playwright

Chi tiết roadmap: `PLAN.md` mục 10.
