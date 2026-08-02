# Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 1, 2026 — evening update)

**Scope:** B2B Made-to-Order e-commerce + multi-category product catalog
+ B2B partner portal + workflow automation
**Capacity assumption:** Solo developer, ~2 hours/day
**Development environment:** Google Antigravity (primary), Claude Code
(approved fallback when Antigravity quota exhausted), Claude
(architecture/planning), Vercel (hosting), Supabase (DB + Storage)
**Cost principle:** Zero fixed cost — usage/commission-based services
only (Vercel free tier, Supabase free tier, Stripe transaction fees
when live)

This document consolidates everything decided and built through the
evening of August 1, 2026. It replaces all prior versioned roadmap
files — this is the single source of truth going forward. Update this
file in place going forward; do not create new versioned files.

---

## 1. Catalog Architecture

**Category → Subcategory → Product** (3 levels), fully database-backed.

- **7 Categories**: Tops, Bottoms, Outerwear, Formal Wear, Sportswear,
  Underwear & Loungewear, Accessories
- **~28 Subcategories**
- **65 Products** — each with its own Fabric/price set, Fit options,
  and MOQ values. Every originally-merged name (e.g. "Dress & Casual
  Shirts") was split into separate, individually-configurable Products.

### Product dimensions:
- **Fit (Kalıp):** 8 values (Slim, Regular, Relaxed, Tailored, Skinny,
  Tapered, Modern, Oversized). 41 products have Fit linked; 24
  (Sportswear, Underwear & Loungewear, Accessories) deliberately
  excluded — fit/cut isn't meaningful for those.
- **Size System (EU/US):** 10 size systems (Alpha, Waist, Chest, Shoe,
  OneSize × EU/US). Turkey/Middle East mapped to EU.
- **Two-Tier MOQ:**
  - `moqPerFabric` — minimum order for a single fabric/colorway
    (enforced in order creation).
  - `moqCombinedMultiFabric` — minimum combined total across multiple
    fabrics/colors of the same product (schema + seed data exist;
    **validation not yet enforced** — multi-fabric-per-order UI isn't
    built yet).
  - All 65 products seeded with real MOQ values from a user-provided
    spreadsheet.
- **Configurator UX:** stepper (+/-) controls for size quantities, live
  MOQ progress indicator gating order submission, sticky price panel.
  Multi-photo product gallery ("Part D") — **not started**, may
  require new asset generation across all 65 products; scope decision
  pending.

---

## 2. Pricing Model

No auto-calculated exact pricing. Instead:

1. Customer selects a fabric → sees a **price range**:
   `Fabric.priceMinCents`–`priceMaxCents`.
2. Customer enters their own **target price**
   (`Order.customerTargetPriceCents`).
3. Order is created in `PENDING_REVIEW` — **no automatic proforma**.
4. Admin reviews feasibility, sets `finalPriceCents`, manually
   triggers the proforma.
5. Customer sees an "under review" state at `/proforma/[orderId]`
   until the final price is set.

`OrderStatus` enum: `DRAFT → PENDING_REVIEW → PROFORMA_SENT →
APPROVED → PAID → IN_PRODUCTION → SHIPPED / CANCELLED` (full lifecycle
supported in admin, including SHIPPED/CANCELLED transitions).

---

## 3. Production Infrastructure

- **Database:** Supabase PostgreSQL (`satriano-atelier-prod`,
  Frankfurt/eu-central-1), via Prisma ORM. Pooler connection (port
  6543, `pgbouncer=true`) for runtime; direct connection (port 5432)
  for migrations.
- **Vercel Environment Variables (Production only, not Preview):**
  `DATABASE_URL`, `DIRECT_URL`, `ADMIN_ACCESS_KEY`, `ADMIN_JWT_SECRET`,
  `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`,
  `EMAIL_FROM` (Resend, test mode — see Section 7).
- **Supabase Storage buckets:**
  - `logos` — public, customer logo/vector uploads.
  - `proformas` — **private**, signed-URL access via the fixed
    endpoint `/api/proforma/pdf/[orderId]`, which generates a fresh
    signed URL on every request and 307-redirects. The link never
    breaks; the bucket never needs to be public. Authorizes both admin
    sessions and the order's own customer session.
- **Data API (Supabase REST):** Disabled — no table auto-exposed;
  all access via Prisma (deliberate security decision).
- **Git workflow:** single `main` branch → Vercel Production directly.
  No `develop`/staging branch — deliberately decided against given
  solo capacity; would require a separate dev Supabase project to be
  genuinely useful, which isn't worth the overhead right now. Testing
  discipline instead: real E2E tests directly against production,
  followed by explicit test-data cleanup every time.

### Operational lessons:
- Never manually splice a password into a connection string — always
  copy the full string from Supabase's "Connect → ORM → Prisma" modal.
  Manual encoding of special characters (`$`, `%`) has broken URL
  parsing multiple times.
- Never keep real values in a tracked `.env` file — only `.env.local`
  (gitignored).
- New Vercel env vars require a manual redeploy.
- File-storage fixes need a genuine "cold" test (2+ minutes later),
  not an immediate-after-generation check.
- If local dev breaks, get a narrow diagnostic (exact error + git
  status) before allowing any open-ended "fix it" self-repair — see
  Section 8.
- **Whenever the Supabase DB password is rotated, both `.env.local`
  AND Vercel Production env vars must be updated together, followed
  by a redeploy** — updating only one side breaks the other silently
  with `P1000` auth errors (happened once, see Section 8).

---

## 4. Security

- Admin auth: server-side JWT (`jose`, HS256, pinned algorithm),
  httpOnly signed cookie (`sat_admin_token`), `middleware.ts` protects
  both `/admin` pages and all `/api/admin/*` routes. No hardcoded
  fallback secrets — missing env vars throw a hard error. Kök `/admin`
  middleware'de redirect edilmiyor; sayfa kendi içinde `useEffect` ile
  `/api/admin/session` çağırıp login formu gösteriyor (nested route'lar
  ise middleware'de doğrudan redirect ediliyor).
- Customer auth: **magic-link login**, APPROVED-B2B-application-gated
  (see Section 6). Signed httpOnly cookie (`sat_customer_token`),
  separate from admin.
- **Standing rules (non-negotiable, apply to every coding session):**
  1. No destructive database command (`--force-reset`, `migrate
     reset`, `env rm`, `git reset --hard`, etc.) without pasting the
     exact command and getting explicit "yes, run it" confirmation
     first.
  2. Secret/credential values are never printed in chat, logs, or
     reports — only pass/fail confirmations.
  3. Never scrape credentials from IDE session transcript logs as a
     "recovery" method — always get fresh values from the actual
     source (Supabase/Vercel dashboards).

---

## 5. Admin Panel — Inventory

### ✅ Working
- Corporate Access Key auth, order list + detail, full status
  lifecycle (incl. SHIPPED/CANCELLED), logo file visibility, proforma
  PDF (persistent, private bucket), status filter tabs.
- B2B Applications review screen (`/admin/applications`) — list,
  filter by status, expand full application detail, approve/reject
  (blocked until email verified — see Section 6), UI UX Pro Max
  design, accessibility-compliant (visible labels, 44px targets,
  transient error banners with dismiss + auto-clear).
- Catalog management (`/admin/product-settings`): Category → Subcategory
  → Product hierarchy view/CRUD (create forms for all 3 levels,
  duplicate-slug rejection, missing-fabric rejection), Fabric
  active toggle, Fit assignment matrix, MOQ editor, Size system view.
- **Admin UI redesign (Aug 1, evening — see Section 5a for full
  detail):** shared sidebar/top-bar chrome separated from the public
  website; Garment Fits and Catalog & MOQs tabs redesigned to a
  neutral, Supabase/Linear-style accordion + table pattern.

### 🟡 Partial / pending
- Photo/image upload field for Category/Subcategory/Product "Add New"
  and Edit forms — prompt prepared, not yet executed. Currently
  `imageUrl` can only be set via direct DB/API.
- Fabric price-range (min/max) editing UI — API supports it, no form
  exists yet.
- **Regional Size Systems and Product Fabrics & Ranges tabs** — still
  on the old dense/card-grid visual pattern; not yet redesigned to
  match Garment Fits / Catalog & MOQs (see Section 5a, next steps).

### ❌ Missing
- Admin KPI/overview dashboard (lands directly on raw order list).
- Multi-admin / per-user identity (single shared key, `reviewedBy`
  hardcoded to `"admin"`).
- Audit log.
- Order search.
- Multi-fabric-per-order UI (blocks `moqCombinedMultiFabric`
  enforcement).
- Functional global search (`⌘K` bar is currently a visual placeholder
  only in the new admin chrome — no filtering logic wired yet).

---

## 5a. Admin UI Redesign (Aug 1, evening session)

**Motivation:** The admin panel had grown dense and visually
inconsistent — every category/subcategory/product expanded at once,
heavy borders, colored-fill checkboxes/chips with no visual hierarchy,
and the public website's navy header/nav/footer bleeding into admin
pages. Goal: a calm, operator-focused tool interface (Supabase Studio /
Linear-inspired), fully separated from the customer-facing brand
identity — **admin uses its own neutral design tokens, not the site's
0px-corner navy/gold identity.**

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
1. **Stage 1 — Full inventory before any layout change** (via
   `feature-inventory-audit` methodology): every `/admin/*` route, nav
   item, button, and the auth/middleware mechanism traced from actual
   code before touching anything, specifically to prevent silently
   dropping functionality during the redesign.
2. **Web-site chrome removed from all `/admin/*` routes** (done
   independently by the user in Antigravity): navy header/nav/footer,
   `CookieConsentModal`, and `AIFaqAssistantModal` no longer render on
   admin pages (pathname-guarded or removed at the source).
   `B2BSupportDock` was already admin-safe via an existing
   `usePathname()` guard.
3. **Stage 2 — Shared admin chrome** (`app/admin/layout.tsx`, via
   Claude Code): dark (`#111318`) vertical icon sidebar (Order Ledger /
   B2B Applications / Product Settings, active-route highlight) + top
   bar (breadcrumb, visual-only search placeholder, single centralized
   Sign Out). New `components/admin/AdminAuthContext.tsx` centralizes
   session state (previously each of the 3 admin pages polled
   `/api/admin/session` independently). Duplicated per-page top
   bars/module-nav rows removed; each page's own Refresh button and
   fetch logic were deliberately left untouched (lower-risk option),
   only Sign Out + nav were centralized.
4. **Garment Fits tab redesign**: replaced the old card-grid (which
   had incorrectly mapped fit *dimensions* — chest/waist/neck
   measurements — instead of fit *values*) with an accordion
   Category→Subcategory→Product tree + a right slide-over panel
   showing the correct 8 `Fit` enum values (Slim, Regular, Relaxed,
   Tailored, Skinny, Tapered, Modern, Oversized), neutral-gray
   checkboxes (no blue fill), and a "Linked Fits" status badge
   (neutral/amber/red by completeness). Backend (`Fit`/`ProductFit`
   schema, `PATCH /api/admin/catalog`) untouched — presentation-layer
   only.
5. **Catalog & Two-Tier MOQs tab redesign**: same accordion pattern
   applied — Category and Subcategory rows collapsed by default
   (`openCategoryIds`/`openSubcategoryIds` state), all 7 categories
   now fit on one screen. Fit chips in the product table changed from
   blue-filled to neutral gray. Active/Off status badge: Active stays
   green (consistent with the Garment Fits success palette), Off
   changed from red to neutral gray (inactive isn't an error state).
   Card borders thinned to `#EAECF0`, row padding reduced. MOQ numbers
   de-emphasized from blue to neutral dark text — blue now reserved
   for the "Edit MOQs" link and active nav/tab state only. Add
   Category/Subcategory/Product buttons and the inline "Edit MOQs"
   form were functionally untouched.

### Verification performed:
- `npm test`: 98/98 passing after both tab redesigns.
- ESLint: no new errors introduced (pre-existing warnings confirmed
  identical on `main` via `git stash` comparison).
- Manual browser walkthroughs (via Claude Code + `claude-in-chrome`)
  for both redesigns: navigated all 3 admin routes, expanded/collapsed
  categories, opened/closed Edit MOQs and Add Category, tested Sign
  Out from the centralized button, and re-verified with the user's own
  live session (not a copied one).
- Auth/middleware behavior reconfirmed unchanged: unauthenticated
  nested `/admin/*` routes still 307-redirect to `/admin`; root
  `/admin` login gate still works via client-side session check.

### Next steps (not yet done):
- Redesign **Regional Size Systems** and **Product Fabrics & Ranges**
  tabs to match the same neutral/accordion pattern (separate,
  narrowly-scoped tasks — same approach as Garment Fits and Catalog &
  MOQs, one tab at a time to keep each change independently
  verifiable).
- Wire the `⌘K` search bar to actual client-side filtering across
  categories/subcategories/products (currently visual-only).
- Decide whether to keep or remove the small SATRIANO gold wordmark
  in the sidebar's top-left corner (currently kept — it's a static
  logo mark, not an interactive accent, so it doesn't violate the
  "no gold as interactive accent" rule, but it's an open aesthetic
  call).
- **Commit + push pending** as of this writing — changes are verified
  locally but not yet on `main`/production. Push both the chrome
  separation (Stage 2) and Catalog & MOQs redesign together or in two
  clean commits, then verify `satriano.vercel.app/admin` visually
  before considering this fully closed.

---

## 6. B2B Customer Portal — Full Chain (Completed)

Real chain, end-to-end verified on production with genuine emails:

1. **Application submission** (`/portal`, 3-step form) → creates
   `B2bApplication` (status `SUBMITTED`).
2. **Email verification** — a verification email is sent
   (`EmailVerificationToken`, 24h expiry, single-use); clicking it
   transitions status to `UNDER_REVIEW` and sets `emailVerifiedAt`.
   **Admin cannot approve/reject an application before this** (server-
   side enforced, `400` if attempted).
3. **Admin review** (`/admin/applications`) — approve or reject.
4. **Magic-link login** (`/portal`) — customer requests a login link;
   only sent if a matching `B2bApplication.status === APPROVED` exists.
   **Identical API response** regardless of approved/pending/rejected/
   unknown email (prevents enumeration). 15-min token expiry,
   single-use, rate-limited (3 requests/15min).
5. **Order history** (`/portal/orders`) — protected by customer
   session cookie, lists the company's orders with status, prices,
   and proforma PDF download (customer-authorized extension of the
   admin PDF endpoint).

**Not yet built:** global header logged-in state (account icon +
dropdown replacing the "CLIENT PORTAL" button; Orders/Invoices/
Settings/Sign Out menu) and a more polished, e-commerce-style order
history redesign — a build prompt was prepared but not yet executed.

**Email delivery:** configured via Resend (test mode) — currently can
only send to the Resend account's own registered email. Domain
verification deferred; needed before real customer emails can receive
messages.

---

## 6a. UI/UX & Feature Additions (Aug 1, afternoon session)

Built and confirmed as permanent, intended additions to the site (not
scope drift — explicitly approved):

- **Legal pages redesign** — all 5 core pages (Terms, Privacy, Supply
  Terms, Security, Cookies) redesigned with sharp B2B styling; added
  `CookieConsentModal.tsx` with a footer-accessible preferences button.
- **`/categories` search & filter** — `CategoriesSearchFilter.tsx`:
  real-time text search, department filters, active product counts,
  grid view modes.
- **New `/wholesale` catalog page** — `WholesaleCatalogClient.tsx`:
  left-hand filter drawer (category, fabric line, lead time, MOQ
  threshold, price range sliders), right-hand product grid (fabric
  lines, MOQ counts, price ranges, direct product links).
- **Brand mark geometry standard** — enforced 0px sharp rectangular
  geometry (`rounded-none`) across header nav, product cards,
  configurator inputs, buttons, and modals, to match the gold brand
  mark. **Note:** this 0px standard applies to the public website
  only — the admin panel deliberately uses 4–6px radius as its own
  tool identity (see Section 5a).
- **Certification claims audit** — removed unverified `ISO &
  OEKO-TEX Certified` / `ISO 9001` claims sitewide; replaced with
  factual terms (`European Quality Standard`, `GDPR Compliant`,
  `Sustainable Material Sourcing`).
- **24/7 B2B Support Dock** (`B2BSupportDock.tsx`) — collapsible
  left-edge tab, minimized by default (`B2B SUPPORT ▸`). Two panels:
  direct-contact channels (WhatsApp, Telegram, Signal, corporate
  email) and an **`AIFaqAssistantModal.tsx`** — this is a scripted/
  rule-based FAQ assistant (MOQs, lead times, proformas, sizing,
  vector logo specs), **not** a paid AI API call — confirmed no
  ongoing cost. Both this and `CookieConsentModal` were later
  pathname-guarded out of `/admin/*` (see Section 5a).
- **Configurator redesign** (`ConfiguratorClient.tsx` +
  `PriceSidebar.tsx`) — executive header shell with live MOQ status
  badge, 4-step progress stepper (Fabric Line → Fit & Sizing → Vector
  Logo → Proforma Review), redesigned price/MOQ sidebar with a clean
  progress bar replacing the earlier cramped text version.

Verified: 98/98 tests passing, clean local build, 100% English across
UI text/comments/docs.

---

## 7. Deferred / Explicitly Rejected Scope

- **Multi-language (5 languages):** considered, explicitly deferred.
  Single-language English remains the MVP decision. Revisit only as a
  deliberate, large scope item — not incrementally.
- **Stripe live account migration:** deliberately deferred until
  UI/UX and customer feedback have matured.
- **`develop` git branch / separate dev Supabase project:** considered,
  decided against (see Section 3).
- **Discount tiers / stock-count display** (from a competitor
  reference): rejected — doesn't fit the Made-to-Order + price-range
  model; not applicable.

---

## 8. Incident Log

**Aug 1 — Local dev environment recovery.** While Antigravity/Gemini
quota was exhausted, work continued via Cline + a local LM Studio
model. This caused imprecise full-file rewrites and a stale
`.env.local` DATABASE_URL. A follow-up Antigravity session then went
off-task, spending 140+ commands on a self-repair spiral (regex-
escaping `.env.local`, scraping a stale password from IDE session
transcript logs, making unrequested changes to `lib/prisma.ts`).
Recovered via `git reset --hard origin/main` + `git clean -fd`, a
fresh Supabase password reset, and rebuilding `.env.local` from
Supabase's own connection modal. Verified via `npm test` (98/98
passing) and `npm run dev`.

**Lesson:** prefer waiting for Antigravity quota reset (or using
Claude Code) over local-model coding agents for this codebase's
complexity — cleanup cost exceeded time saved. When local dev breaks,
require a narrow diagnostic report before allowing any multi-step
self-repair.

**Aug 1 — Production down after local Supabase password reset.**
During the local recovery above, the Supabase database password was
reset and `.env.local` was rebuilt with the new credentials — but the
same new credentials were never propagated to Vercel's Production
environment variables. Production (`satriano.vercel.app`) returned
`500` / `PrismaClientKnownRequestError: P1000 Authentication failed`
for several hours until `DATABASE_URL`/`DIRECT_URL` were manually
updated in Vercel to match `.env.local`, followed by a redeploy.

**Lesson:** whenever the Supabase database password is rotated for
any reason (security incident, forgotten password, local recovery),
**both** `.env.local` *and* Vercel's Production environment variables
must be updated together, followed by a Vercel redeploy — updating
only one side silently breaks the other environment.

**Aug 1, evening — Antigravity quota exhausted mid-task, handed off to
Claude Code.** During the admin UI redesign work, Antigravity's 5-hour
+ weekly model quota (Claude/GPT group) hit 100% mid-session. Per the
standing rule (Claude Code is the approved fallback), the in-progress
task (admin layout Stage 1 inventory, then Stage 2 chrome build) was
handed to Claude Code in the terminal with a full context-carryover
prompt (standing security rules, prior task state, exact scope) so no
re-discovery work was lost. Claude Code completed both the inventory
and the chrome build successfully, including live browser verification
via `claude-in-chrome`.

**Lesson:** the Antigravity→Claude Code handoff works well when the
handoff prompt explicitly restates standing rules and prior findings
rather than assuming Claude Code will infer them — this is now the
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
7. Admin KPI dashboard & analytics widget.
8. Customer Portal header logged-in state + polished order history redesign.
9. Configurator Part D (multi-photo gallery) — scope decision pending.
10. Multi-fabric-per-order feature (unblocks `moqCombinedMultiFabric`).
11. Stripe live account migration — deferred.
12. Codebase health audit — re-run periodically after major feature drops.

---

## 10. Standing Tools (Skills)

- `codebase-health-audit` — dead code / over-engineering audit. Use
  after major schema/architecture changes.
- `feature-inventory-audit` — full, code-verified inventory of a
  feature area (catches drift between "reported done" and actual
  state). Used today before the admin layout change specifically to
  avoid dropping functionality during the chrome separation.
- `ui-bug-triage-from-screenshot` — classify a screenshot bug report
  (real code bug / test data noise / browser artifact / needs more
  detail) before writing any fix prompt.

---

## 11. General Lesson

Several times, something was reported as "done" but wasn't (category
count, admin key mechanism, whether pricing was really implemented,
the "cold test" false positive, the "29 pre-existing DB failures" that
turned out to be a real bug, and today: a "done" header-removal claim
that turned out to be accurate but unverified by screenshot at the
time it was reported). **"Done" status should be periodically
re-verified with `feature-inventory-audit`, and any UI change claim
should be confirmed with an actual screenshot before being marked
closed** — a report can be accurate at the time and still be
unconfirmed, or be wrong from the start. This project's working
pattern going forward: every visual/UI change gets a screenshot
checkpoint before being considered done, regardless of which agent
(Antigravity, Claude Code, or a local model) produced it.

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
| **Vitest Test Suite** | 100% Healthy | 17/17 test files, 98/98 unit tests passing cleanly in 4.69s | Keep test coverage high for new endpoints |
| **Prisma Connection Pooling** | 100% Healthy | Port `:6543` Transaction Pooler + cached `PrismaPg` on `globalThis` | Prevent pool exhaustion in serverless |
| **Admin Layout Isolation** | 100% Healthy | `B2BSupportDock.tsx` returns `null` on `/admin/*`; consumer header/footer stripped | Maintain separate admin layout boundaries |
| **Catalog CRUD & Image Upload** | 100% Healthy | Supabase `'catalog-assets'` bucket upload with strict 2MB validation | Fully verified & operational |
| **Global Command Palette** | 100% Healthy | `cmdk` dialog listening to `Cmd+K`, live product & order indexing | Expand indexed entities as new models drop |

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