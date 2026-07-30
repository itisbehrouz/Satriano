# Satriano Atelier — MVP Architecture Blueprint (v3 — multi-category scope, English-only)

**Scope:** B2B Made-to-Order e-commerce + multi-category product catalog + workflow automation
**Capacity assumption:** Solo developer, ~2 hours/day
**Estimated duration:** 10-14 weeks
**Development environment:** Google Antigravity
**Cost principle:** Zero fixed cost — usage/commission-based services only (Vercel free tier, Supabase free tier, Stripe transaction fees)

> **Why the estimate changed:** The original estimate assumed a "single product type." Now 7 product groups (Tops, Bottoms, Outerwear, Formalwear, Activewear, Underwear & Loungewear, Accessories) and their subcategories/featured pieces are being built as a real, browsable catalog. This is NOT a return to the cancelled first roadmap's scope (state machine, roles, stock tracking — 5.5-7 months) — only the product/category data model and browsing UI are added; the core workflow (proforma → payment → production) still runs through a single order at a time, with no cart.

---

## 1. MVP Scope Boundaries (Current)

- ✅ **Multi-category / subcategory catalog** (7 main groups + subcategories — see Section 4)
- ✅ Single payment method: **Stripe** (domestic + international card acceptance, no monthly fee)
- ✅ Single language (English — customer base is outside Turkey)
- ✅ Simple admin panel (not a separate dashboard, just an `/admin` route in the same app) — includes category/product management but no complex role system
- ✅ Size list is product-specific and editable from the admin panel (no free-text measurement, no hardcoding either)
- ✅ No cart — one product is configured at a time and goes straight to proforma (no multi-item cart flow in the MVP)
- ❌ Second payment method (bank transfer / B2B net terms) — Phase 3
- ❌ Automatic DPI/color checking — Phase 3
- ❌ Advanced search/filtering (price range, multi-filter combinations) — Phase 3; simple category/subcategory browsing is enough to start
- ❌ Self-service customer portal (order history) — Phase 3

---

## 2. Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js (React)** | Frontend + API routes in one project, native fit with Vercel |
| Database | **Supabase (PostgreSQL, free tier)** | Auth, storage, and DB in one service |
| File storage | **Supabase Storage** | For logo/vector files, 1GB free tier |
| PDF generation | **@react-pdf/renderer** or **pdf-lib** | Open source, for the proforma invoice |
| Email | **Resend** (free tier, 3000 emails/month) or **Nodemailer + Gmail SMTP** | For sending the proforma |
| Payment | **Stripe** | Domestic + international card acceptance, no monthly fee |
| Hosting | **Vercel (free tier)** | Native fit for Next.js, automatic deploys |

---

## 3. Folder Structure

```
satriano-atelier/
├── app/
│   ├── page.tsx                    # Homepage (brand intro + category showcase)
│   ├── categories/
│   │   ├── page.tsx                 # List of all product groups (7 main categories)
│   │   └── [categorySlug]/
│   │       └── page.tsx             # Subcategories + featured pieces table
│   ├── configure/
│   │   └── [productId]/page.tsx     # Configurator: size/material + file upload for selected product
│   ├── checkout/
│   │   └── page.tsx                 # Proforma confirmation + Stripe payment
│   ├── order-confirmation/
│   │   └── [orderId]/page.tsx       # Order confirmation page
│   ├── admin/
│   │   ├── page.tsx                 # Order list (status-based filter)
│   │   ├── [orderId]/page.tsx       # Order detail + status update
│   │   └── product-settings/
│   │       ├── page.tsx             # Category/subcategory/product management (list + add/remove)
│   │       └── [productId]/page.tsx # Single product: size list + material options + price
│   └── api/
│       ├── orders/
│       │   ├── route.ts             # POST: create new order
│       │   └── [orderId]/route.ts   # GET/PATCH: order detail/update
│       ├── upload/
│       │   └── route.ts             # POST: file upload (Supabase Storage)
│       ├── proforma/
│       │   └── route.ts             # POST: generate PDF proforma + send email
│       ├── categories/
│       │   └── route.ts             # GET: category/subcategory tree
│       ├── products/
│       │   ├── route.ts             # GET: product list by category, POST: new product (admin)
│       │   └── [productId]/route.ts # GET/PATCH: product info (size list, material options, price)
│       ├── payment/
│       │   ├── create-session/route.ts   # Create Stripe Checkout Session
│       │   └── webhook/route.ts          # Stripe webhook (payment confirmation)
├── lib/
│   ├── supabase.ts                  # Supabase client
│   ├── pricing.ts                   # Pricing formula (product/size/material based)
│   ├── pdf-generator.ts             # Proforma PDF template
│   └── email.ts                     # Email sending function
├── components/
│   ├── CategoryGrid.tsx             # Card grid for homepage/categories page
│   ├── ProductTable.tsx             # Featured-pieces table on the subcategory page
│   ├── ConfiguratorForm.tsx
│   ├── FileUpload.tsx
│   ├── OrderStatusBadge.tsx
│   └── AdminOrderTable.tsx
└── types/
    └── order.ts                     # TypeScript types (Order, Category, Product, OrderStatus)
```

---

## 4. Data Model (Supabase / PostgreSQL)

### `categories` table
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Category ID |
| `name` | text | Product group name (e.g. "Outerwear") |
| `slug` | text (unique) | For URLs (e.g. "outerwear") |
| `parent_id` | uuid (nullable, FK → categories.id) | If a subcategory, reference to the parent category (e.g. "Jackets" → "Outerwear") |
| `sort_order` | integer | Display order |

This single table holds both the 7 main groups (Tops, Bottoms, Outerwear, Formalwear, Activewear, Underwear & Loungewear, Accessories) and their subcategories (Shirts, T-shirts, Knitwear...) via a self-referencing `parent_id` — no separate "subcategory" table needed.

### `products` table (featured pieces — e.g. "Polo shirt")
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Product ID |
| `category_id` | uuid (FK → categories.id) | Which subcategory it belongs to (e.g. "T-shirts") |
| `name` | text | Product name (e.g. "Polo shirt") |
| `base_price` | numeric | Base price |
| `material_options` | jsonb | Material options + price differences |
| `available_sizes` | jsonb | Producible size list (e.g. ["S","M","L","XL"]) + per-size price difference if any |
| `is_active` | boolean | Whether it's shown in the showcase (admin can disable) |

### `orders` table
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Order ID |
| `product_id` | uuid (FK → products.id) | Which product the order is for |
| `customer_name` | text | Customer name |
| `customer_email` | text | Customer email |
| `customer_company` | text (nullable) | B2B company name |
| `size` | text | Selected size (from the producible size list — S/M/L/XL etc.) |
| `quantity` | integer | Quantity per size |
| `material` | text | Selected material |
| `file_url` | text | Supabase Storage URL of the uploaded logo/vector file |
| `price` | numeric | Calculated price |
| `currency` | text | Currency (USD/EUR) |
| `status` | text | `pending` → `proforma_sent` → `paid` → `in_production` → `shipped` |
| `stripe_session_id` | text (nullable) | Stripe Checkout Session reference |
| `created_at` | timestamptz | Creation time |
| `updated_at` | timestamptz | Last update time |

**Note:** No cart — an `orders` row always represents a single configuration for a single `product_id`. If the customer wants a different product, they start a separate order/proforma flow. This is one of the key constraints that keeps the MVP simple.

---

## 5. Main Workflow (End to End)

```
1. Customer on homepage / /categories:
   → Picks one of 7 product groups (e.g. "Outerwear")
   → Sees subcategories + featured pieces table (e.g. "Jackets" → "Bomber jacket")
   → Clicks a product → /configure/[productId]

2. Customer on /configure/[productId]:
   → Selects from producible sizes (size — no free-text measurement)
   → Enters quantity per size
   → Selects material
   → Uploads logo/vector file (FileUpload → /api/upload → Supabase Storage)

3. System:
   → Calculates price (lib/pricing.ts — product's base_price + material/size differences)
   → Creates order record (status: "pending") → /api/orders POST

4. On /checkout:
   → Proforma summary shown
   → Customer confirms → /api/proforma POST
   → PDF proforma generated (lib/pdf-generator.ts)
   → Sent by email (lib/email.ts)
   → status: "proforma_sent"

5. Customer redirected to payment:
   → /api/payment/create-session → Stripe Checkout Session
   → Card details entered on Stripe's own payment page

6. On payment completion:
   → Stripe webhook fires (/api/payment/webhook)
   → status: "paid"
   → Admin notified (optional email)

7. In admin panel (/admin):
   → Order marked "in_production" (manual)
   → Marked "shipped" once production is done (manual)
```

---

## 6. Stripe Integration Notes

- **Checkout Session** is recommended (embedded/redirect, not a hosted page) — Stripe carries the PCI compliance burden, you never touch card data.
- The webhook endpoint (`/api/payment/webhook`) must be tested locally with the Stripe CLI (`stripe listen --forward-to localhost:3000/api/payment/webhook`).
- Simulate the full flow first with free test mode (test API keys); a real Stripe account + bank account connection is required before going live.
- Multiple currencies (USD/EUR) are natively supported by Stripe — MVP can start with one currency and expand later.

---

## 7. Post-MVP (Phase 2/3 — Backlog for now)

- Second payment method (bank transfer / B2B net terms — manual bank reconciliation)
- Automatic email notifications for order status (on every status change)
- Simple stock/capacity tracking
- Advanced search/filtering (by price range, combined multi-filter, search bar)
- Cross-product comparison / outfit-suggestion style showcase enrichments
- Self-service customer portal (view order history)

---

## 8. Getting Started in Antigravity — Suggested Order

1. Set up the Next.js project and connect Supabase (`categories`, `products`, `orders` tables)
2. Seed category data (7 main groups + subcategories, at least a few sample products)
3. `/categories` and `/categories/[categorySlug]` pages (showcase/browsing)
4. `/configure/[productId]` page + `FileUpload` component (Supabase Storage integration)
5. Admin `/product-settings` — category/product management + size list/material/price editing for a single product
6. Pricing function (`lib/pricing.ts`) — base price per product + size/material coefficient formula
7. Proforma PDF generation + email sending
8. Stripe test mode integration (Checkout Session + webhook)
9. Admin order panel (`/admin`) — order list + status update
10. End-to-end test (with test cards) → go live