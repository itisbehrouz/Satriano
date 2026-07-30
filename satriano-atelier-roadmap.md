# Satriano Atelier — MVP Architecture Blueprint (v4 — expanded scope, English-only)

**Scope:** B2B Made-to-Order e-commerce + multi-category product catalog + B2B partner portal + workflow automation
**Capacity assumption:** Solo developer, ~2 hours/day
**Estimated duration:** 14-18 weeks (revised from v3's 10-14 weeks — see "Why the estimate changed" below)
**Development environment:** Google Antigravity
**Cost principle:** Zero fixed cost — usage/commission-based services only (Vercel free tier, Supabase free tier, Stripe transaction fees)

> **Why the estimate changed (v3 → v4):** v3 already expanded once, from a single product type to a 7-group, multi-category catalog. As of July 31, 2026, three further modules were built that were not in v3's scope: a B2B customer portal (login + partner application + approval flow), an admin console gated by a "Corporate Access Key," and six legal/compliance pages. This is not a return to the original cancelled roadmap (state machine, roles, stock tracking — 5.5-7 months); the core workflow (proforma → payment → production) is still a single order at a time, with no cart. But the added modules are real subsystems with their own state and, in one case, an unverified security mechanism — so the estimate and scope boundaries below have been revised to reflect what actually exists and what still needs verification.

---

## 1. MVP Scope Boundaries (Current)

- ✅ Multi-category / subcategory catalog (7 main groups + 21 subcategories — see Section 4)
- ✅ Single payment method: **Stripe** (domestic + international card acceptance, no monthly fee)
- ✅ Single language (English — customer base is outside Turkey)
- ✅ Simple admin panel — order list + product/category management, no complex role system
- ✅ Size list is product-specific and editable from the admin panel (no free-text measurement, no hardcoding either)
- ✅ No cart — one product is configured at a time and goes straight to proforma
- ✅ **B2B partner portal** (login + 3-step application + approval-pending screen) — *promoted from Phase 3 backlog; frontend already built, backend confirmed missing — decided to build in full (see Section 4a)*
- ✅ **Admin console gated by "Corporate Access Key"** — *decided: server-side validation. Must protect both the page and every admin API route, not just the UI gate — see Section 9*
- ✅ **Six legal/compliance pages** (Terms, Privacy, B2B Supply Terms, Security, Cookies, Ethics) — static content, low risk
- ✅ Product photography: AI-generated, high resolution. No strict faceless/no-model rule — both human-featured and faceless images are acceptable; consistency approach across the 21 subcategories is still open (see Section 10)
- ❌ Second payment method (bank transfer / B2B net terms) — Phase 3
- ❌ Automatic DPI/color checking — Phase 3
- ❌ Advanced search/filtering (price range, multi-filter combinations) — Phase 3
- ❌ Order history view inside the B2B portal — Phase 3 (the portal itself is now in-scope, but this specific feature is not)

---

## 2. Technology Stack

*(unchanged from v3)*

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js (React)** | Frontend + API routes in one project, native fit with Vercel |
| Database | **Supabase (PostgreSQL, free tier)** | Auth, storage, and DB in one service |
| File storage | **Supabase Storage** | For logo/vector files, 1GB free tier |
| PDF generation | **@react-pdf/renderer** or **pdf-lib** | Open source, for the proforma invoice |
| Email | **Resend** or **Nodemailer + Gmail SMTP** | For sending the proforma |
| Payment | **Stripe** | Domestic + international card acceptance, no monthly fee |
| Hosting | **Vercel (free tier)** | Native fit for Next.js, automatic deploys |

---

## 3. Folder Structure (v3 + today's additions)

```
satriano-atelier/
├── app/
│   ├── page.tsx                    # Homepage (brand intro + category showcase)
│   ├── categories/
│   │   ├── page.tsx                 # List of all product groups
│   │   └── [categorySlug]/page.tsx  # Subcategories + featured pieces table
│   ├── configure/
│   │   └── [productId]/page.tsx     # Configurator: size/material + file upload
│   ├── checkout/
│   │   └── page.tsx                 # Proforma confirmation + Stripe payment
│   ├── order-confirmation/
│   │   └── [orderId]/page.tsx
│   ├── portal/                                  # NEW — B2B customer portal
│   │   └── page.tsx                             # 3 states: login / apply / submitted
│   ├── admin/
│   │   ├── page.tsx                             # Corporate Access Key gate (order list beyond it)
│   │   ├── [orderId]/page.tsx
│   │   └── product-settings/
│   │       ├── page.tsx
│   │       └── [productId]/page.tsx
│   ├── legal/                                   # NEW — 6 static pages
│   │   ├── terms/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── supply-terms/page.tsx
│   │   ├── security/page.tsx
│   │   ├── cookies/page.tsx
│   │   └── ethics/page.tsx
│   └── api/
│       ├── orders/
│       │   ├── route.ts
│       │   └── [orderId]/route.ts
│       ├── upload/route.ts
│       ├── proforma/route.ts
│       ├── categories/route.ts
│       ├── products/
│       │   ├── route.ts
│       │   └── [productId]/route.ts
│       ├── applications/                        # UNVERIFIED — may not exist yet
│       │   └── route.ts                         # POST: submit application, GET (admin): list
│       └── payment/
│           ├── create-session/route.ts
│           └── webhook/route.ts
├── lib/
│   ├── supabase.ts
│   ├── pricing.ts
│   ├── pdf-generator.ts
│   └── email.ts
├── components/
│   ├── CategoryGrid.tsx
│   ├── ProductTable.tsx
│   ├── ConfiguratorForm.tsx
│   ├── FileUpload.tsx
│   ├── OrderStatusBadge.tsx
│   └── AdminOrderTable.tsx
└── types/
    └── order.ts
```

---

## 4. Data Model (Supabase / PostgreSQL)

`categories`, `products`, `orders` tables — unchanged from v3 (see original definitions; omitted here for brevity, no changes).

### 4a. `b2b_applications` table — **CONFIRMED MISSING, decided to build**

Confirmed (Aug 2026): the backend does not exist yet. The portal's "Application Submitted" screen is currently a UI-only state — no data is persisted, nobody on the admin side sees it. Decision: build it in full.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Application ID |
| `company_name` | text | Company name |
| `contact_name` | text | Contact person |
| `contact_email` | text | Email |
| `status` | text | `submitted` → `under_review` → `approved` / `rejected` |
| `submitted_data` | jsonb | Full 3-step form payload |
| `created_at` | timestamptz | |
| `reviewed_at` | timestamptz (nullable) | |
| `reviewed_by` | text (nullable) | |

**Implementation checklist:**
1. Create `b2b_applications` table (schema above)
2. `POST /api/applications` — public, called from the portal's 3-step form on final submit
3. `GET /api/applications` — admin-only, server-side protected (see Section 9)
4. Simple admin screen: `/admin/applications` — list + approve/reject action (updates `status`)
5. Wire the portal's "Application Submitted" screen to actually call the `POST` endpoint — verify this is not already faked as a static success state
6. Optional: email notification to admin on new submission (can reuse `lib/email.ts`)

---

## 5. Main Workflow (End to End)

*(core order workflow unchanged from v3 — see Section 5 of the original document)*

**New workflow branch — B2B portal application (to be built, see Section 4a):**
```
1. Visitor on /portal → "Become a B2B Partner"
2. 3-step form (company info → contact → review) → submit
3. POST /api/applications → creates row in b2b_applications (status: "submitted")
4. "Application Submitted" screen confirmed shown after a real API response, not before
5. Admin reviews at /admin/applications → approve/reject → status updated
```

---

## 6. Stripe Integration Notes

*(unchanged from v3)*

---

## 7. Post-MVP (Phase 2/3 — Backlog)

- Second payment method (bank transfer / B2B net terms)
- Automatic email notifications on every status change
- Simple stock/capacity tracking
- Advanced search/filtering
- Cross-product comparison / outfit-suggestion enrichments
- ~~Self-service customer portal~~ — **moved into MVP scope (Section 1)**; order-history view specifically remains Phase 3

---

## 8. Getting Started in Antigravity — Suggested Order (v3, still valid for remaining work)

1. Set up Next.js + Supabase — *done*
2. Seed category data — *done, expanded to 21 subcategories*
3. `/categories` pages — *done*
4. `/configure/[productId]` + FileUpload — *done*
5. Admin `/product-settings` — *done*
6. Pricing function — *done*
7. Proforma PDF + email — *done*
8. Stripe test mode integration — *done*
9. Admin order panel — *done, but implement Section 9's server-side checklist across all admin API routes*
10. **PostgreSQL local connection** — *blocked; 4 integration tests failing*
11. **Stripe live account + bank connection** — *not started*
12. **Implement server-side admin auth** — *decided, see Section 9 checklist*
13. **Build `b2b_applications` backend** — *decided, see Section 4a implementation checklist*

---

## 9. Admin Access — Decision: Server-Side Validation

Decided (Aug 2026): the "Corporate Access Key" gate must be server-side, not client-side. Cost difference between the two is minor (roughly 30-60 extra minutes of implementation), while the security difference is large — client-side checks expose the key in the browser bundle and can be bypassed by calling admin API routes directly.

**Implementation checklist:**
- Key checked in **middleware or an API route**, never in a client component (`if (key === "...")` in a component is readable from the bundle).
- Key stored as a server-only env variable (not `NEXT_PUBLIC_*`), never hardcoded in the repo.
- Session handling uses a server-validated mechanism (signed cookie / JWT) — not a client-side flag like `localStorage`.
- **Every admin API route** is protected individually (`/api/orders`, `/api/products`, `/api/applications`, etc.) — protecting the `/admin` page alone is not enough, since API routes can be called directly, bypassing the page entirely.

---

## 10. Product Photography Policy

Photos are AI-generated, high resolution. There is **no strict rule requiring faceless/no-model images** — both human-featured and faceless photography are acceptable. What's still open: whether a consistent approach is applied per category (e.g. formalwear with models, accessories without) or whether it's fully mixed with no pattern. This is a low-risk item (no functional or legal impact — AI generation removes the third-party copyright concern that would otherwise apply to real brand catalog photos) but worth a quick decision for visual consistency across the 21 subcategories.

---

## 11. Remaining Original MVP Blocked Items (still open, not superseded by new modules)

- PostgreSQL local connection inactive → 4 integration tests blocked
- Stripe test-mode → live account + bank connection not yet done