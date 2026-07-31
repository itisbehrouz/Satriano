# Satriano Atelier — Roadmap v5 (as of July 31, 2026)

**Previous version:** v4 (pre-Product restructure, single-level Subcategory catalog, auto-calculated pricing model)
**This version:** consolidates every architectural change, production infrastructure setup, and admin panel inventory completed since v4.

---

## 1. Catalog Architecture — Fully Restructured

**Old (v4):** Category → Subcategory (2 levels), Fabric scoped to Subcategory, hardcoded `lib/categoriesData.ts`.

**New (v5):** **Category → Subcategory → Product** (3 levels), fully database-backed.

- **7 Categories** (Tops, Bottoms, Outerwear, Formal Wear, Sportswear, Underwear & Loungewear, Accessories)
- **~28 Subcategories**
- **65 Products** — each with its own Fabric/price set, Fit options, and MOQ values
- Previously merged names (e.g. "Dress & Casual Shirts") were fully split into separate Products

### New dimensions added:
- **Fit:** 8 values (Slim, Regular, Relaxed, Tailored, Skinny, Tapered, Modern, Oversized). 41 products have Fit options linked; 24 products (Sportswear, Underwear & Loungewear, Accessories) deliberately excluded since fit/cut isn't a meaningful dimension for those.
- **Size System (EU/US):** 10 size systems (Alpha, Waist, Chest, Shoe, OneSize × EU/US regions). Turkey/Middle East mapped to the EU system.
- **Two-Tier MOQ:**
  - `moqPerFabric` — minimum order quantity for a single fabric/colorway
  - `moqCombinedMultiFabric` — minimum combined total when mixing multiple fabrics/colors of the same product (schema + seed data in place; **validation not yet enforced** — multi-fabric-per-order isn't built yet, only single-fabric MOQ is currently validated)
  - All 65 products seeded with real MOQ values from the user-provided spreadsheet

---

## 2. Pricing Model — Fully Changed

**Old (v4):** System auto-calculates an exact price and sends the proforma immediately.

**New (v5):**
1. Customer selects a fabric → sees a **price range** (not an exact price): `Fabric.priceMinCents`–`priceMaxCents`
2. Customer enters their own **target price** (`Order.customerTargetPriceCents`)
3. Order is created in `PENDING_REVIEW` status — **no automatic proforma is sent**
4. Admin reviews feasibility, sets `finalPriceCents`, and manually triggers the proforma
5. Customer sees an "under review" state at `/proforma/[orderId]` until the final price is set

`OrderStatus` enum: `DRAFT → PENDING_REVIEW → PROFORMA_SENT → APPROVED → PAID → IN_PRODUCTION → SHIPPED / CANCELLED`

---

## 3. Production Infrastructure — Set Up and Verified

- **Database:** Supabase PostgreSQL (`satriano-atelier-prod`, Frankfurt/eu-central-1), via Prisma ORM, using the pooler connection (port 6543) for runtime and the direct connection (port 5432) for migrations
- **Vercel Environment Variables (Production):** `DATABASE_URL`, `DIRECT_URL`, `ADMIN_ACCESS_KEY`, `ADMIN_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`
- **Supabase Storage:**
  - `logos` bucket — customer logo/vector uploads
  - `proformas` bucket — **private**, signed-URL access. The fixed endpoint `/api/proforma/pdf/[orderId]` generates a fresh signed URL on every request and 307-redirects to it — the shared link never breaks and the bucket never needs to be public.
- **Data API (Supabase REST):** Disabled — no table is auto-exposed over REST; all access goes through Prisma (deliberate security decision)
- **Production smoke test:** All core routes (`/`, `/categories`, `/konfigurator/*`, `/admin`, `/portal`) return 200 with real Supabase-backed data

### Key lessons from this rollout:
- When adding a connection string to Vercel, **never manually splice the password into the URL** — copy the full string directly from Supabase's "Connect → ORM → Prisma" modal. Manually combining special characters (`$`, `%`) in the password broke URL parsing.
- Never keep real/production values in a tracked `.env` file — only `.env.local` (gitignored) should. A stray local placeholder in `.env` got bundled into a Vercel build and caused production to try connecting to `127.0.0.1`.
- Adding a new env var in Vercel requires a manual redeploy — it does not take effect automatically.
- A "works right after generation" test is not sufficient proof for anything involving file storage — verify with a genuine cold test (2+ minutes later) before declaring it fixed.

---

## 4. Security — Admin Auth Hardened Permanently

- Server-side JWT (via `jose`, HS256, pinned algorithm), httpOnly signed cookie
- `middleware.ts` protects both `/admin` pages and all `/api/admin/*` routes
- Hardcoded fallback secrets fully removed — missing env vars now throw a hard error instead of silently falling back to an insecure default
- **Standing rule:** no destructive database command (`--force-reset`, `migrate reset`, `env rm`, etc.) is ever run without pasting the exact command and getting explicit "yes, run it" confirmation first
- **Standing rule:** secret/credential values are never printed in chat or debug logs — only pass/fail confirmations are shared

---

## 5. Admin Panel — Full Inventory (audited July 31)

### ✅ Working
- Corporate Access Key auth, server-side, session cookie, logout
- Order list + detail view (company, target price, fabric/size/fit/quantity)
- Set final price + manually trigger proforma (PENDING_REVIEW → PROFORMA_SENT)
- Full order status lifecycle including SHIPPED/CANCELLED (fixed today)
- Logo/vector file visibility (added today)
- Persistent proforma PDF access via private bucket + signed URL (fixed today)
- Category → Subcategory → Product hierarchy view
- Product active/inactive toggle, Fabric active toggle, Fit toggle, MOQ editor
- Size system view (read-only)

### 🟡 Partial / needs re-verification
- Order status filter tabs — now send `?status=` to the API (fixed today, not yet re-verified)
- Multi-line orders only display the first line item

### ❌ Missing entirely
- Admin UI for B2B applications (API exists, no screen)
- Category/Subcategory CRUD (no create/edit form)
- Fabric price-range editing UI (API supports it, no form)
- Size system CRUD
- Admin KPI/overview dashboard
- Multi-admin / per-user identity (single shared key)
- Audit log
- Order search

---

## 6. Three Launch-Blocking Issues Closed Today

1. **Logo file wasn't visible in admin** → fixed, download link added
2. **Proforma PDF was lost in production** (ephemeral disk) → moved to Supabase private bucket + signed URL flow, verified with a genuine cold-storage test
3. **SHIPPED/CANCELLED status transitions were blocked** → whitelist fixed

---

## 7. Remaining Priority Order (not yet done)

1. Codebase health audit (skill added — `codebase-health-audit`) — not yet run
2. B2B applications admin UI
3. Fabric price editing UI
4. Admin KPI dashboard
5. Category/Subcategory CRUD
6. Multi-fabric-per-order feature (without this, `moqCombinedMultiFabric` validation has nothing to enforce)
7. Stripe live account migration — **deliberately deferred**, will not happen until UI/UX and customer feedback have matured
8. Local PostgreSQL dev environment — still separate, kept in sync with production Supabase manually

---

## 8. Standing Tools Added (Skills)

- `codebase-health-audit` — dead code / over-engineering audit
- `feature-inventory-audit` — full inventory of a feature area (used on the admin panel today, produced high-value findings)

---

## 9. General Lesson (for this roadmap itself)

Several times in this project, something was reported as "done" but turned out not to actually work (category count, admin key mechanism, whether the pricing model was really implemented, the "cold test" false positive pattern). Lesson: **"done" status should be periodically re-verified with `feature-inventory-audit`, especially after a major schema/architecture change** — a task's report can be accurate at the time, and still get silently broken by a later change.