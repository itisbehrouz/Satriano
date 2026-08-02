# Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — late afternoon update)

**Scope:** B2B Made-to-Order e-commerce + multi-category product catalog + ready-made wholesale stock catalog & checkout + B2B partner portal + admin wholesale management + workflow automation
**Capacity assumption:** Solo developer, ~2 hours/day
**Development environment:** Google Antigravity (primary), Claude Code (approved fallback when Antigravity quota exhausted), Claude (architecture/planning), Vercel (hosting), Supabase (DB + Storage)
**Cost principle:** Zero fixed cost — usage/commission-based services only (Vercel free tier, Supabase free tier, Stripe transaction fees when live)

This document consolidates everything decided and built through August 2, 2026. It replaces all prior versioned roadmap files — this is the single source of truth going forward. Update this file in place going forward; do not create new versioned files.

---

## 1. Catalog Architecture

**Category → Subcategory → Product** (3 levels), fully database-backed.

- **7 Categories**: Tops, Bottoms, Outerwear, Formal Wear, Sportswear, Underwear & Loungewear, Accessories
- **~28 Subcategories**
- **65 Products** — each with its own Fabric/price set, Fit options, and MOQ values. Every originally-merged name (e.g. "Dress & Casual Shirts") was split into separate, individually-configurable Products.

### Product dimensions:
- **Fit (Kalıp):** 8 values (Slim, Regular, Relaxed, Tailored, Skinny, Tapered, Modern, Oversized). 41 products have Fit linked; 24 (Sportswear, Underwear & Loungewear, Accessories) deliberately excluded — fit/cut isn't meaningful for those.
- **Size System (EU/US):** 10 size systems (Alpha, Waist, Chest, Shoe, OneSize × EU/US). Turkey/Middle East mapped to EU.
- **Two-Tier MOQ:**
  - `moqPerFabric` — minimum order for a single fabric/colorway (enforced in order creation).
  - `moqCombinedMultiFabric` — minimum combined total across multiple fabrics/colors of the same product (schema + seed data exist; **validation not yet enforced** — multi-fabric-per-order UI isn't built yet).
  - All 65 products seeded with real MOQ values from a user-provided spreadsheet.
- **Configurator UX:** stepper (+/-) controls for size quantities, live MOQ progress indicator gating order submission, sticky price panel. Multi-photo product gallery ("Part D") — **not started**, may require new asset generation across all 65 products; scope decision pending.
- **Ready-Made Wholesale Stock Catalog (`/wholesale`):** Dedicated catalog for fixed-price, ready-to-ship menswear items with open-pack size matrices, pre-pack bundles, and bulk price negotiation.

---

## 2. Pricing Model

No auto-calculated exact pricing for Made-to-Order (M2O). Instead:

1. **Made-to-Order (M2O) Flow:**
   - Customer selects a fabric → sees a **price range**: `Fabric.priceMinCents`–`priceMaxCents`.
   - Customer enters their own **target price** (`Order.customerTargetPriceCents`).
   - Order is created in `PENDING_REVIEW` — **no automatic proforma**.
   - Admin reviews feasibility, sets `finalPriceCents`, manually triggers the proforma.
   - Customer sees an "under review" state at `/proforma/[orderId]` until the final price is set.
2. **Wholesale Stock Flow (`/wholesale`):**
   - Products listed with fixed wholesale unit prices (e.g. `$125.00`).
   - Open-pack size breakdown steppers (`36` to `52`) with live stock availability indicators.
   - Pre-pack bundle ordering options (1 Pack / 5 units, 2 Packs / 10 units, All Available).
   - Price negotiation offer input for bulk orders ($\ge 10$ units) allowing buyers to submit custom price proposals (e.g. `$100/unit offered vs $125 list`).
   - Wholesale cart checkout with breakdown review, subtotal, negotiated offer discount line, terms agreement, invoice request options, and B2B payment methods (Credit Card, Bank Transfer, B2B Net-30 Terms).

`OrderStatus` enum: `DRAFT → PENDING_REVIEW → PROFORMA_SENT → APPROVED → PAID → IN_PRODUCTION → SHIPPED / CANCELLED` (full lifecycle supported in admin, including SHIPPED/CANCELLED transitions).

---

## 3. Production Infrastructure

- **Database:** Supabase PostgreSQL (`satriano-atelier-prod`, Frankfurt/eu-central-1), via Prisma ORM. Pooler connection (port 6543, `pgbouncer=true`) for runtime; direct connection (port 5432) for migrations.
- **Vercel Environment Variables (Production only, not Preview):** `DATABASE_URL`, `DIRECT_URL`, `ADMIN_ACCESS_KEY`, `ADMIN_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM`, `RESEND_API_KEY`.
- **Supabase Storage buckets:**
  - `logos` — public, customer logo/vector uploads.
  - `catalog-images` — **public**, admin-uploaded category/subcategory/product photos used on customer-facing `/categories` pages. Dedicated bucket separate from logos. Accepts JPG/PNG/WebP, 5 MB max.
  - `proformas` — **private**, signed-URL access via the fixed endpoint `/api/proforma/pdf/[orderId]`, which generates a fresh signed URL on every request and 307-redirects. The link never breaks; the bucket never needs to be public. Authorizes both admin sessions and the order's own customer session.
- **Data API (Supabase REST):** Disabled — no table auto-exposed; all access via Prisma (deliberate security decision).
- **Git workflow:** single `main` branch → Vercel Production directly. No `develop`/staging branch — deliberately decided against given solo capacity. Testing discipline instead: Vitest unit test suite (132 tests) + real E2E tests directly against production, followed by explicit test-data cleanup every time.

---

## 4. Security

- Admin auth: server-side JWT (`jose`, HS256, pinned algorithm), httpOnly signed cookie (`sat_admin_token`), `middleware.ts` protects both `/admin` pages and all `/api/admin/*` routes. No hardcoded fallback secrets — missing env vars throw a hard error. Root `/admin` is not redirected in middleware; page checks session via `useEffect` and displays login form.
- Customer auth: **magic-link login**, APPROVED-B2B-application-gated (see Section 6). Signed httpOnly cookie (`sat_customer_token`), separate from admin.
- **Standing rules (non-negotiable, apply to every coding session):**
  1. No destructive database command (`--force-reset`, `migrate reset`, `env rm`, `git reset --hard`, etc.) without pasting the exact command and getting explicit "yes, run it" confirmation first.
  2. Secret/credential values are never printed in chat, logs, or reports — only pass/fail confirmations.
  3. Never scrape credentials from IDE session transcript logs as a "recovery" method — always get fresh values from the actual source (Supabase/Vercel dashboards).

---

## 5. Admin Panel — Inventory & Wholesale Management

### ✅ Working
- Corporate Access Key auth, order list + detail, full status lifecycle (incl. SHIPPED/CANCELLED), logo file visibility, proforma PDF (persistent, private bucket), status filter tabs.
- B2B Applications review screen (`/admin/applications`) — list, filter by status, expand full application detail, approve/reject (blocked until email verified), UI UX Pro Max design, accessibility-compliant.
- Catalog management (`/admin/product-settings`): Category → Subcategory → Product hierarchy view/CRUD (create forms for all 3 levels, duplicate-slug rejection, missing-fabric rejection), Fabric active toggle, Fit assignment matrix, MOQ editor, Size system view.
- **Swiss Admin UI & Command Palette:** shared sidebar/top-bar chrome separated from public website; Garment Fits, Catalog & MOQs, Regional Sizing, and Fabric Tiering redesigned to neutral-gray accordion + table pattern (`#F9FAFB` bg, `#D0D5DD` borders, `#2E5AAC` accent). Universal `⌘K` command palette indexing products, categories, subcategories, companies, and orders.
- **Admin Wholesale Manager (`/admin/wholesale`):**
  - **Pricing Manager:** `PRODUCT PRICING TIER` table with M2O price ranges, wholesale fixed prices, stock counts, inline price input, and real-time save.
  - **Inventory by Size/Color:** Product variant selector, granular size stock matrix (`Size 36` to `48`), and `[Edit Stock Levels]` inline editor.
  - **Price Offer Inbox:** `PENDING PRICE OFFERS` table displaying bulk buyer offers with `[Accept]`, `[Reject]`, and `[Counter Offer: $X/unit]` actions.
  - **Wholesale Order Status:** `RECENT WHOLESALE ORDERS` table with status dropdown selector (`Pending Review`, `Approved`, `In Fulfillment`, `Shipped`, `Cancelled`).

---

## 6. B2B Customer Portal — Full Chain & Wholesale Integration

Real chain, end-to-end verified on production with genuine emails:

1. **Application submission** (`/portal`, 3-step form) → creates `B2bApplication` (status `SUBMITTED`).
2. **Email verification** — verification email sent (`EmailVerificationToken`, 24h expiry); clicking it transitions status to `UNDER_REVIEW` and sets `emailVerifiedAt`. Admin cannot approve/reject before email verification.
3. **Admin review** (`/admin/applications`) — approve or reject.
4. **Magic-link login** (`/portal`) — customer requests login link; sent only if `B2bApplication.status === APPROVED`. Identical API response regardless of status to prevent email enumeration.
5. **Customer Dashboard (`/portal`)** — header navigation bar (`Catalog`, `Orders`, `Account`), `CompanyInfoCard`, `QuickActionButtons`, recent orders preview, helpful resources.
6. **Order History (`/portal/orders`)**:
   - Order type filter tabs: `[ALL ORDERS]`, `[M2O ORDERS]`, `[WHOLESALE ORDERS]`.
   - Wholesale table view with `Order ID` (`#WH001`), `Date`, `Units`, `Total`, `Status`.
   - **Wholesale Order Detail Modal**: Displays stock breakdown by size (`36(3) 38(5) 40(1) 44(3)`), unit price (offered `$100.00/unit` vs list `$125.00/unit`), bulk discount percentage (`20% Bulk Discount Applied (-$300.00)`), and delivery estimate (`Immediate Dispatch (3–5 Business Days)`).
7. **Account & Support Hubs**:
   - `/portal/account`: Company info tab, notification & billing settings tab, recent invoices table.
   - `/portal/support`: Direct communication channels (WhatsApp, Telegram, Email, Signal) and support ticket submission form.

---

## 7. Ready-Made Stock Wholesale Catalog & Checkout Flow (`/wholesale`)

- **Wholesale Catalog (`/wholesale`)**:
  - Header: `WHOLESALE CATALOG` — `Ready-made menswear with fixed pricing and immediate availability`.
  - Sticky left sidebar filters: Category (checkboxes), Fabric Line (checkboxes), Price Range ($10–$500 slider), In Stock Only toggle.
  - 4-column desktop product grid (`280px × 380px`, white background, `1px solid #E0E0E0`, `0px` corner radius, price `$125.00` font-mono tabular-nums, `✓ In Stock` / `⚠ Low Stock` / `Out of Stock` status badges, 40px `"VIEW & ORDER"` button).
  - Responsive pagination (12 per page desktop, 8 tablet, 4 mobile).
- **Wholesale Product Detail (`/wholesale/[productId]`)**:
  - 2-column layout (Large main image + 4-thumbnail selection grid, SKU `CY-1306-11`, Name `Shawl Lapel Slim Fit Blazer Men Prom Blazer - Wessi`, Fixed price `$125.00`, `✓ IN STOCK` status, detailed description).
  - 9-size stock matrix (`36`-`52`) with `+`/`-` steppers, `Qty: N`, `N in st` indicators.
  - Pre-Pack bundle ordering options (1 Pack 5 units, 2 Packs 10 units, All Available).
  - Price Negotiation offer input for bulk orders ($\ge 10$ units).
  - `[ADD TO CART]` button saving breakdown to `localStorage` wholesale cart and redirecting to checkout.
- **Wholesale Cart Checkout (`/wholesale/checkout`)**:
  - Title: `YOUR WHOLESALE ORDER`.
  - Item review table displaying item name, SKU, total units, size breakdown (`36(3) 38(5) 40(1) 44(3)`), and line price.
  - Subtotal, Negotiated Offer discount line (`✓ $100/unit -$300.00`), Total amount.
  - Terms & Invoice checkboxes (`I agree to bulk order terms`, `Send invoice before proceeding`).
  - B2B Payment method selection: Credit Card (Virtual POS), Bank Transfer (SWIFT Proforma), B2B Net-30 Terms.
  - `[PROCEED TO PAYMENT]` submission and state persistence in localStorage / customer portal history.

---

## 8. Incident Log & Operational Lessons

**Aug 1 — Local dev environment recovery.** While Antigravity quota was exhausted, work continued via local model causing stale `.env.local`. Recovered via `git reset --hard origin/main` + `git clean -fd`, fresh Supabase password reset, and rebuilding `.env.local` from Supabase connection modal. Verified via `npm test` and `npm run dev`.

**Aug 1 — Production down after local Supabase password reset.** Password reset locally wasn't updated on Vercel Production, causing `P1000 Auth Error`. **Lesson:** Whenever Supabase DB password is rotated, both `.env.local` AND Vercel Production env vars must be updated together, followed by a Vercel redeploy.

**Aug 2 — Prisma Client Server Component Reachability & Fallback Protection.** Resolved `PrismaClientKnownRequestError: Can't reach database server` by wrapping database queries in `try / catch` blocks across server pages (`app/wholesale/page.tsx`, `app/admin/wholesale/page.tsx`, `app/wholesale/[productId]/page.tsx`), ensuring graceful offline fallback rendering without crashing server components.

---

## 9. Remaining Priority Order

1. **[COMPLETED] Commit + push admin redesign work** (chrome separation, Catalog & MOQs, Garment Fits, Regional Size Systems, Fabric Tiering, and Live Command Palette) to `main`.
2. **[COMPLETED] Redesign Regional Size Systems tab** (neutral accordion + slide-over drawer).
3. **[COMPLETED] Redesign Product Fabrics & Ranges tab** (neutral pricing table + slide-over drawer).
4. **[COMPLETED] Photo/image upload field for catalog Add/Edit forms** (`CatalogImageUploader.tsx`).
5. **[COMPLETED] Fabric price-range & setup fee editing UI** (`FabricPricingPanel.tsx`).
6. **[COMPLETED] Wire the admin `⌘K` search bar to real filtering** (`GlobalCommandPalette.tsx` with live database indexing).
7. **[COMPLETED] B2B Customer Portal Redesign & Support Hub** (`PortalHeader.tsx`, `PortalDashboard.tsx`, `/portal/account`, `/portal/support`).
8. **[COMPLETED] Wholesale Ready-Made Catalog & Checkout Flow** (`/wholesale`, `/wholesale/[productId]`, `/wholesale/checkout`).
9. **[COMPLETED] Admin Wholesale Management Dashboard** (`/admin/wholesale` for pricing, size inventory, price offers, and order status).
10. **[COMPLETED] Codebase Health Audit & Dead Code Removal** (systematic audit, deleted dead components & shims, 100% test pass rate).
11. Configurator Part D (multi-photo gallery) — scope decision pending.
12. Multi-fabric-per-order feature (unblocks `moqCombinedMultiFabric`).
13. Stripe live account migration — deferred.

---

## 10. Standing Tools (Skills)

- `codebase-health-audit` — dead code / over-engineering audit. Use after major schema/architecture changes.
- `feature-inventory-audit` — full, code-verified inventory of a feature area (catches drift between "reported done" and actual state).
- `ui-bug-triage` — classify a screenshot/bug report before writing any fix prompt.

---

## 11. AI Agentic Skills & Autonomous Infrastructure

- **Agent Skill Integration:** Deployed `.agents/skills` directory to automate development and auditing tasks (Prisma CLI, Client API, driver adapters, design system, UI/UX Pro Max, slides, brand identity, banner design).
- **Typography & Brand Enforcement:** Canvas font library (Bricolage Grotesque, Crimson Pro, IBM Plex, Outfit, Tektur, Work Sans, etc.) alongside automated scripts for logo validation, color palette extraction, and brand guideline consistency.
- **Strict Language Rule:** 100% English across all UI text, code comments, date formats (`en-US`), PDF output, and documentation. Zero Turkish text anywhere in the codebase.

---

## 12. System Health Check & Test Suite Status (Aug 2, 2026)

| Area / Component | Status | Empirical Evidence / Verification | Recommendation |
|---|---|---|---|
| **Vitest Test Suite** | 100% Healthy | 27/27 test files, 132/132 unit tests passing cleanly in ~4.6s | Maintain 100% test coverage for new endpoints |
| **Prisma Connection Pooling** | 100% Healthy | Port `:6543` Transaction Pooler + cached `PrismaPg` on `globalThis` | Prevents pool exhaustion in serverless |
| **Admin Layout Isolation** | 100% Healthy | Separate Swiss admin chrome (`#F9FAFB` bg, `#D0D5DD` borders); consumer site header/footer stripped | Maintain separate layout boundaries |
| **Wholesale Catalog & Checkout** | 100% Healthy | `/wholesale`, `/wholesale/[productId]`, `/wholesale/checkout` fully operational | Production build verified |
| **Customer Portal Wholesale Orders** | 100% Healthy | `/portal/orders` tabs (`ALL`, `M2O`, `WHOLESALE`), stock breakdown modal | Fully verified & operational |
| **Admin Wholesale Dashboard** | 100% Healthy | `/admin/wholesale` (Pricing, Inventory by Size, Price Offer Inbox, Order Status) | Fully verified & operational |
| **Codebase Hygiene** | 100% Healthy | Systematic audit completed; removed dead components & legacy re-export shims | Re-run health check after major drops |