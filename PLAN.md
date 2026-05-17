# NEXTPAYMENTS — KẾ HOẠCH TỔNG HỢP FRONTEND

**Phiên bản:** 1.0 (hợp nhất ngày 2026-05-17)
**Nguồn hợp nhất:** `frontend_crypto_payment_gateway_plan.md` + `frontend_ui_monorepo_plan.md` + các quyết định chốt với user trong session ngày 2026-05-17.
**Cảm hứng thiết kế:** Gemini Desktop (Dark/Light Minimalist, Intelligent, AI-native Feel).
**Cảm hứng nghiệp vụ:** nowpayments.io

---

## 1. PHẠM VI & MỤC TIÊU

### 1.1. Mục tiêu tổng thể
Xây dựng hệ thống Frontend (UI/UX) thuần túy cho nền tảng Crypto Payment Gateway, **không có Backend logic thật**. Toàn bộ dữ liệu là dummy/mock, tập trung 100% vào chất lượng UI/UX, Component Architecture, State Management và Performance.

### 1.2. Phạm vi giai đoạn hiện tại (Sprint 1)
**CHỈ làm:**
- Setup Monorepo (pnpm workspaces) đầy đủ skeleton
- Setup Design System (Gemini theme Dark/Light, Tailwind preset)
- Setup i18n (vi/en)
- **Landing Page** (cấu trúc nowpayments.io + visual Gemini)
- **Login Page** (Email/Password + Google button UI giả + Forgot password + Register link)
- Dummy data tĩnh cho login (KHÔNG dùng MSW giai đoạn này)

**CHƯA làm (để sprint sau):**
- Merchant Dashboard
- Checkout Widget
- Admin Dashboard
- MSW + TanStack Query (bổ sung khi cần loading/error/polling thật)
- Auth thật (giai đoạn này chỉ UI dummy, không persistent session)

### 1.3. Các thực thể chính trong hệ thống (tham khảo cho roadmap)
1. **End-User (Khách mua hàng):** Thanh toán hóa đơn qua Checkout Widget.
2. **Merchant (Doanh nghiệp):** Tích hợp cổng thanh toán, theo dõi dòng tiền.
3. **Admin (Quản trị viên):** Vận hành nền tảng.

---

## 2. KIẾN TRÚC MONOREPO

### 2.1. Cấu trúc thư mục
```text
nextpayments/
├── apps/
│   ├── merchant-app/              # Next.js 15 — Sprint 1 tập trung
│   │   ├── package.json
│   │   └── src/
│   │       ├── app/
│   │       │   └── [locale]/
│   │       │       ├── (marketing)/page.tsx        # Landing
│   │       │       ├── (auth)/
│   │       │       │   ├── login/page.tsx
│   │       │       │   ├── register/page.tsx       # placeholder
│   │       │       │   └── forgot-password/page.tsx # placeholder
│   │       │       └── dashboard/page.tsx          # placeholder
│   │       ├── components/
│   │       │   ├── landing/                        # Hero, Features, Coins, Pricing, Footer...
│   │       │   ├── auth/                           # LoginForm, SocialButtons
│   │       │   └── shared/                         # Header, Footer, ThemeToggle, LangSwitcher
│   │       ├── constants/
│   │       │   └── dummy-users.ts
│   │       ├── i18n/
│   │       │   └── messages/{en,vi}.json
│   │       └── lib/
│   └── admin-dashboard/           # Vite + React (CHƯA code Sprint này)
│       └── (skeleton placeholder)
├── packages/
│   ├── ui/                        # Shadcn base, framework-agnostic
│   │   ├── package.json
│   │   └── src/
│   │       ├── components/        # Button, Input, Card, Form... (bổ sung dần)
│   │       └── lib/utils.ts       # cn(), tailwind-merge
│   └── config/
│       ├── tailwind/              # Gemini color preset dùng chung
│       ├── tsconfig/
│       └── eslint/
├── pnpm-workspace.yaml
├── package.json
└── PLAN.md                        # File này
```

### 2.2. Lý do tách 2 apps
- **Build/Deploy độc lập:** `pnpm --filter merchant-app build` và `pnpm --filter admin-dashboard build` không ảnh hưởng lẫn nhau. Triển khai 2 domain riêng (`merchant.domain.com`, `admin.domain.com`).
- **State Management tách biệt:** Merchant dùng Context API (state đơn giản). Admin dùng Zustand (cần tối ưu re-render cho bảng data lớn).
- **Runtime cô lập:** Merchant ưu tiên SEO/LCP (Next.js SSR/RSC). Admin là internal tool, SPA tĩnh đủ.

### 2.3. Quy ước port dev
| App | Port | Ghi chú |
| --- | --- | --- |
| `merchant-app` (Next.js) | **5001** | `pnpm dev` mở `http://localhost:5001` |
| `admin-dashboard` (Vite) | **5002** | Reserved — set khi init app Sprint 4 |

### 2.4. Package dùng chung
- `packages/ui` chứa **Pure UI Components** (Atomic Design). KHÔNG chứa logic nghiệp vụ. KHÔNG dùng `next/image` hay `next/link` để Admin Vite cũng dùng được.
- `packages/config` chứa Tailwind preset, tsconfig base, eslint config — đảm bảo nhất quán giữa 2 apps.

---

## 3. TECH STACK CHỐT

### 3.1. Merchant App (Sprint 1)
| Hạng mục | Lựa chọn |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 + Shadcn UI |
| Theme | next-themes (Dark mặc định) |
| i18n | next-intl v3+ (path-based `[locale]`) |
| Animation | Framer Motion |
| Form | react-hook-form + zod |
| Icons | lucide-react |
| Server State | (chưa cần — thêm TanStack Query khi có async data thật) |
| Local State | Context API (Sidebar, Modal, Theme) |
| Mock | Dummy data tĩnh trong `constants/` |

### 3.2. Admin Dashboard (về sau)
| Hạng mục | Lựa chọn |
|---|---|
| Framework | Vite + React |
| State | Zustand (atomic, tối ưu bảng lớn) |
| i18n | react-i18next + lazy load JSON |
| Styling | Tailwind + Shadcn (dùng chung `packages/ui`) |
| Virtualization | `@tanstack/react-virtual` cho transaction table |

### 3.3. Testing (sau khi có chức năng đáng kể)
- Unit/Component: **Vitest** + React Testing Library
- E2E: **Playwright**

### 3.4. Hệ sinh thái chung
- Package Manager: **pnpm** (workspaces)
- Node: 20.x LTS
- TypeScript: 5.x strict mode

---

## 4. DESIGN SYSTEM (GEMINI THEME)

### 4.1. Triết lý
"Intelligent Workspace": tối giản, khoảng trắng rộng, góc bo tròn mềm (`rounded-xl`, `rounded-2xl`), viền siêu mảnh, micro-interactions tinh tế.

### 4.2. Bảng màu Design Token

**Dark Mode (mặc định — Gemini Desktop canvas):**
- Background: `#131314`
- Card surface: `#1b1b1d`
- Card elevated: `#232427`
- Border mảnh: `#2d2e30`
- Border đậm: `#3c3d40`
- Text chính: `#e3e3e3`
- Text phụ: `#a8abb4`
- Text mờ: `#6e7176`

**Light Mode (Gemini Light theme):**
- Background: `#f0f4f9` (muted blue-gray đặc trưng Gemini)
- Card surface: `#ffffff`
- Border: `#e1e3e7`
- Text chính: `#1f1f1f`
- Text phụ: `#5f6368`

**Gemini Aurora Gradient (Hero moments — dùng tiết chế):**
`linear-gradient(100deg, #4796e3 0%, #9b72cb 50%, #d96570 100%)`
- Blue `#4796e3` — soft sky blue (desaturated từ Google Blue 500)
- Lilac `#9b72cb` — Gemini lavender đặc trưng
- Coral `#d96570` — warm coral thay magenta gắt

**Nguyên tắc dùng gradient (rất quan trọng — Gemini Desktop chỉ dùng gradient ở vài điểm nhấn):**
- ✅ Logo mark icon
- ✅ Hero headline (1 từ khoá duy nhất)
- ✅ Primary CTA button (`Get Started`)
- ✅ Pricing price number
- ✅ CTA banner background glow
- ❌ KHÔNG dùng cho: section kicker, feature icon container, coin tile, step number, status icon, kicker label

**Single accent token (cho mọi UI thứ cấp):**
- `--color-accent: #4796e3` (Gemini blue)
- `--color-accent-soft` = 14% mix với transparent (cho icon container bg)
- `--color-accent-strong` = 22% mix (cho focus ring, hover state)
- Dùng cho: feature icon, sparkles badge, link hover, focus state.

**Status colors (Dark mode):** success `#81c995`, warning `#fdd663`, danger `#f28b82` — đã tone-down so với Material gốc cho phù hợp nền tối Gemini.

### 4.3. Typography
- Sans: `Inter` (load qua `next/font`)
- Mono: `JetBrains Mono` cho code/hash/address

### 4.4. Component conventions
- Border radius: `rounded-xl` (12px) mặc định, `rounded-2xl` (16px) cho card lớn
- Spacing: Tailwind scale, ưu tiên padding 6/8 cho card
- Border: `1px` mảnh dùng màu border token (thay vì shadow trên Dark mode)
- Glassmorphism: `backdrop-blur-xl` cho Header/Sidebar
- Animation: subtle, ưu tiên `ease-out` 200-300ms

### 4.5. Theme switching
- `next-themes` với `attribute="class"` và `defaultTheme="dark"`
- `suppressHydrationWarning` ở `<html>` để chống flash trắng
- Toggle UI: icon sun/moon ở Header

---

## 5. ĐA NGÔN NGỮ (i18n)

### 5.1. Merchant App
- Library: `next-intl` v3+
- Routing: path-based `/vi/...`, `/en/...`
- Default locale: `vi`
- Messages: `src/i18n/messages/{vi,en}.json`
- Server-rendered (không hydration delay)

### 5.2. Admin Dashboard (sau)
- Library: `react-i18next` + `i18next-http-backend`
- Lazy load JSON theo namespace

---

## 6. LANDING PAGE SPEC

### 6.1. Triết lý cấu trúc
Cấu trúc đầy đủ section thuyết phục theo **nowpayments.io**, visual styling theo **Gemini** (dark, minimal, gradient accent, micro-animations).

### 6.2. Sections chi tiết

**1. Header (sticky)**
- Logo bên trái (text + icon gradient)
- Nav giữa: Features, Pricing, Docs, Coins
- Bên phải: Theme toggle, Language switcher, "Log in" (text), "Get Started" (CTA gradient)
- Glassmorphism khi scroll xuống

**2. Hero**
- Headline lớn: "Accept Crypto Payments. Effortlessly." (text gradient cho từ "Crypto")
- Subhead 2 dòng
- 2 CTA: "Get Started Free" (primary gradient) + "View Demo" (ghost outline)
- Background: subtle animated gradient blob
- Optional: floating mockup card (dummy transaction)

**3. Trust bar**
- "Trusted by 200,000+ merchants" + 6-8 dummy logo grayscale

**4. Features Grid (4 cards)**
- No KYC required
- 300+ Cryptocurrencies supported
- Auto-conversion to stablecoins
- Lowest fees in the industry
- Mỗi card: icon gradient + title + 2 dòng mô tả

**5. Supported Coins Grid**
- Grid 6-8 col coin icon (BTC, ETH, USDT, USDC, SOL, BNB, TRX, MATIC, DOGE, LTC...)
- Hover effect subtle

**6. How it Works (3 step)**
- 01. Sign up & create API key
- 02. Integrate widget or API
- 03. Receive crypto, auto-settle
- Mỗi step: số gradient lớn + tiêu đề + mô tả

**7. Pricing**
- Single card đơn giản
- "0.5% per transaction"
- "No setup. No monthly. No KYC."
- CTA "Start Accepting Crypto"

**8. CTA Banner**
- Full-width section, background gradient subtle
- "Ready to accept crypto?" + button lớn

**9. Footer**
- 4 columns: Product, Developers, Company, Legal
- Bottom row: copyright + social icons

### 6.3. Animation guidelines
- Fade-in + slide-up khi scroll vào section (Framer Motion `whileInView`)
- Stagger children trong Features Grid
- Hover scale subtle (1.02) cho card
- Giữ phong cách Gemini "calm" — KHÔNG dùng animation rườm rà

---

## 7. LOGIN PAGE SPEC

### 7.1. Layout
- **Desktop:** Split 50/50
  - Trái: Form login (max-width 420px, vertically center)
  - Phải: Side panel branding — gradient background, logo lớn, tagline "Power your business with crypto payments", decorative shapes
- **Mobile:** Stack vertical, side panel rút gọn thành top banner nhỏ

### 7.2. Form fields
1. Email input (required, validate email format)
2. Password input (required, min 6 ký tự, show/hide toggle icon)
3. "Continue" button (full width, gradient primary)
4. Divider "OR"
5. "Continue with Google" button (full width, outline, Google icon — UI giả)
6. "Forgot password?" link (right-aligned dưới password field) → `/forgot-password`
7. Bottom: "Don't have an account? **Sign up**" → `/register`

### 7.3. Validation
- Library: `react-hook-form` + `@hookform/resolvers/zod`
- Schema:
  - `email: z.string().email()`
  - `password: z.string().min(6)`
- Show inline error dưới field, real-time validate khi blur

### 7.4. Dummy auth flow
- File `constants/dummy-users.ts`: array users `{ email, password, name }`
- Submit handler:
  - Tìm user khớp → success → `router.push('/dashboard')` + toast success
  - Không khớp → toast error "Invalid email or password"
- KHÔNG có persistent session, KHÔNG có middleware bảo vệ route

### 7.5. Google button (UI giả)
- Click → show loading state 1s → redirect `/dashboard`
- KHÔNG OAuth thật, chỉ simulate UX

### 7.6. Pages placeholder cần tạo
- `/register` — heading "Register page coming soon" + link back to login
- `/forgot-password` — heading placeholder
- `/dashboard` — heading "Dashboard placeholder" (chưa làm Sprint 1)

---

## 8. CHIẾN LƯỢC HIỆU NĂNG

### 8.1. Targets
- **LCP** < 2.0s (Landing)
- **CLS** < 0.1
- **TTI** < 3.0s
- **Bundle initial Landing** < 200KB gzip

### 8.2. Kỹ thuật áp dụng (Sprint 1)
- Server Components mặc định cho Landing (chỉ Form/Toggle là Client)
- `next/image` cho mọi hình ảnh + lazy load below fold
- `next/font` cho Inter (zero CLS)
- Code-split tự nhiên: route groups `(marketing)` vs `(auth)`
- Giữ cố định width/height cho area dynamic content (chống CLS)

### 8.3. Cho tương lai
- **Widget:** Dynamic import QR code library, bundle budget < 80KB gzip
- **Dashboard tables:** `@tanstack/react-virtual` cho hàng ngàn dòng

---

## 9. RỦI RO KỸ THUẬT & GIẢI PHÁP

| Rủi ro | Tác động | Giải pháp |
|---|---|---|
| Tailwind v4 config khác v3 hoàn toàn | Setup chậm, dễ sai | Dùng đúng `@theme` syntax mới trong CSS + Shadcn CLI latest |
| Shadcn CLI mặc định cài vào app, không vào `packages/ui` | Component bị duplicate | Config `components.json` với alias trỏ về `packages/ui/src/components` |
| Hydration mismatch theme/i18n | Flash trắng màn hình | `suppressHydrationWarning` + locale từ URL segment + blocking script theme |
| Context API re-render bảng lớn (tương lai) | Lag scroll | Bảng lớn dùng URL params hoặc Zustand (Admin) |
| Drift type giữa dummy data và component | Bug runtime | Định nghĩa Zod schema cho dummy data → `z.infer` lấy type |
| Provider hell trong root layout | Khó maintain | Tách `Providers.tsx` Client Component bao gồm Theme + Intl + Context |
| `packages/ui` dùng `next/*` → Admin Vite vỡ | Không tái sử dụng được | Forbid `next/*` import trong `packages/ui`; pass `Link`/`Image` qua props |

---

## 10. ROADMAP

### Sprint 1 — Hiện tại (Tuần 1-2)
- [x] Phân tích & chốt plan
- [ ] Setup Monorepo `pnpm workspaces`
- [ ] Setup `packages/config/tailwind` (Gemini preset)
- [ ] Setup `packages/ui` (base utils + Shadcn config)
- [ ] Init `apps/merchant-app` (Next.js 15 + Tailwind v4 + Shadcn)
- [ ] Setup `next-themes` + `next-intl`
- [ ] Build Landing Page (9 sections)
- [ ] Build Login Page + 3 placeholder pages
- [ ] Dummy users + form validation

### Sprint 2 — Merchant Dashboard
- Sidebar layout với navigation
- Dashboard tổng quan + biểu đồ (Recharts với dummy data)
- Quản lý Hóa đơn (Invoice list + create form)
- Cài đặt API Key (UI)
- Tích hợp MSW + TanStack Query khi có async flow

### Sprint 3 — Checkout Widget
- Route `/checkout/[invoiceId]` trong merchant-app
- UI chọn coin + QR code + countdown timer
- State machine Pending → Confirming → Success/Expired
- Animation Framer Motion mượt mà

### Sprint 4 — Admin Dashboard
- Init `apps/admin-dashboard` (Vite + React + Zustand)
- Transaction Ledger với virtualization
- Merchant management UI
- Setup Vitest + Playwright cho E2E

---

## 11. QUY ƯỚC CODE

- File naming: `kebab-case.tsx`
- Component naming: `PascalCase`
- Hook naming: `useCamelCase`
- Constants: `UPPER_SNAKE_CASE`
- Imports: absolute với alias `@/`
- Server Component mặc định, chỉ `'use client'` khi cần hook/event
- 1 component / file, named exports cho sub-parts
- Comment tiếng Anh, message i18n tiếng Việt/Anh theo locale
- Mỗi PR/commit thuộc 1 phạm vi rõ ràng (1 section landing / 1 component)

---

## 12. UI KIT — COMPONENT LIBRARY SPEC

### 12.1. Triết lý
`packages/ui` là **Pure UI layer** theo Atomic Design, framework-agnostic (dùng được cho cả Next.js merchant-app lẫn Vite admin-dashboard). Không `next/*`, không logic nghiệp vụ, không data fetching. Mỗi component:
- Style hoàn toàn qua Design Token (`var(--color-*)`, `var(--radius-*)`) — tự đổi theo Dark/Light.
- API điều khiển bằng `cva` variants, type lấy từ `VariantProps`.
- `forwardRef` + spread `...props` để trong suốt với DOM.
- `asChild` (Slot pattern) để polymorphic — render thành `<a>`, `next/link`, v.v. mà giữ nguyên style.

### 12.2. Button — Atom đầu tiên (Sprint 1)

**Variants** (tông Gemini, gradient dùng tiết chế):

| Variant | Dùng cho | Mô tả style |
|---|---|---|
| `primary` | Hành động chính (mặc định) | Pill trắng, chữ đen — high-contrast Gemini |
| `gradient` | CTA hero/landing duy nhất | Aurora gradient, dùng rất tiết chế |
| `secondary` | Hành động phụ nổi bật | Surface elevated + border |
| `outline` | Hành động phụ | Viền mảnh, nền trong suốt |
| `ghost` | Header / inline / icon | Không chrome, hover surface |
| `subtle` | Tertiary trong card | Surface mờ + border hairline |
| `destructive` | Xóa / hủy nguy hiểm | Nền danger token |
| `link` | Điều hướng dạng text | Gạch chân khi hover, không padding |

**Sizes:** `sm` (h-9), `md` (h-11, mặc định), `lg` (h-12), `xl` (h-14, hero CTA), `icon` (vuông 9/9).

**States & props mở rộng:**
- `loading` — hiện spinner, vô hiệu hóa pointer, giữ nguyên width (chống CLS).
- `leftIcon` / `rightIcon` — slot icon (`lucide-react`), tự canh gap.
- `fullWidth` — `w-full` cho form/mobile.
- `disabled` — `opacity-50`, mất pointer.
- `asChild` — polymorphic qua Slot nội bộ (không phụ thuộc Radix).

**Component họ Button:**
- `Button` — atom chính (file `button.tsx`).
- `IconButton` — wrapper bắt buộc `aria-label`, mặc định `size="icon"` (`icon-button.tsx`).
- `ButtonGroup` — gom nút liền kề, bo góc đầu/cuối, chia separator (`button-group.tsx`).

**Backward-compat (bắt buộc):** không đổi tên `primary` `outline` `ghost` `subtle` và size `sm` `md` `lg` `icon` — các component landing/auth đang dùng.

**Showcase:** route nội bộ `/[locale]/ui-kit` render toàn bộ ma trận variant × size × state để QA visual Dark/Light (không link từ nav công khai).

### 12.3. Lộ trình mở rộng UI Kit (sprint sau)
`Input` → `Card` → `Badge` → `Avatar` → `Tooltip` → `Dialog/Modal` → `Toast` → `Tabs` → `Table` (Sprint 2-4 theo nhu cầu Dashboard/Widget).
