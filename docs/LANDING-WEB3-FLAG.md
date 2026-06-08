# Landing Web3 Redesign — A/B Flag (handoff)

Tài liệu tổng hợp luồng redesign landing page sang phong cách web3 và cơ chế
**flag `?temp=1`** để xem song song hai thiết kế. Dùng để tái sử dụng / tiếp tục
ở session khác.

App: `apps/merchant-app` (Next.js 15 App Router, React 19, Tailwind v4, next-intl).

---

## 1. Mục đích & cách dùng

Landing page giữ **đồng thời hai giao diện**, chọn bằng query param:

| URL                              | Giao diện                                   |
| -------------------------------- | ------------------------------------------- |
| `/` · `/en` · `/fr` (không flag) | **Gốc (default)** — bản Gemini calm ban đầu |
| `/en?temp=1`                     | **Web3 (experimental)** — bản redesign mới  |

Mặc định = gốc. Chỉ khi có `?temp=1` mới hiện bản web3.

Chạy local:

```bash
pnpm --filter merchant-app dev      # mặc định cổng 5001 (đổi qua -p nếu bận)
# http://localhost:5001/en          → gốc
# http://localhost:5001/en?temp=1   → web3
```

---

## 2. Cơ chế flag

`apps/merchant-app/src/app/[locale]/(marketing)/page.tsx` đọc `searchParams`
phía server và render thẳng một trong hai composition:

```tsx
export const dynamic = 'force-dynamic'; // query-dependent → render theo request

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ temp?: string }>;
}) {
  const { temp } = await searchParams;
  return temp === '1' ? <LandingTemp /> : <LandingOriginal />;
}
```

- **Server-side** (không phải `useSearchParams` client) → cả hai bản ra **full
  HTML, không nháy, giữ SEO**.
- `force-dynamic` bắt buộc vì nếu để SSG, bản prerender sẽ phục vụ một giao diện
  cho mọi query → flag hỏng trên production.

---

## 3. Cấu trúc file

Hai bộ component **tách biệt, self-contained**:

```
apps/merchant-app/src/components/landing/
├─ landing-original.tsx        # composition GỐC (default)
├─ hero.tsx trust-bar.tsx features.tsx coins.tsx
│  how-it-works.tsx pricing.tsx cta-banner.tsx
│  section-heading.tsx reveal.tsx hero-visual.tsx   # ← bản GỐC
└─ temp/                       # giao diện WEB3 (experimental)
   ├─ landing-temp.tsx         # composition WEB3
   ├─ hero.tsx … cta-banner.tsx section-heading.tsx # ← bản WEB3
   ├─ reveal.tsx hero-visual.tsx                     # copy (giữ self-contained)
   └─ fx/                      # FX primitives (chỉ web3 dùng)
      ├─ hero-scene.tsx hero-canvas.tsx   # particle globe 3D (three/r3f)
      ├─ spotlight-card.tsx conic-border.tsx magnetic.tsx
      ├─ kinetic-line.tsx number-ticker.tsx
```

> **v2 — PaaS redesign (Stitch dark-navy)**: hero chuyển sang **2 cột**
> (text trái · particle globe + glass card phải), features 4-card đều nhau,
> coins thành **section PaaS** (toolkit glyphs + lưới 8 coin), how-it-works
> 3 card ngang, pricing 2 cột. Đã gỡ `marquee.tsx`, `FEATURED_COIN_*`,
> các keyframe/utility không dùng (`np-conic-spin`/`np-shimmer`/`np-marquee`,
> `mask-edge-x`). Copy PaaS-specific nằm ở `landing.web3.*` (en + fr).

`Header` + `Footer` (trong `components/shared/`) và marketing `layout.tsx` dùng
chung cho cả hai.

---

## 4. Design system web3 (chỉ ảnh hưởng merchant, không đụng admin)

### Tokens / utilities — `apps/merchant-app/src/app/globals.css`

Thêm (additive, reuse brand tokens trong `packages/config/tailwind/theme.css`):

- `@keyframes`: `np-gradient-pan` (dùng bởi `text-gradient-web3`)
- `@utility`: `text-gradient-web3` (gradient chữ động cyan→blue→lilac→coral),
  `bg-web3-grid` (lưới blueprint), `glow-accent`, `mask-radial-fade`
- Mọi animation đều gate `prefers-reduced-motion`.

### FX primitives (`temp/fx/`) — tokens-only, có reduced-motion + fallback

| File                 | Hiệu ứng                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hero-scene.tsx`     | particle globe: ~2600 điểm rải đều mặt cầu (Fibonacci), tint cyan→lilac theo vĩ độ (vertex colors), bọc wireframe icosahedron + lớp dust, xoay nhẹ idle |
| `hero-canvas.tsx`    | wrapper `dynamic(ssr:false)` — chỉ mount khi ≥768px + không reduced-motion + có WebGL; đọc `--color-brand-blue/cyan/lilac`                              |
| `spotlight-card.tsx` | card 3D tilt + spotlight theo chuột + **ambient hover background color** (per-card)                                                                     |
| `conic-border.tsx`   | viền gradient xoay                                                                                                                                      |
| `magnetic.tsx`       | nút hút theo con trỏ                                                                                                                                    |
| `kinetic-line.tsx`   | headline hiện theo từng từ (mask rise) + gradient                                                                                                       |
| `number-ticker.tsx`  | đếm số khi vào viewport                                                                                                                                 |

### Hiệu ứng theo section (web3 — PaaS layout)

- **Hero**: **2 cột**. Trái = eyebrow pill · kinetic headline · subhead · CTA
  (magnetic glow + "View demo"). Phải = particle globe 3D + **glass card** nổi
  (`hero-visual.tsx`, DOM thật nên crisp/accessible) + orb glow. Globe chỉ là
  progressive-enhancement; card + orb là lớp base luôn hiện.
- **TrustBar**: 1 glass pill ngang (count-up), hairline chia 2×2 → 1×4.
- **Features**: 4 card đều nhau (1 hàng) · SpotlightCard · mỗi card 1 màu
  ambient (blue/lilac/cyan/coral). Tiêu đề business: `landing.web3.featuresTitle`.
- **Coins → PaaS**: 2 cột. Trái = toolkit glyphs (Blocks/Plug/Wrench) ·
  "Platform as a Service" (`landing.web3.paas.*`) · "View all 300+". Phải =
  lưới 8 coin (`COIN_TILES.slice(0,8)`).
- **HowItWorks**: 3 card ngang + rail gradient nối (desktop).
- **Pricing**: 2 cột. Trái = title + bullets. Phải = ConicBorder card 0.5% +
  light-burst (radial + repeating-conic rays).
- **CTA**: banner TwinAuroras bold + magnetic (giữ lại — Stitch kết ở pricing,
  nhưng giữ làm closing CTA; bỏ nếu muốn bám 1:1).

### Coin grid (PaaS section)

`temp/coins.tsx` dùng `COIN_TILES.slice(0, 8)` từ
`apps/merchant-app/src/constants/coins.ts` (8 token đầu). `FEATURED_COIN_*` cũ
đã **gỡ** (không còn marquee/hero-coin tiêu thụ). **Không** trim `COIN_TILES`
gốc vì dashboard (balances, transaction filters) còn dùng đủ 12 coin.

### i18n

Thêm key `landing.hero.eyebrow` vào **cả** `src/i18n/messages/en.json` và
`fr.json`. Mọi copy còn lại reuse key gốc.

---

## 5. Dependencies đã thêm

```bash
pnpm --filter merchant-app add three @react-three/fiber@^9 @react-three/drei
pnpm --filter merchant-app add -D @types/three
```

- `@react-three/fiber` **phải v9** (React 19). `three` lazy-load (chunk riêng,
  không nằm trong First Load JS của landing).
- `gsap` đã thử rồi **gỡ** — dùng framer-motion `useScroll` cho scroll effects
  (robust hơn, không cần pin plugin).

---

## 6. Validation gate (chạy trước khi commit)

```bash
pnpm --filter merchant-app typecheck      # tsc --noEmit
pnpm --filter merchant-app lint
pnpm format                               # prettier write
# i18n: en.json & fr.json cùng key set
```

**Build khi dev server đang chạy** → KHÔNG dùng `pnpm build` (ghi đè `.next`
chung làm vỡ dev server: `ENOENT app-build-manifest.json`). Dùng dist riêng:

```bash
pnpm --filter merchant-app build:check    # NEXT_DIST_DIR=.next-check next build
rm -rf apps/merchant-app/.next-check
```

---

## 7. Gỡ flag / chọn một giao diện chính thức

**Giữ web3 làm chính:**

1. Copy nội dung `temp/*` đè lên `landing/*` (hoặc trỏ import sang `temp/`).
2. Bỏ `temp/`, xoá `landing-original.tsx` + `landing-temp.tsx`.
3. `page.tsx` về render thẳng một composition, bỏ `force-dynamic` +
   `searchParams` (để route static SSG lại).
4. Di chuyển token/utility + FX vào vị trí chính thức nếu cần.

**Giữ gốc, bỏ web3:** xoá `temp/`, `landing-temp.tsx`, các dep three/r3f/drei,
khối "Web3 landing FX" trong `globals.css`, key `landing.web3.*` + `eyebrow`;
trả `page.tsx` về bản gốc.

---

## 8. Đã verify / còn cần review bằng mắt

**Đã verify (PaaS redesign):** typecheck · lint · `build:check` · render thật
trên Chrome local — **EN, dark mode, desktop**: hero (globe + card), trustBar,
features, PaaS coins, how-it-works, pricing đều khớp Stitch screen `b6dbfd`/`cb50e43`.
FR render OK + en/fr key parity khít.

**Chưa verify (cần mắt):**

- **Light mode** — `hero-visual.tsx` cố ý dùng `text-white` (card tối) + vài hex
  inline (chip, dust); kiểm gradient/glass/grid khi bật light theme.
- **Mobile / reduced-motion / no-WebGL** — kiến trúc đúng (card + orb là base,
  globe gated bởi `hero-canvas`) nhưng chưa chụp thực tế.
- Tinh chỉnh globe: `POINT_COUNT 2600`, `SPHERE_RADIUS 3.35`, tốc độ xoay
  `delta * 0.09` (`temp/fx/hero-scene.tsx`); góc nghiêng/độ nổi của card
  (`hero-visual.tsx`).
- Cường độ ambient hover trên Features card; cường độ light-burst ở Pricing.
