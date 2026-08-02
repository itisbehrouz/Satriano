# Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — Theme System & Full Roadmap Consolidation)

**Scope:** B2B Made-to-Order e-commerce + multi-category product catalog + B2B partner portal + workflow automation
**Capacity assumption:** Solo developer, ~2 hours/day
**Development environment:** Google Antigravity (primary), Claude Code (approved fallback when Antigravity quota exhausted), Claude (architecture/planning), Vercel (hosting), Supabase (DB + Storage)
**Cost principle:** Zero fixed cost — usage/commission-based services only (Vercel free tier, Supabase free tier, Stripe transaction fees when live)

This document consolidates everything decided and built through August 2, 2026 (adds Section 26). It replaces all prior versioned roadmap files — this is the single source of truth going forward. Update this file in place going forward; do not create new versioned files.

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

---

## 2. Pricing Model

No auto-calculated exact pricing. Instead:

1. Customer selects a fabric → sees a **price range**: `Fabric.priceMinCents`–`priceMaxCents`.
2. Customer enters their own **target price** (`Order.customerTargetPriceCents`).
3. Order is created in `PENDING_REVIEW` — **no automatic proforma**.
4. Admin reviews feasibility, sets `finalPriceCents`, manually triggers the proforma.
5. Customer sees an "under review" state at `/proforma/[orderId]` until the final price is set.

`OrderStatus` enum: `DRAFT → PENDING_REVIEW → PROFORMA_SENT → APPROVED → PAID → IN_PRODUCTION → SHIPPED / CANCELLED` (full lifecycle supported in admin, including SHIPPED/CANCELLED transitions).

---

## 3. Production Infrastructure

- **Database:** Supabase PostgreSQL (`satriano-atelier-prod`, Frankfurt/eu-central-1), via Prisma ORM. Pooler connection (port 6543, `pgbouncer=true`) for runtime; direct connection (port 5432) for migrations.
- **Vercel Environment Variables (Production only, not Preview):** `DATABASE_URL`, `DIRECT_URL`, `ADMIN_ACCESS_KEY`, `ADMIN_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM`, `RESEND_API_KEY`.
- **Supabase Storage buckets:**
  - `logos` — public, customer logo/vector uploads.
  - `catalog-images` — **public**, admin-uploaded category/subcategory/product photos used on customer-facing `/categories` pages. Dedicated bucket separate from logos (different purpose). Accepts JPG/PNG/WebP, 5 MB max.
  - `proformas` — **private**, signed-URL access via the fixed endpoint `/api/proforma/pdf/[orderId]`, which generates a fresh signed URL on every request and 307-redirects. The link never breaks; the bucket never needs to be public. Authorizes both admin sessions and the order's own customer session.
- **Data API (Supabase REST):** Disabled — no table auto-exposed; all access via Prisma (deliberate security decision).
- **Git workflow:** single `main` branch → Vercel Production directly. No `develop`/staging branch — deliberately decided against given solo capacity; would require a separate dev Supabase project to be genuinely useful, which isn't worth the overhead right now. Testing discipline instead: real E2E tests directly against production, followed by explicit test-data cleanup every time.

### Operational lessons:
- Never manually splice a password into a connection string — always copy the full string from Supabase's "Connect → ORM → Prisma" modal. Manual encoding of special characters (`$`, `%`) has broken URL parsing multiple times.
- Never keep real values in a tracked `.env` file — only `.env.local` (gitignored).
- New Vercel env vars require a manual redeploy.
- File-storage fixes need a genuine "cold" test (2+ minutes later), not an immediate-after-generation check.
- If local dev breaks, get a narrow diagnostic (exact error + git status) before allowing any open-ended "fix it" self-repair — see Section 8.
- **Whenever the Supabase DB password is rotated, both `.env.local` AND Vercel Production env vars must be updated together, followed by a redeploy** — updating only one side breaks the other silently with `P1000` auth errors (happened once, see Section 8).
- **Schema changes for new features can be synced non-destructively via `prisma db push`** when a full migration isn't warranted yet (used for the Section 21 wholesale-product models) — confirm this is acceptable per-case; prefer `prisma migrate dev` once the shape is stable.

---

## 4. Security

- Admin auth: server-side JWT (`jose`, HS256, pinned algorithm), httpOnly signed cookie (`sat_admin_token`), `middleware.ts` protects both `/admin` pages and all `/api/admin/*` routes. No hardcoded fallback secrets — missing env vars throw a hard error. Kök `/admin` middleware'de redirect edilmiyor; sayfa kendi içinde `useEffect` ile `/api/admin/session` çağırıp login formu gösteriyor (nested route'lar ise middleware'de doğrudan redirect ediliyor).
- Customer auth: **magic-link login**, APPROVED-B2B-application-gated (see Section 6). Signed httpOnly cookie (`sat_customer_token`), separate from admin.
- **Standing rules (non-negotiable, apply to every coding session):**
  1. No destructive database command (`--force-reset`, `migrate reset`, `env rm`, `git reset --hard`, etc.) without pasting the exact command and getting explicit "yes, run it" confirmation first.
  2. Secret/credential values are never printed in chat, logs, or reports — only pass/fail confirmations.
  3. Never scrape credentials from IDE session transcript logs as a "recovery" method — always get fresh values from the actual source (Supabase/Vercel dashboards).
- **Supplier/customer privacy boundary (added Section 20, re-verified Section 21):** supplier identity fields (firm name, contact person, email, phone, notes, cost price) must never appear in any customer-facing or public API response (`/wholesale`, `/wholesale/[productId]`, `/wholesale/checkout`, `/portal/orders`). Enforced via explicit Prisma `select` (never rely on frontend omission) and now covered by an automated privacy-assertion test (Section 21) in addition to manual E2E verification.

---

## 5. Admin Panel — Inventory

### ✅ Working
- Corporate Access Key auth, order list + detail, full status lifecycle (incl. SHIPPED/CANCELLED), logo file visibility, proforma PDF (persistent, private bucket), status filter tabs.
- B2B Applications review screen (`/admin/applications`) — list, filter by status, expand full application detail, approve/reject (blocked until email verified — see Section 6), UI UX Pro Max design, accessibility-compliant (visible labels, 44px targets, transient error banners with dismiss + auto-clear).
- Catalog management (`/admin/product-settings`): Category → Subcategory → Product hierarchy view/CRUD (create forms for all 3 levels, duplicate-slug rejection, missing-fabric rejection), Fabric active toggle, Fit assignment matrix, MOQ editor, Size system view.
- **Admin UI redesign (Aug 1, evening — see Section 5a for full detail):** shared sidebar/top-bar chrome separated from the public website; Garment Fits and Catalog & MOQs tabs redesigned to a neutral, Supabase/Linear-style accordion + table pattern.
- **Add Wholesale Product flow (Aug 2, evening — see Section 21):** supplier-linked wholesale product creation, fully E2E-verified in production with zero test residue.

### 🟡 Partial / pending
- Fabric price-range (min/max) editing UI — API supports it, no form exists yet.
- **Regional Size Systems and Product Fabrics & Ranges tabs** — still on the old dense/card-grid visual pattern; not yet redesigned to match Garment Fits / Catalog & MOQs (see Section 5a, next steps).

### ❌ Missing
- Admin KPI/overview dashboard (lands directly on raw order list).
- Multi-admin / per-user identity (single shared key, `reviewedBy` hardcoded to `"admin"`).
- Audit log.
- Order search.
- Multi-fabric-per-order UI (blocks `moqCombinedMultiFabric` enforcement).
- Functional global search (`⌘K` bar is currently a visual placeholder only in the new admin chrome — no filtering logic wired yet).
- Wholesale product edit/delete UI (create flow shipped in Section 21; edit/delete explicitly deferred as a follow-up task).
- Wholesale product bulk CSV import.

---

## 5a. Admin UI Redesign (Aug 1, evening session)

**Motivation:** The admin panel had grown dense and visually inconsistent — every category/subcategory/product expanded at once, heavy borders, colored-fill checkboxes/chips with no visual hierarchy, and the public website's navy header/nav/footer bleeding into admin pages. Goal: a calm, operator-focused tool interface (Supabase Studio / Linear-inspired), fully separated from the customer-facing brand identity — **admin uses its own neutral design tokens, not the site's 0px-corner navy/gold identity.**

### Design tokens (admin-only, do not apply to `/`, `/configure`, `/portal`)
| Role | Value |
|---|---|
| Page background | `#F7F8FA` |
| Sidebar | `#111318` |
| Card/surface | White, `#E4E7EC` / `#EAECF0` border |
| Text primary | `#111318` / `#344054` |
| Text secondary | `#6B7280` |
| Accent (single) | `#2E5AAC` — active nav, primary buttons, focus rings only |
| Success (status only) | `#ECFDF3` bg / `#067647` text |
| Neutral/off status | `#F2F4F7` bg / `#475467` text |
| Border radius | 4–6px (deliberately different from the site's 0px standard — admin is a tool, not the brand) |

### Completed:
1. **Stage 1 — Full inventory before any layout change** (via `feature-inventory-audit` methodology): every `/admin/*` route, nav item, button, and the auth/middleware mechanism traced from actual code before touching anything, specifically to prevent silently dropping functionality during the redesign.
2. **Web-site chrome removed from all `/admin/*` routes** (done independently by the user in Antigravity): navy header/nav/footer, `CookieConsentModal`, and `AIFaqAssistantModal` no longer render on admin pages (pathname-guarded or removed at the source). `B2BSupportDock` was already admin-safe via an existing `usePathname()` guard.
3. **Stage 2 — Shared admin chrome** (`app/admin/layout.tsx`, via Claude Code): dark (`#111318`) vertical icon sidebar (Order Ledger / B2B Applications / Product Settings, active-route highlight) + top bar (breadcrumb, visual-only search placeholder, single centralized Sign Out). New `components/admin/AdminAuthContext.tsx` centralizes session state (previously each of the 3 admin pages polled `/api/admin/session` independently). Duplicated per-page top bars/module-nav rows removed; each page's own Refresh button and fetch logic were deliberately left untouched (lower-risk option), only Sign Out + nav were centralized.
4. **Garment Fits tab redesign**: replaced the old card-grid (which had incorrectly mapped fit *dimensions* — chest/waist/neck measurements — instead of fit *values*) with an accordion Category→Subcategory→Product tree + a right slide-over panel showing the correct 8 `Fit` enum values (Slim, Regular, Relaxed, Tailored, Skinny, Tapered, Modern, Oversized), neutral-gray checkboxes (no blue fill), and a "Linked Fits" status badge (neutral/amber/red by completeness). Backend (`Fit`/`ProductFit` schema, `PATCH /api/admin/catalog`) untouched — presentation-layer only.
5. **Catalog & Two-Tier MOQs tab redesign**: same accordion pattern applied — Category and Subcategory rows collapsed by default (`openCategoryIds`/`openSubcategoryIds` state), all 7 categories now fit on one screen. Fit chips in the product table changed from blue-filled to neutral gray. Active/Off status badge: Active stays green (consistent with the Garment Fits success palette), Off changed from red to neutral gray (inactive isn't an error state). Card borders thinned to `#EAECF0`, row padding reduced. MOQ numbers de-emphasized from blue to neutral dark text — blue now reserved for the "Edit MOQs" link and active nav/tab state only. Add Category/Subcategory/Product buttons and the inline "Edit MOQs" form were functionally untouched.

### Verification performed:
- `npm test`: 98/98 passing after both tab redesigns.
- ESLint: no new errors introduced (pre-existing warnings confirmed identical on `main` via `git stash` comparison).
- Manual browser walkthroughs (via Claude Code + `claude-in-chrome`) for both redesigns: navigated all 3 admin routes, expanded/collapsed categories, opened/closed Edit MOQs and Add Category, tested Sign Out from the centralized button, and re-verified with the user's own live session (not a copied one).
- Auth/middleware behavior reconfirmed unchanged: unauthenticated nested `/admin/*` routes still 307-redirect to `/admin`; root `/admin` login gate still works via client-side session check.

---

## 6. B2B Customer Portal — Full Chain (Completed)

Real chain, end-to-end verified on production with genuine emails:

1. **Application submission** (`/portal`, 3-step form) → creates `B2bApplication` (status `SUBMITTED`).
2. **Email verification** — a verification email is sent (`EmailVerificationToken`, 24h expiry, single-use); clicking it transitions status to `UNDER_REVIEW` and sets `emailVerifiedAt`. **Admin cannot approve/reject an application before this** (server-side enforced, `400` if attempted).
3. **Admin review** (`/admin/applications`) — approve or reject.
4. **Magic-link login** (`/portal`) — customer requests a login link; only sent if a matching `B2bApplication.status === APPROVED` exists. **Identical API response** regardless of approved/pending/rejected/unknown email (prevents enumeration). 15-min token expiry, single-use, rate-limited (3 requests/15min).
5. **Order history** (`/portal/orders`) — protected by customer session cookie, lists the company's orders with status, prices, and proforma PDF download (customer-authorized extension of the admin PDF endpoint).

**Not yet built:** global header logged-in state (account icon + dropdown replacing the "CLIENT PORTAL" button; Orders/Invoices/Settings/Sign Out menu) and a more polished, e-commerce-style order history redesign — a build prompt was prepared but not yet executed.

**Email delivery:** configured via Resend (test mode) — currently can only send to the Resend account's own registered email. Domain verification deferred; needed before real customer emails can receive messages.

---

## 6a. UI/UX & Feature Additions (Aug 1, afternoon session)

Built and confirmed as permanent, intended additions to the site (not scope drift — explicitly approved):

- **Legal pages redesign** — all 5 core pages (Terms, Privacy, Supply Terms, Security, Cookies) redesigned with sharp B2B styling; added `CookieConsentModal.tsx` with a footer-accessible preferences button.
- **`/categories` search & filter** — `CategoriesSearchFilter.tsx`: real-time text search, department filters, active product counts, grid view modes.
- **New `/wholesale` catalog page** — `WholesaleCatalogClient.tsx`: left-hand filter drawer (category, fabric line, lead time, MOQ threshold, price range sliders), right-hand product grid (fabric lines, MOQ counts, price ranges, direct product links).
- **Brand mark geometry standard** — enforced 0px sharp rectangular geometry (`rounded-none`) across header nav, product cards, configurator inputs, buttons, and modals, to match the gold brand mark. **Note:** this 0px standard applies to the public website only — the admin panel deliberately uses 4–6px radius as its own tool identity (see Section 5a).
- **Certification claims audit** — removed unverified `ISO & OEKO-TEX Certified` / `ISO 9001` claims sitewide; replaced with factual terms (`European Quality Standard`, `GDPR Compliant`, `Sustainable Material Sourcing`).
- **24/7 B2B Support Dock** (`B2BSupportDock.tsx`) — collapsible left-edge tab, minimized by default (`B2B SUPPORT ▸`). Two panels: direct-contact channels (WhatsApp, Telegram, Signal, corporate email) and an **`AIFaqAssistantModal.tsx`** — this is a scripted/rule-based FAQ assistant (MOQs, lead times, proformas, sizing, vector logo specs), **not** a paid AI API call — confirmed no ongoing cost. Both this and `CookieConsentModal` were later pathname-guarded out of `/admin/*` (see Section 5a).
- **Configurator redesign** (`ConfiguratorClient.tsx` + `PriceSidebar.tsx`) — executive header shell with live MOQ status badge, 4-step progress stepper (Fabric Line → Fit & Sizing → Vector Logo → Proforma Review), redesigned price/MOQ sidebar with a clean progress bar replacing the earlier cramped text version.

Verified: 98/98 tests passing, clean local build, 100% English across UI text/comments/docs.

---

## 7. Deferred / Explicitly Rejected Scope

- **Multi-language (5 languages):** considered, explicitly deferred. Single-language English remains the MVP decision. Revisit only as a deliberate, large scope item — not incrementally.
- **Stripe live account migration:** deliberately deferred until UI/UX and customer feedback have matured.
- **`develop` git branch / separate dev Supabase project:** considered, decided against (see Section 3).
- **Discount tiers / stock-count display** (from a competitor reference): rejected — doesn't fit the Made-to-Order + price-range model; not applicable.
- **Wholesale product edit/delete UI, bulk CSV import:** deferred as explicit follow-ups to the Section 21 create flow — not scope drift, just sequenced after.

---

## 8. Incident Log

**Aug 1 — Local dev environment recovery.** While Antigravity/Gemini quota was exhausted, work continued via Cline + a local LM Studio model. This caused imprecise full-file rewrites and a stale `.env.local` DATABASE_URL. A follow-up Antigravity session then went off-task, spending 140+ commands on a self-repair spiral (regex-escaping `.env.local`, scraping a stale password from IDE session transcript logs, making unrequested changes to `lib/prisma.ts`). Recovered via `git reset --hard origin/main` + `git clean -fd`, a fresh Supabase password reset, and rebuilding `.env.local` from Supabase's own connection modal. Verified via `npm test` (98/98 passing) and `npm run dev`.

**Lesson:** prefer waiting for Antigravity quota reset (or using Claude Code) over local-model coding agents for this codebase's complexity — cleanup cost exceeded time saved. When local dev breaks, require a narrow diagnostic report before allowing any multi-step self-repair.

**Aug 1 — Production down after local Supabase password reset.** During the local recovery above, the Supabase database password was reset and `.env.local` was rebuilt with the new credentials — but the same new credentials were never propagated to Vercel's Production environment variables. Production (`satriano.vercel.app`) returned `500` / `PrismaClientKnownRequestError: P1000 Authentication failed` for several hours until `DATABASE_URL`/`DIRECT_URL` were manually updated in Vercel to match `.env.local`, followed by a redeploy.

**Lesson:** whenever the Supabase database password is rotated for any reason (security incident, forgotten password, local recovery), **both** `.env.local` *and* Vercel's Production environment variables must be updated together, followed by a Vercel redeploy — updating only one side silently breaks the other environment.

**Aug 1, evening — Antigravity quota exhausted mid-task, handed off to Claude Code.** During the admin UI redesign work, Antigravity's 5-hour + weekly model quota (Claude/GPT group) hit 100% mid-session. Per the standing rule (Claude Code is the approved fallback), the in-progress task (admin layout Stage 1 inventory, then Stage 2 chrome build) was handed to Claude Code in the terminal with a full context-carryover prompt (standing security rules, prior task state, exact scope) so no re-discovery work was lost. Claude Code completed both the inventory and the chrome build successfully, including live browser verification via `claude-in-chrome`.

**Lesson:** the Antigravity→Claude Code handoff works well when the handoff prompt explicitly restates standing rules and prior findings rather than assuming Claude Code will infer them.

**Aug 1-2 — Complete Admin Console Swiss Redesign, Regional Sizing, Fabric Tiering & Live Command Palette.**
Completed a comprehensive redesign of the entire admin console using Swiss Design principles (1px flat borders `#D0D5DD`, neutral-gray backgrounds `#F9FAFB`, `#2E5AAC` primary accent buttons, zero heavy drop shadows).
- **Garment Fits & Catalog Tabs (`ProductFitTree.tsx` & `GarmentFitsPanel.tsx`):** Replaced card grid with Category → Subcategory accordion tree, color-coded linked fit badges (`8/8` Gray, `1-7/8` Orange, `0/8` Red), and a 44px min touch target slide-over drawer with 8 custom neutral checkboxes.
- **Regional Size Systems Tab (`RegionalSizeTree.tsx` & `RegionalSizePanel.tsx`):** Transformed 3-column card grid into an industrial table layout with CAD size option badges (`Alpha`, `Waist`, `Chest`), assigned subcategories, and a slide-over drawer for M:N `SubcategorySizeSystem` mapping.
- **Product Fabrics & Ranges Tab (`FabricPricingTree.tsx` & `FabricPricingPanel.tsx`):** Replaced static fabric text list with an interactive pricing tiering table featuring currency input conversion ($ to integer cents), setup fee inputs, active status toggles, and unsaved changes confirmation modals.
- **Catalog Image Upload (`CatalogImageUploader.tsx` & `/api/admin/catalog/upload`):** Implemented pre-flight client/server 2MB asset validation restricted to `.jpg`, `.png`, and `.webp`, uploading directly to Supabase Storage bucket `'catalog-assets'`.
- **Global Command Palette (`cmdk` & `GlobalCommandPalette.tsx`):** Built a universal `⌘K` / `Ctrl+K` command palette integrated into `AdminSidebar.tsx` featuring real-time live indexing of products, categories, subcategories, B2B companies, and order IDs.
- **Database Connection Pool Fix (`lib/prisma.ts` & `.env.local`):** Migrated `DATABASE_URL` to Supabase Transaction Mode Pooler port `:6543` and cached `PrismaPg` adapter on `globalThis` to eliminate `EMAXCONNSESSION` pool exhaustion.
- **Test Suite Verification:** 100% test pass rate across all 17 Vitest test suites and 98 unit tests.

---

## 9. Remaining Priority Order

1. **[COMPLETED] Commit + push admin redesign work** (chrome separation, Catalog & MOQs, Garment Fits, Regional Size Systems, Fabric Tiering, and Live Command Palette) to `main`.
2. **[COMPLETED] Redesign Regional Size Systems tab** (neutral accordion + slide-over drawer).
3. **[COMPLETED] Redesign Product Fabrics & Ranges tab** (neutral pricing table + slide-over drawer).
4. **[COMPLETED] Photo/image upload field for catalog Add/Edit forms** (`CatalogImageUploader.tsx`).
5. **[COMPLETED] Fabric price-range & setup fee editing UI** (`FabricPricingPanel.tsx`).
6. **[COMPLETED] Wire the admin `⌘K` search bar to real filtering** (`GlobalCommandPalette.tsx` with live database indexing).
7. **[COMPLETED] Add Wholesale Product flow** (supplier-linked create, API, E2E-verified — Section 21).
8. Admin KPI dashboard & analytics widget — deeper drill-downs beyond the current top-level metrics.
9. Customer Portal header logged-in state + polished order history redesign.
10. Configurator Part D (multi-photo gallery) — scope decision pending.
11. Multi-fabric-per-order feature (unblocks `moqCombinedMultiFabric`).
12. Wholesale product edit/delete UI + bulk CSV import.
13. Stripe live account migration — deferred.
14. Codebase health audit — re-run periodically after major feature drops.

---

## 10. Standing Tools (Skills)

- `codebase-health-audit` — dead code / over-engineering audit. Use after major schema/architecture changes.
- `feature-inventory-audit` — full, code-verified inventory of a feature area (catches drift between "reported done" and actual state). Used today before the admin layout change specifically to avoid dropping functionality during the chrome separation.
- `ui-bug-triage-from-screenshot` — classify a screenshot bug report (real code bug / test data noise / browser artifact / needs more detail) before writing any fix prompt.

---

## 11. General Lesson

Several times, something was reported as "done" but wasn't (category count, admin key mechanism, whether pricing was really implemented, the "cold test" false positive, the "29 pre-existing DB failures" that turned out to be a real bug, and today: a "done" header-removal claim that turned out to be accurate but unverified by screenshot at the time it was reported). **"Done" status should be periodically re-verified with `feature-inventory-audit`, and any UI change claim should be confirmed with an actual screenshot before being marked closed** — a report can be accurate at the time and still be unconfirmed, or be wrong from the start. This project's working pattern going forward: every visual/UI change gets a screenshot checkpoint before being considered done, regardless of which agent (Antigravity, Claude Code, or a local model) produced it. The Section 21 wholesale-product work followed this discipline end to end: unit tests, a full 9-assertion production E2E pass, and an explicit zero-residue cleanup check, not just a "looks done" claim.

---

## 12. AI Agentic Skills & Autonomous Infrastructure (Added Aug 1)

- **Agent Skill Integration:** Deployed a comprehensive `.agents/skills` directory to automate repetitive development and auditing tasks.
- **Database & Compute Automation:** Configured dedicated agent workflows for Prisma CLI operations, Prisma Client API generation, Postgres/MongoDB setups, and Driver Adapter implementations.
- **UI/UX & Design System Engine:** Automated styling pipelines including Tailwind config generation, Shadcn component accessibility checks, and dynamic HTML/slide template generation.
- **Typography & Brand Enforcement:** Integrated an extensive canvas font library (Bricolage Grotesque, Crimson Pro, IBM Plex, Jura, Outfit, Tektur, Work Sans, etc.) alongside automated scripts for logo validation, color palette extraction, and brand guideline consistency checking.
- **Continuous Auditing:** Activated `codebase-health-audit` and `feature-inventory-audit` to maintain strict architectural hygiene as the platform scales.

---

## 13. System Health Check & Codebase Röntgen Snapshot (Aug 2, 2026)

| Area / Component | Status | Empirical Evidence / Verification | Recommendation |
|---|---|---|---|
| **Vitest Test Suite** | 100% Healthy | 28/28 test files, 136/136 unit tests passing cleanly | Keep test coverage high for new endpoints |
| **Prisma Connection Pooling** | 100% Healthy | Port `:6543` Transaction Pooler + cached `PrismaPg` on `globalThis` | Prevent pool exhaustion in serverless |
| **Admin Layout Isolation** | 100% Healthy | `B2BSupportDock.tsx` returns `null` on `/admin/*`; consumer header/footer stripped | Maintain separate admin layout boundaries |
| **Catalog CRUD & Image Upload** | 100% Healthy | Supabase `'catalog-assets'` bucket upload with strict 2MB validation | Fully verified & operational |
| **Global Command Palette** | 100% Healthy | `cmdk` dialog listening to `Cmd+K`, live product & order indexing | Expand indexed entities as new models drop |
| **Wholesale Product Privacy Boundary** | 100% Healthy | Automated test + live E2E assertion confirm zero supplier fields in public payloads (Section 21) | Re-check this specific assertion after any future wholesale schema change |

---

## 14. Admin Navigation & Workspace Layout Refactoring (Aug 2, 2026)

- **Collapsible Executive Navigation Sidebar (`AdminChrome`)**:
  - Implemented expandable/collapsible sidebar with toggle control (`chevron_left` / `chevron_right`) supporting compact 64px icon mode and expanded 256px drawer mode.
  - Removed top Satriano logo from admin sidebar navigation per brand customization directive.
- **Top Header Bar & Page Title Removal**:
  - Removed top white header bar (`Admin Console / [Page Name]`) and top page title banners across all admin pages (`/admin`, `/admin/applications`, `/admin/product-settings`, `/admin/architecture-viz`).
  - Relocated page action triggers (`3D Anti-Gravity Viz`, `Refresh Ledger`, `Refresh Applications`, `Back to Order Ledger`) directly into category/status filter bars.
  - Integrated Global Search trigger (`⌘K`) and Sign Out button cleanly into the bottom sidebar footer.
- **Accordion Sub-Menu Navigation & Deep-Linking**:
  - Refactored sidebar sub-item list to an accordion pattern where sub-items expand only for the active section (or user-toggled section), keeping inactive section menus collapsed.
  - Mapped all sub-items to functional page filter query parameters (`?status=ALL`, `?status=SUBMITTED`, `?tab=fits`, etc.) with `useSearchParams` and `Suspense` synchronization across page components.

---

## 15. Executive Admin KPI Dashboard & Client Portal Isolation (Aug 2, 2026)

- **Production-Ready Admin KPI Dashboard & Recharts Integration (`Roadmap Step 9.7`)**:
  - Built real-time operational telemetry widget (`DashboardMetrics.tsx` & `AdminKpiDashboard.tsx`), helper module (`lib/adminMetrics.ts`), and API handler (`/api/admin/metrics`).
  - Concurrent Prisma metrics aggregation: 30-Day Paid Revenue sum (`PAID`/`SHIPPED` in last 30 days), Active Factory Orders (`IN_PRODUCTION`), Pending Proforma Quotes (`PENDING_REVIEW`), and Pending B2B Applications (`UNDER_REVIEW`/`SUBMITTED`).
  - Minimalist Recharts Bar Chart widget displaying live "Orders by Status" distribution across all 8 lifecycle stages with client-side hydration safety.
  - Enforced strict Swiss Design tokens (`#F7F8FA` background, white flat cards, 1px `#EAECF0` borders, `rounded-md` 4-6px, `#2E5AAC` accent, zero drop shadows).
  - Enforced `tabular-nums font-mono` formatting across all numeric counters and monetary figures.
  - Dense scannable table displaying the 5 most recent pending actions requiring executive review with direct action links.
- **Client Portal Header Cleanup & Layout Isolation**:
  - Completely removed top `PortalHeader` component from customer portal layout (`app/portal/layout.tsx`) for an isolated, distraction-free corporate login gate flow.
- **Prisma PostgreSQL Connection Pooling & Error Propagation**:
  - Configured `lib/prisma.ts` with explicit `pg.Pool` initialization for `@prisma/adapter-pg` driver adapter, ensuring stable connection pooling to Supabase Transaction Mode Pooler port `:6543`.
  - Propagated detailed route error messages in `/api/admin/metrics` and `/api/admin/orders`.
- **Vitest Unit Test Suite Expansion**:
  - Added unit test suites (`lib/adminMetrics.test.ts`, `components/admin/DashboardMetrics.test.tsx`). Verified 100% pass rate across 19 test files and 102 unit tests.

---

## 16. B2B Customer Portal UI & Executive Dashboard Redesign (Aug 2, 2026)

- **Stitch Brief B2B Customer Header (`PortalHeader.tsx` & `AccountDropdown.tsx`)**:
  - Built 64px sticky top header (`#0B1E3D` dark navy) with gold logo mark ("S") and brand title.
  - Active route navigation links (`Catalog`, `Orders`, `Account`) with 2px `#2E5AAC` underline highlights.
  - AccountDropdown menu (`#132A52` surface, 0px geometry, displaying Company Info, Order History, Settings, Billing & Invoices, Support, and `#F0B94A` warning text Sign Out button).
  - Dedicated outline Sign Out button and `/api/customer/session` endpoint.
- **Customer Portal Executive Dashboard (`PortalDashboard.tsx`)**:
  - Built `CompanyInfoCard`: 4px blue left border (`#2E5AAC`), `#132A52` surface, green approved badge (`#5DCAA5`/`#14301F`), display of company name, email, partner status, and creation timestamp.
  - Built `QuickActionButtons`: 2x2 grid panel with primary CTA (`Create New Order` → `/konfigurator`) and 3 outline secondary CTAs (`View All Orders`, `Account Settings`, `Contact Support`).
  - Built `RecentOrdersTable`: Displays 5 most recent orders with alternating `#0B1E3D` / `#132A52` rows, 1px `#2E5AAC` borders, color-coded badges (`#F0B94A` Warning, `#85B7EB` Info, `#5DCAA5` Success), `tabular-nums` formatting, and direct `Review →` / `Download →` proforma PDF links.
  - Built `Helpful Resources` quick links section for MOQs, lead times, payment methods, and support.
- **Vitest Unit Test Expansion**:
  - Created unit test suites (`components/portal/PortalHeader.test.tsx`, `components/portal/PortalDashboard.test.tsx`). Verified 100% pass rate across 21 test files and 108 unit tests.

---

## 17. B2B Customer Portal Account Settings & Support Hub (Aug 2, 2026)

- **Account Settings Hub (`/portal/account`)**:
  - Created `TabNavigation` component with URL query parameter sync (`?tab=company|settings|billing`).
  - Created `CompanyInfoTab` displaying corporate account details, account ID, activation date, and green approval badge (`✓ APPROVED B2B PARTNER`).
  - Created `SettingsTab` with interactive toggles (Email Notifications, Proforma Auto-Download), dropdowns (Currency, Language), password change button, and account deletion warning.
  - Created `BillingTab` with corporate billing address editor and recent invoices table with PDF download links.
- **Customer Support Hub (`/portal/support`)**:
  - Created `ContactChannels` component with direct links for WhatsApp (`https://wa.me/...`), Telegram (`https://t.me/SatrianoAtelier`), Email with 1-click clipboard copy (`support@satriano.com`), and Signal Private Desk.
  - Created `SupportForm` component submitting tickets to `POST /api/customer/support-ticket` with subject, message, and file upload fields.
  - Created `FaqLinks` component with quick links to MOQs, configurator guidelines, payment terms, and delivery SLAs.
- **Header & Dropdown Navigation Alignment**:
  - Verified `AccountDropdown` menu routes (`/portal/account?tab=company`, `/portal/orders`, `/portal/account?tab=settings`, `/portal/account?tab=billing`, `/portal/support`).
  - Removed duplicate standalone Sign Out button from `PortalHeader`.
- **Vitest Unit Test Expansion**:
  - Added unit test suites (`components/portal/account/AccountPage.test.tsx`, `components/portal/support/SupportPage.test.tsx`). Verified 100% pass rate across 24 test files and 117 unit tests.

---

## 18. Catalog Image Upload, Email Infrastructure & Production Hardening (Jul 31 – Aug 2, 2026)

### Catalog Image Upload Feature
- **New upload API endpoint** (`/api/admin/catalog/upload`): admin-authenticated, dedicated to catalog images. Validates file type (JPG/PNG/WebP only) and size (5 MB max). Uploads to the new `catalog-images` Supabase Storage bucket (public). Returns the public URL for storage in the record's `imageUrl` field.
- **Reusable `CatalogImageUploader` component** (`components/admin/CatalogImageUploader.tsx`): click-to-upload with instant local preview, replace/clear controls, client-side type+size validation, uploading progress state, and error display. Matches the admin panel's neutral design tokens.
- **Image upload integrated into all three "Add New" modals** (Category, Subcategory, Product) in `/admin/product-settings` — image URL is included in the POST body on creation.
- **Image URL support added to PATCH handlers** — categories, subcategories, and products can all have their `imageUrl` updated via the existing PATCH endpoint. Categories also gained PATCH support for `name` and `description` (previously only subcategory and product had full PATCH support).
- **Customer-facing rendering confirmed**: both `/categories` and `/categories/[categoryId]` already render `imageUrl` via `<img>` tags with fallback to default placeholder images.

### Email Infrastructure (Resend Integration)
- **Diagnosed email delivery failure**: confirmed that `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` were missing from Vercel Production environment — the app was falling back to console-mock logging, meaning no real emails had ever been sent from production.
- **Added all email environment variables to Vercel Production**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM`, and `RESEND_API_KEY`.
- **Resend configured in test mode** — can send to the registered account email only. Domain verification required before sending to arbitrary customer emails.

### Production Data Cleanup
- **Comprehensive test-data audit**: searched production database for any records where company name or email contains "E2E", "Test", "test-", "e2e-", "prod-e2e-", "fullchain-e2e-", "order-render-", "cold storage test", "render proof", "acme" (case-insensitive) across Order, Company, B2bApplication, MagicLinkToken, EmailVerificationToken, and Proforma tables.
- **Deleted all leftover test records** in correct foreign-key order (OrderLine → LogoAsset → Order → Proforma → MagicLinkToken → EmailVerificationToken → B2bApplication → Company).
- **Re-ran search to confirm zero matches** remain.

### B2B Application UI Fixes
- **Approve/Reject buttons disabled for unverified emails**: in the expanded application detail drawer, "Approve Application" and "Reject Application" buttons are now disabled (grayed out, with tooltip explaining why) when `emailVerifiedAt` is null — matching the compact row's already-disabled Approve button.
- **Transient error banner**: the red error banner ("Cannot approve or reject an application before the applicant's email address has been verified.") is now transient and contextual — tied to a specific failed action attempt, auto-clears after 5 seconds or on next interaction. No longer a permanent page-level fixture.

### Application Confirmation Page Copy
- Updated `/portal` post-submission confirmation screen to accurately reflect the email verification step: badge now reads "APPLICATION RECEIVED • VERIFY YOUR EMAIL" instead of implying review has started; body copy explains the verification email was sent and clicking the link is required before the application enters review.

### Catalog CRUD Live E2E Testing
- **Full production E2E test** (8 assertions): admin auth + cookie, create Category/Subcategory/Product, duplicate slug rejection (×3), missing fabric rejection, verify rendering on `/categories`, full cleanup. All 8 tests passed cleanly with zero test residue.

### Verification
- `tsc --noEmit`: clean, zero errors.
- Production deployment via `npx vercel --prod`: build succeeded (33 pages, all routes listed including `/api/admin/catalog/upload`).
- Live E2E catalog test: all 8 assertions passed.

---

## 19. Ready-Made Stock Wholesale Catalog, Customer Portal & Admin Dashboard (Aug 2, 2026)

- **Ready-Made Stock Wholesale Catalog (`/wholesale`)**:
  - Built `WholesaleCatalogClient.tsx`: Sticky left filter drawer (Category, Fabric Line, Price Range $10–$500 slider, In Stock Only toggle), responsive 4-column desktop product grid (`280px × 380px`, white background, `1px solid #E0E0E0`, `0px` radius, `$125.00` price font-mono tabular-nums, `✓ In Stock` / `⚠ Low Stock` / `Out of Stock` badges, 40px `"VIEW & ORDER"` button), and responsive pagination.
- **Wholesale Product Detail (`/wholesale/[productId]`)**:
  - 2-column layout (Main image + 4-thumbnail grid, SKU `CY-1306-11`, Name `Shawl Lapel Slim Fit Blazer Men Prom Blazer - Wessi`, Fixed price `$125.00`, `✓ IN STOCK` status).
  - 9-size stock matrix (`36`-`52`) with `+`/`-` steppers, `Qty: N`, `N in st` indicators. Open Pack & Pre-Pack bundle options (1 Pack 5 units, 2 Packs 10 units, All Available).
  - Price Negotiation offer input for bulk orders ($\ge 10$ units). `[ADD TO CART]` button saving breakdown to `localStorage` wholesale cart.
- **Wholesale Cart Checkout (`/wholesale/checkout`)**:
  - Review table with size breakdown formatting (`36(3) 38(5) 40(1) 44(3)`), subtotal, negotiated offer discount line (`✓ $100/unit -$300.00`), total. Terms & Invoice checkboxes, B2B payment methods (Credit Card, Bank Transfer SWIFT, B2B Net-30 Terms), `[PROCEED TO PAYMENT]` submission and order persistence in localStorage / customer portal history.
- **Customer Portal Wholesale Orders (`/portal/orders`)**:
  - Order type filter tabs: `[ALL ORDERS]`, `[M2O ORDERS]`, `[WHOLESALE ORDERS]`.
  - Wholesale table view with `Order ID` (`#WH001`), `Date`, `Units`, `Total`, `Status`.
  - **Wholesale Order Detail Modal**: Displays stock breakdown by size (`36(3) 38(5) 40(1) 44(3)`), unit price (offered `$100.00/unit` vs list `$125.00/unit`), bulk discount percentage (`20% Bulk Discount Applied (-$300.00)`), and delivery estimate (`Immediate Dispatch (3–5 Business Days)`).
- **Admin Wholesale Management Dashboard (`/admin/wholesale`)**:
  - Executive sidebar layout integration with sub-items (Pricing Manager, Inventory by Size, Price Offer Inbox, Wholesale Orders).
  - **Pricing Manager**: `PRODUCT PRICING TIER` table with M2O price ranges, wholesale fixed prices, stock counts, inline price input, and real-time save.
  - **Inventory by Size/Color**: Product variant selector, granular size stock matrix (`Size 36` to `48`), and `[Edit Stock Levels]` inline editor.
  - **Price Offer Inbox**: `PENDING PRICE OFFERS` table displaying bulk buyer offers with `[Accept]`, `[Reject]`, and `[Counter Offer: $X/unit]` actions.
  - **Wholesale Order Status**: `RECENT WHOLESALE ORDERS` table with status dropdown selector (`Pending Review`, `Approved`, `In Fulfillment`, `Shipped`, `Cancelled`).
- **Offline Database Fault Tolerance & Codebase Health Audit**:
  - Wrapped server components (`app/wholesale/page.tsx`, `app/admin/wholesale/page.tsx`, `app/wholesale/[productId]/page.tsx`) in `try / catch` blocks to handle database connectivity/pooler offline states gracefully without crashing server pages.
  - Executed `codebase-health-audit`: removed dead component `components/StatusStepper.tsx` and 3 legacy re-export shims (`components/portal/CompanyInfoCard.tsx`, `components/portal/QuickActionButtons.tsx`, `components/portal/RecentOrdersTable.tsx`).
- **Vitest Unit Test Suite Verification**:
  - Updated test assertions in `components/portal/orders/OrdersPage.test.tsx`. Verified 100% pass rate across 27 test files and 132 unit tests.

---

## 20. Multi-Supplier Wholesale Marketplace & Privacy Architecture (Aug 2, 2026)

- **Marketplace Model & Privacy Boundaries**:
  - Transitioned from direct brand wholesale to a **Multi-Supplier Marketplace model** aggregating ready-made products from independent manufacturing partners.
  - Enforced strict customer privacy boundaries: Supplier firm names, contact persons, emails, phone numbers, and notes are accessible to **Admin only** (`/admin/wholesale/suppliers`, `/admin/wholesale/inventory`, `/admin/wholesale?tab=offers`).
  - Public catalog (`/wholesale`), checkout (`/wholesale/checkout`), and customer portal (`/portal/orders`) keep supplier identities completely anonymous to buyers.
- **Supplier Management Dashboard (`/admin/wholesale/suppliers`)**:
  - Built `SupplierClient.tsx`, `SuppliersTable.tsx`, `AddSupplierModal.tsx`, `EditSupplierModal.tsx`, and `SupplierDetailModal.tsx`.
  - Full admin CRUD for supplier records with search, status filters (`ALL`, `ACTIVE`, `PENDING_VERIFICATION`), verification triggers, and deactivation toggles.
- **Inventory by Category (`/admin/wholesale/inventory`)**:
  - Built `CategoryInventoryClient.tsx`, `CategoryFilter.tsx`, `ProductGrid.tsx`, `ProductCard.tsx`, and `ProductDetailModal.tsx`.
  - Aggregate product inventory organized by category showing product counts, supplier counts, wholesale cost price, calculated markup ($ and %), customer sell price, and size/stock matrices.
- **Product Image Management (`ProductImageUploader.tsx`)**:
  - Built 4+ photo uploader section supporting file drag & drop, order sequencing (`←`, `→`), deletion, and pre-flight client-side type/size validation (2MB–5MB, JPG/PNG/WebP).
- **Price Offer Inbox (Multi-Supplier Bidirectional Negotiation)**:
  - Updated `PriceOfferInboxTab.tsx` with multi-supplier negotiation statuses (`PENDING_ADMIN`, `PENDING_SUPPLIER`, `ACCEPTED`, `REJECTED`, `COUNTER_OFFERED`).
  - Integrated Admin-only supplier contact card, internal admin notes editor, and counter-offer dialog with custom supplier messages.
- **Executive Admin Sidebar Navigation Integration (`app/admin/layout.tsx`)**:
  - Added direct sub-navigation entries under `Wholesale Manager`: `Supplier Management` (`/admin/wholesale/suppliers`), `Inventory by Category` (`/admin/wholesale/inventory`), `Pricing Manager`, `Inventory by Size`, `Price Offer Inbox`, and `Wholesale Orders`.
- **Vitest Unit Test Suite Verification**:
  - Verified 100% pass rate across 27 test files and 132 unit tests.

---

## 21. Add Wholesale Product Flow — Build & Production E2E Verification (Aug 2, 2026, evening)

**Gap closed:** Section 20 shipped Supplier Management CRUD and read-side Inventory by Category, but there was no flow for admin to actually *create* a new ready-made wholesale product and attach it to a supplier. This section closes that gap, built and verified in one session (commits `782f0e9`, `f1d980c`, pushed to `main`).

### Data model
- Added `WholesaleProduct`, `WholesaleProductImage`, `WholesaleStock`, `Supplier` (with `SupplierStatus`), and `WholesaleProductStatus` (`ACTIVE`/`INACTIVE`) models/enums to `prisma/schema.prisma`.
- Synced to Supabase PostgreSQL via `prisma db push` (non-destructive; a full `prisma migrate dev` is a follow-up once the shape is considered stable).
- **Privacy rule enforced at the query layer**: public customer queries (`/wholesale`, `/wholesale/[productId]`, `/wholesale/checkout`, `/portal/orders`) use explicit Prisma `select` statements that strictly omit `supplier`/`supplierId`. Only `/admin/wholesale/*` routes `include` supplier detail.

### Admin UI — `AddWholesaleProductModal.tsx`
- Mounted at two entry points: `/admin/wholesale/inventory` (`+ Add Wholesale Product` header CTA) and `/admin/wholesale/suppliers` → `SupplierDetailModal.tsx` (`+ ADD PRODUCT`, pre-fills `supplierId`).
- Supplier dropdown restricted to `ACTIVE` suppliers (`PENDING_VERIFICATION` greyed out). Category dropdown wired to the existing category hierarchy. SKU duplicate-rejected server-side (`409`). Images via the existing `ProductImageUploader.tsx` (drag & drop, reorder, 2–5MB JPG/PNG/WebP validation, unchanged). Cost price + markup % → live-computed sell price with an override toggle and a hard second-confirmation step if the override goes negative-margin. Size/stock matrix (steppers, sizes 36–50, default `lowStockThreshold = 3`). Active/Inactive status toggle. Swiss Design tokens matched (`#F7F8FA` bg, white card, `1px #EAECF0` border, `rounded-md`, `#2E5AAC` accent, `tabular-nums font-mono`).

### API — `/api/admin/wholesale/products` (admin-JWT protected)
- `POST` — create product + nested images + stock rows in one `prisma.$transaction`.
- `GET` (list, filters: `supplierId`, `categoryId`, `status`) and `GET /[id]` (full detail incl. supplier, admin only).
- `PATCH /[id]` — field/status updates.
- `POST /[id]/images` and `DELETE /[id]/images/[imageId]`.

### Unit tests
- `products.test.ts` covers create validation, duplicate SKU, negative margin warning, empty-stock rejection, and an explicit privacy assertion (`expect(publicDTO).not.toHaveProperty("supplier")`).
- Full suite: **28 test files, 136/136 unit tests passing.**

### Production E2E verification (9/9 assertions passed, zero residue)
Run directly against `satriano.vercel.app`, `E2E-WHOLESALE-` marker prefix used throughout for traceability and cleanup:

1. Happy-path create — `201`, minimal response shape (no supplier contact fields even for the admin caller).
2. Duplicate SKU — `409` (Prisma `P2002`).
3. Empty stock array — `400`.
4. `PENDING_VERIFICATION` supplier attach attempt — `400`.
5. Negative-margin override — UI blocks submit until an explicit second confirmation click.
6. Created product visible via `GET /api/admin/wholesale/products?status=ACTIVE` and in `/admin/wholesale/inventory` (full supplier detail, as expected for admin).
7. **Public catalog privacy boundary — explicitly confirmed**: the public payload for the same product contains zero `supplier`, `supplierId`, `firmName`, `contactPerson`, or `costPriceCents` keys. Treated as the single most important assertion in this set.
8. Setting `status: "INACTIVE"` removes the product from public `/wholesale` while it stays fully visible in admin inventory.
9. Image add/remove — `sortOrder` stays gap-free after deletion (verified `[1, 2]` sequencing).

**Cleanup:** all test records deleted in FK-safe order (`WholesaleStock` → `WholesaleProductImage` → `WholesaleProduct` → test `Supplier`/`Category`). Re-search for the `E2E-WHOLESALE-` marker across all four tables confirmed **zero residue** (`productResidueCount: 0`, `supplierResidueCount: 0`).

---

## 22. AddWholesaleProductModal Layout Refactoring & Compact 2-Tab Design (Aug 2, 2026)

- **2-Tab Navigation Architecture**:
  - Divided `AddWholesaleProductModal.tsx` into 2 tabs: **Basic Info** (Supplier, Category, Product Name, SKU, Description, Product Images) and **Pricing & Stock** (Wholesale Cost, Markup %, Computed Sell Price, Size/Stock Matrix, Status Toggle).
  - Built tab navigation with Swiss Design tokens (`#2E5AAC` active underline & text, `#6B7280` text with `#F7F8FA` background).
  - Validation auto-tab switching: Attempting submit with missing/invalid fields on an inactive tab automatically switches to that tab and highlights the error.
- **Compact Product Image Uploader (`ProductImageUploader.tsx`)**:
  - Replaced 4 large vertical image boxes with a single horizontal strip of 80×80px thumbnails with an 80×80px square `+ PHOTO` CTA button.
  - Reorder (`←`/`→`) and delete (`✕`) controls converted to translucent hover overlay icons.
  - Added `onError` fallback on `<img>` elements rendering a clean gray box with camera icon when images fail to load.
- **Collapsible Description**:
  - Converted description textarea to a default-collapsed field with a `+ Add Description` link.
- **Fixed Modal Height & Sticky Footer**:
  - Configured outer card container with max height `min(85vh, 720px)` and flex column layout.
  - Header and tab bar fixed top (`flex-shrink-0`), tab content body scrollable (`flex-1 overflow-y-auto`), and footer fixed bottom (`flex-shrink-0 border-t`).
- **Vitest Unit Test Suite**:
  - Verified 100% pass rate across 28 test files and 136 unit tests.

---

## 23. Color Token Centralization Phase 1 & Phase 2 Pilot (Aug 2, 2026)

- **Phase 1 Infrastructure (`app/globals.css`)**:
  - Added B2B Portal dark-theme surface tokens (`--color-portal-bg: #0B1E3D`, `--color-portal-surface: #132A52`, `--color-portal-text-secondary: #8DA0C4`, `--color-portal-border: #1E3A8A`).
  - Added Section 16–17 portal status badge tokens (`--color-portal-warning: #F0B94A`, `--color-portal-warning-bg: #3A2E14`, `--color-portal-info: #85B7EB`, `--color-portal-info-bg: #132A52`, `--color-portal-success: #5DCAA5`, `--color-portal-success-bg: #14301F`).
- **Phase 2 Pilot Refactoring (`components/portal/orders/OrdersTable.tsx`)**:
  - Replaced hardcoded hex colors with CSS custom property tokens (`var(--color-portal-bg)`, `var(--color-portal-surface)`, `var(--color-portal-warning)`, `var(--color-portal-info)`, `var(--color-portal-success)`, `var(--color-accent)`).
  - Applied flat single-color surface design decision: removed alternating two-tone row backgrounds (`#0B1E3D`/`#1A3A5C`) in favor of unified `var(--color-portal-bg)` with 1px `var(--color-portal-border)` row dividers.
- **Verification**:
  - `npm test`: 28 test files / 136 unit tests passed 100%.
  - `npm run build`: Production build clean with 0 errors.

---

## 24. Site-Wide Dark/Light Theme System (Aug 2, 2026)

- **Generalize & Complete Tokens (`app/globals.css`)**:
  - Configured project-wide light and dark theme variable scopes (`:root, [data-theme="light"]` and `[data-theme="dark"]`).
  - Added semantic variables for background (`--color-bg`), surface (`--color-surface`), primary/secondary text (`--color-text-primary`, `--color-text-secondary`), border (`--color-border`), and status badges (`--color-status-warning`, `--color-status-info`, `--color-status-success`).
  - Retained `--color-gold: #DBB671` theme-independent (Logo mark only).
  - Maintained backward-compatible `--color-portal-*` alias mappings in `@theme`.
- **Anti-Flash Theme Resolution Script (`app/layout.tsx`)**:
  - Implemented inline execution script in `<head>` inspecting `localStorage.getItem('satriano-theme')` or system `prefers-color-scheme`.
  - Configured admin exemption clause (`if (pathname.startsWith('/admin')) return;`) to preserve the Admin panel's separate Swiss Design token system.
- **Toggle UI Controls**:
  - Added sharp-corner Sun/Moon theme toggle in `SiteHeader.tsx` (Public Site).
  - Added Theme Mode Preference card in `SettingsTab.tsx` (`/portal/account?tab=settings`).
  - Both controls read/write to the shared `localStorage` key `'satriano-theme'` and set `data-theme` on `<html>`.
- **Component Token Refactor (`OrdersTable.tsx`)**:
  - Updated `OrdersTable.tsx` to reference generalized tokens (`var(--color-bg)`, `var(--color-surface)`, `var(--color-text-primary)`, `var(--color-border)`, `var(--color-status-*)`).
- **Verification**:
  - `npm test`: 28 test files / 136 unit tests passed 100%.
  - `npm run build`: Production build clean with 0 errors.

---

## 25. Theme System Remediation & Portal Dark Default (Aug 2, 2026)

- **Fix 1 — Portal Header Toggle (`PortalHeader.tsx`)**:
  - Added Sun/Moon icon theme toggle button in `PortalHeader.tsx` adjacent to `AccountDropdown`.
  - Reused exact `document.documentElement.setAttribute('data-theme', ...)` and `localStorage.setItem('satriano-theme', ...)` logic.
- **Fix 2 — Complete Component Token Coverage**:
  - Converted hardcoded hex values to CSS custom property tokens across 8 portal components/pages: `app/portal/orders/page.tsx`, `components/portal/PortalHeader.tsx`, `app/portal/account/page.tsx`, `components/portal/PortalDashboard.tsx`, `components/portal/account/BillingTab.tsx`, `components/portal/account/SettingsTab.tsx`, `components/portal/orders/OrderDetailModal.tsx`, and `components/portal/AccountDropdown.tsx`.
  - Eliminated dark/light contrast mismatches between page wrappers and nested components.
- **Fix 3 — Portal Dark Default (`app/layout.tsx`)**:
  - Updated inline resolution script in `<head>`: when `pathname.startsWith('/portal')` and no `satriano-theme` localStorage key exists, `data-theme` defaults to `"dark"` directly regardless of OS system preference.
  - Public marketing routes retain system-preference fallback (`prefers-color-scheme`).
  - Executive Admin panel (`/admin/*`) remains 100% exempt on its isolated Swiss Design token system.
- **Verification**:
  - `npm test`: 28 test files / 136 unit tests passed 100%.
  - `npm run build`: Production build clean with 0 errors.

---

## 26. Site-Wide Dark/Light Theme System Specification & Technical Rules

### 1. Scope & Isolation Boundaries
- **Scope**: Public Marketing Site (`/`, `/categories`, `/wholesale`, `/konfigurator`) + B2B Customer Portal (`/portal/*`).
- **Admin Exemption Clause**: The Executive Admin Panel (`/admin/*`) is **100% explicitly excluded** from the site-wide dark/light theme toggle. Admin retains its own dedicated Swiss Design industrial token system (`#F7F8FA` background, `#111318` sidebar/text, `#2E5AAC` primary accent, 4–6px border-radius, `#EAECF0` 1px borders).

### 2. Default Theme Resolution Logic
- **Public Site (`/`, `/categories`, `/wholesale`, `/konfigurator`)**: Defaults to **light mode** (`data-theme="light"`). In the absence of an explicit saved preference in `localStorage` (`satriano-theme`), it falls back to the operating system's `prefers-color-scheme`.
- **B2B Customer Portal (`/portal/*`)**: Defaults to **dark mode** (`data-theme="dark"`) regardless of system preference unless an explicit user preference is saved in `localStorage`.
- **Anti-Flash Mechanism**: An inline, blocking `<script>` block in `<head>` of `app/layout.tsx` inspects `pathname` and `localStorage.getItem('satriano-theme')` to set `document.documentElement.setAttribute('data-theme', ...)` prior to DOM paint, preventing white/dark flash on page load.

### 3. Comprehensive Theme Token Reference

| Token Name | Light Mode Value | Dark Mode Value | Usage Scope & Description |
|---|---|---|---|
| `--color-bg` | `#FFFFFF` | `#0B1E3D` | Page body background |
| `--color-surface` | `#F7F8FA` | `#132A52` | Card, container, and table surface background |
| `--color-text-primary` | `#111318` | `#FFFFFF` | Primary headings, titles, and body text |
| `--color-text-secondary` | `#6B7280` | `#8DA0C4` | Subtitles, labels, secondary metadata text |
| `--color-border` | `#EAECF0` | `#1E3A8A` | Container borders, card outlines, table row dividers (1px) |
| `--color-accent` | `#2E5AAC` | `#2E5AAC` | Primary CTA buttons, active tab underlines, focus rings (Theme-independent) |
| `--color-gold` | `#DBB671` | `#DBB671` | Brand logo mark only (Theme-independent) |
| `--color-status-warning` | `#B45309` | `#F0B94A` | Warning badge text (e.g. Pending Review) |
| `--color-status-warning-bg` | `#FEF3C7` | `#3A2E14` | Warning badge surface background |
| `--color-status-info` | `#1D4ED8` | `#85B7EB` | Info badge text (e.g. Under Review, In Transit) |
| `--color-status-info-bg` | `#EFF6FF` | `#132A52` | Info badge surface background |
| `--color-status-success` | `#047857` | `#5DCAA5` | Success badge text (e.g. Approved, Paid, Active) |
| `--color-status-success-bg` | `#ECFDF5` | `#14301F` | Success badge surface background |

### 4. The Five Hard Development Rules
1. **No Raw Hex Values**: Hardcoded hex strings (e.g. `#0B1E3D`, `#132A52`, `#1E3A8A`, `#8DA0C4`) are strictly forbidden inside component JSX/TSX. All background, text, border, and badge styles must reference CSS custom variables (e.g. `var(--color-bg)`).
2. **Mandatory Background/Text Pairing**: Whenever a background token (`--color-bg` or `--color-surface`) is applied to a container element, it MUST be explicitly paired with a corresponding text token (`--color-text-primary` or `--color-text-secondary`) on that exact element to ensure high contrast in both themes.
3. **Page Background ≠ Card Surface**: Outer page background (`--color-bg`) and nested card container surface (`--color-surface`) are distinct semantic tokens. Cards MUST be separated from the page background using a clean 1px border (`var(--color-border)`), never box-shadows or contrasting filled card backgrounds.
4. **No Alternating Row Striping**: Tables and list items must use flat single-color surface backgrounds with 1px border dividers (`var(--color-border)`). Alternating two-tone row backgrounds (e.g. alternating `#0B1E3D` / `#1A3A5C`) are banned.
5. **Acceptance Criterion ("Definition of Done")**: A component, page, or modal file is NOT considered complete until a `grep` search for legacy hardcoded hex values returns **zero matches** within that file.

### 5. Current Verification & Known Implementation Status
- **Verified Working via Visual Inspection**:
  - `app/layout.tsx` (Anti-flash resolution script & admin exemption clause).
  - `components/layout/SiteHeader.tsx` (Public header Sun/Moon theme toggle).
  - `components/portal/PortalHeader.tsx` (Portal header Sun/Moon theme toggle).
  - `components/portal/account/SettingsTab.tsx` (Theme Mode Preference card).
  - `components/portal/orders/OrdersTable.tsx` (Tokenized table & flat border dividers).
- **Known Outstanding Inner Component Color Issues**:
  - While outer page wrappers (`/portal`, `/portal/account`, `/portal/orders`) respect theme tokens, several nested inner components still contain legacy hardcoded dark hex backgrounds (`#0B1E3D`, `#132A52`, `#1E3A8A`):
    - `components/portal/PortalDashboard.tsx` (`CompanyInfoCard`, `QuickActionButtons` cards).
    - `components/portal/account/CompanyInfoTab.tsx` (Company detail cards).
    - `components/portal/account/BillingTab.tsx` (Address & invoice table cards).
    - `components/portal/orders/OrderDetailModal.tsx` (Modal dialog content wrapper).
  - These sub-components must be tokenized in upcoming sessions to achieve 100% theme consistency across all portal tabs.

---

## 27. Exhaustive Portal Token Refactor & 100% Theme Coverage (Aug 2, 2026)

- **Comprehensive Inner Card & Subcomponent Token Refactor**:
  - Refactored all remaining inner cards, tabs, forms, and page wrappers across 13 files in `app/portal` and `components/portal`.
  - Files converted: `app/portal/page.tsx`, `app/portal/support/page.tsx`, `CompanyInfoTab.tsx`, `TabNavigation.tsx`, `CompanyCard.tsx`, `QuickActionButtons.tsx`, `QuickLinksSection.tsx`, `RecentOrdersSection.tsx`, `FilterBar.tsx`, `PaginationBar.tsx`, `SupportForm.tsx`, `ContactChannels.tsx`, and `FaqLinks.tsx`.
- **Exhaustive Grep Verification**:
  - Re-scanned `app/portal` and `components/portal` for all navy hex patterns (`#0B1E3D`, `#132A52`, `#1E3A8A`, `#081733`, `#152D57`, `#1A3A5C`).
  - **Re-scan Count**: **0 matches remaining** across the entire customer portal codebase.
- **Verification**:
  - `npm test`: 28 test files / 136 unit tests passed 100%.
  - `npm run build`: Production build clean with 0 errors.
