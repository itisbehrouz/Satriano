# Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 1, 2026)

**Scope:** B2B Made-to-Order e-commerce + multi-category product catalog
+ B2B partner portal + workflow automation
**Capacity assumption:** Solo developer, ~2 hours/day
**Development environment:** Google Antigravity (primary), Claude
(architecture/planning), Vercel (hosting), Supabase (DB + Storage)
**Cost principle:** Zero fixed cost — usage/commission-based services
only (Vercel free tier, Supabase free tier, Stripe transaction fees
when live)

This document consolidates everything decided and built through
August 1, 2026. It replaces all prior versioned roadmap files —
this is the single source of truth going forward.

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

---

## 4. Security

- Admin auth: server-side JWT (`jose`, HS256, pinned algorithm),
  httpOnly signed cookie (`sat_admin_token`), `middleware.ts` protects
  both `/admin` pages and all `/api/admin/*` routes. No hardcoded
  fallback secrets — missing env vars throw a hard error.
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

### 🟡 Partial / pending
- Photo/image upload field for Category/Subcategory/Product "Add New"
  and Edit forms — prompt prepared, not yet executed. Currently
  `imageUrl` can only be set via direct DB/API.
- Fabric price-range (min/max) editing UI — API supports it, no form
  exists yet.

### ❌ Missing
- Admin KPI/overview dashboard (lands directly on raw order list).
- Multi-admin / per-user identity (single shared key, `reviewedBy`
  hardcoded to `"admin"`).
- Audit log.
- Order search.
- Multi-fabric-per-order UI (blocks `moqCombinedMultiFabric`
  enforcement).

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
  mark.
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
  ongoing cost.
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
only one side silently breaks the other environment. Consider adding
a checklist step for this specifically after any password rotation.

---

## 9. Remaining Priority Order

1. Photo/image upload field for catalog Add/Edit forms.
2. Fabric price-range editing UI.
3. Admin KPI dashboard.
4. Portal header logged-in state + polished order history redesign.
5. Configurator Part D (multi-photo gallery) — scope decision pending.
6. Multi-fabric-per-order feature (unblocks `moqCombinedMultiFabric`).
7. Stripe live account migration — deferred.
8. Codebase health audit — should be re-run periodically (skill
   available, see Section 10), especially after major schema changes.

---

## 10. Standing Tools (Skills)

- `codebase-health-audit` — dead code / over-engineering audit. Use
  after major schema/architecture changes.
- `feature-inventory-audit` — full, code-verified inventory of a
  feature area (catches drift between "reported done" and actual
  state).
- `ui-bug-triage-from-screenshot` — classify a screenshot bug report
  (real code bug / test data noise / browser artifact / needs more
  detail) before writing any fix prompt.

---

## 11. General Lesson

Several times, something was reported as "done" but wasn't (category
count, admin key mechanism, whether pricing was really implemented,
the "cold test" false positive, the "29 pre-existing DB failures" that
turned out to be a real bug). **"Done" status should be periodically
re-verified with `feature-inventory-audit`**, especially after a major
schema/architecture change or after any session using a less reliable
tool (e.g. a local coding model) — a report can be accurate at the
time and still get silently broken later, or be wrong from the start.