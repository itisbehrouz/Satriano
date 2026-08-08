# AUDIT-4: Pricing Architecture & Commercial Rules Audit

## Summary
- **M2O Pricing Model:** IMPLEMENTED (`customerTargetPriceCents` stored upon placement, `finalPriceCents` finalized by admin upon proforma issuance)
- **Wholesale Pricing Model:** IMPLEMENTED (`costPriceCents` stored in DB, `markupPercent` computed, `sellPriceCents` exposed to customer)
- **Setup Fee Cleanup:** CLEAN (Annotated `@deprecated` in `schema.prisma:237`, hardcoded 0 in `lib/pricing.ts:61`, zero setup fee added in order pricing)
- **Price Snapshot Safety:** YES (`OrderLine.unitPriceCents` captured at placement time, preserving historical immutability)
- **Customer Margin Visibility:** NO (`costPriceCents` & `markupPercent` strictly omitted from customer DTOs & APIs)
- **Separate Pricing Paths (M2O vs Wholesale):** YES (M2O uses target budget vs admin final price workflow; Wholesale uses fixed ready-made list prices with volume discounts)

---

## 📊 Commercial Rules Inspection Matrix

| Category | Requirement | File:Line | Evidence / Status | Severity |
|---|---|---|---|---|
| M2O | Customer target price stored | `prisma/schema.prisma:239` | YES (`customerTargetPriceCents Int?` field on `Order`) | Verified |
| M2O | Admin final price workflow | `app/api/proforma/route.ts:37` | YES (Admin sets `finalPriceCents`, updating order state to `PROFORMA_SENT`) | Verified |
| M2O | Price snapshot at order placement | `app/api/orders/route.ts:222` | YES (`OrderLine.unitPriceCents` locked at creation time) | Verified |
| M2O | Fabric price range (min/max) stored | `prisma/schema.prisma:186-187` | YES (`priceMinCents` & `priceMaxCents` on `Fabric`) | Verified |
| Setup Fee | Removed from calculation logic | `lib/pricing.ts:61` | CLEAN (`setupFeeCents: 0` hardcoded, zero fee added) | Verified |
| Setup Fee | Field status in schema | `prisma/schema.prisma:237` | CLEAN (Annotated `@deprecated`, default 0 for legacy database row compatibility) | Verified |
| Wholesale | Cost price hidden from customer | `app/api/admin/wholesale/products/products.test.ts:33` | YES (`costPriceCents` stripped from public DTOs & endpoints) | Verified |
| Wholesale | Markup calculation logic | `app/api/admin/wholesale/products/products.test.ts:17` | CORRECT (`sellPriceCents = Math.round(costPriceCents * (1 + markupPercent / 100))`) | Verified |
| Wholesale | Sell price visible to customer | `components/WholesaleCatalogClient.tsx:105` | YES (`formattedPrice` displayed in USD) | Verified |
| Discount | Volume discount support | `lib/wholesaleCart.ts:10` | YES (`discountUSD` & `offeredPriceUSD` calculated in cart) | Verified |
| Proforma | Price rendering | `lib/pdfGenerator.ts:91-120` | YES (Itemized line totals and grand total in USD) | Verified |
| Admin | Catalog fabric pricing | `app/api/admin/catalog/route.ts:40` | YES (Admin can edit fabric `priceMinCents` & `priceMaxCents`) | Verified |
| Admin | Set final M2O price | `app/api/proforma/route.ts:17-43` | YES (Admin sets `finalPriceCents` prior to generating proforma) | Verified |
| Portal | Order total displayed | `app/portal/orders/page.tsx:26-30` | YES (`totalCents`, `finalPriceCents`, and `totalUSD` rendered in order ledger) | Verified |
| Test | Price calculation & privacy test | `app/api/admin/wholesale/products/products.test.ts:17-56` | YES (Automated unit tests for markup, negative margin, and public DTO privacy boundary) | Verified |
| M2O-WH | Separate pricing paths | `app/api/orders/route.ts` vs `lib/wholesaleCart.ts` | YES (M2O uses feasibility review & target budget; Wholesale uses ready stock USD list pricing) | Verified |

---

## 🔒 Margin Security & Immutability Audit

### 1. Customer Privacy Boundary Protection
- **Restricted Fields:** `costPriceCents`, `markupPercent`, and `supplierId` are strictly encapsulated within Admin endpoints (`/api/admin/wholesale/*` and `/api/admin/suppliers/*`).
- **Public DTO Verification:** Unit test `app/api/admin/wholesale/products/products.test.ts` lines 33-56 asserts that customer-facing JSON product objects contain zero cost or margin keys.

### 2. Price Immutability at Placement
- **OrderLine Snapshot:** When an M2O or Wholesale order is submitted, the unit price at that exact timestamp is snapshotted into `OrderLine.unitPriceCents`. Subsequent catalog price modifications do NOT retroactively alter historical order line items.

### 3. Setup Fee Elimination (Section 29.1 Compliance)
- Setup fees have been eliminated from the business model. In `lib/pricing.ts`, `setupFeeCents: 0` is hardcoded. Zero setup fee is charged or added to order totals.

---

## 🚫 Blockers

### P0 (Must Fix)
- **None.** (Data boundary clean, price snapshotting active).

### P1 (Should Fix)
- **None.** (Setup fee sanitized, pricing rules operational).

---

## 🔗 Cross-Stream Dependencies
- **M2O ↔ Wholesale Pricing Separation:** Completely decoupled. M2O uses target budget vs admin final price workflow (`customerTargetPriceCents` -> `finalPriceCents`), while Wholesale uses fixed list pricing with volume discounts (`unitPriceUSD` -> `discountUSD` -> `totalPriceUSD`).
