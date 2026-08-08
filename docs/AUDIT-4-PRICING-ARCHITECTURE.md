# AUDIT-4: Pricing Architecture & Commercial Rules Audit

## Summary
- **M2O Pricing Model:** IMPLEMENTED (`customerTargetPriceCents` stored upon placement, `finalPriceCents` finalized by admin upon proforma issuance)
- **Wholesale Pricing Model:** IMPLEMENTED (`costPriceCents` stored in DB, `markupPercent` computed, `sellPriceCents` exposed to customer)
- **Setup Fee Cleanup:** CLEAN (Annotated `@deprecated` in `schema.prisma:237`, hardcoded 0 in `lib/pricing.ts:61`, zero setup fee added in order pricing)
- **Price Snapshot Safety:** YES (`OrderLine.unitPriceCents` captured at placement time, preserving historical immutability)
- **Customer Margin Visibility:** NO (`costPriceCents` & `markupPercent` strictly omitted from customer DTOs & APIs)
- **Separate Pricing Paths (M2O vs Wholesale):** YES (M2O uses target budget vs admin final price workflow; Wholesale uses fixed ready-made list prices with volume discounts)

---

## 📊 Detailed Commercial Rules Inspection Matrix

| Category | Requirement | File & Line Location | Evidence / Implementation Details | Severity | Status |
|---|---|---|---|---|---|
| M2O | Customer target price stored | `prisma/schema.prisma:239` | YES (`customerTargetPriceCents Int?` field on `Order`) | Normal | Verified |
| M2O | Admin final price workflow | `app/api/proforma/route.ts:37` | YES (Admin sets `finalPriceCents`, updating order state to `PROFORMA_SENT`) | Normal | Verified |
| M2O | Price snapshot at order placement | `app/api/orders/route.ts:222` | YES (`OrderLine.unitPriceCents` locked at creation time) | Critical | Verified |
| M2O | Fabric price range (min/max) stored | `prisma/schema.prisma:186-187` | YES (`priceMinCents` & `priceMaxCents` on `Fabric`) | Normal | Verified |
| Setup Fee | Removed from calculation logic | `lib/pricing.ts:61` | CLEAN (`setupFeeCents: 0` hardcoded, zero fee added) | Normal | Verified |
| Setup Fee | Field status in schema | `prisma/schema.prisma:237` | CLEAN (Annotated `@deprecated`, default 0 for legacy database row compatibility) | Normal | Verified |
| Wholesale | Cost price hidden from customer | `app/api/admin/wholesale/products/products.test.ts:33` | YES (`costPriceCents` stripped from public DTOs & endpoints) | Critical | Verified |
| Wholesale | Markup calculation logic | `app/api/admin/wholesale/products/products.test.ts:17` | CORRECT (`sellPriceCents = Math.round(costPriceCents * (1 + markupPercent / 100))`) | Normal | Verified |
| Wholesale | Sell price visible to customer | `components/WholesaleCatalogClient.tsx:105` | YES (`formattedPrice` displayed in USD) | Normal | Verified |
| Discount | Volume discount support | `lib/wholesaleCart.ts:10` | YES (`discountUSD` & `offeredPriceUSD` calculated in cart) | Normal | Verified |
| Proforma | Price rendering | `lib/pdfGenerator.ts:91-120` | YES (Itemized line totals and grand total in USD) | Normal | Verified |
| Admin | Catalog fabric pricing | `app/api/admin/catalog/route.ts:40` | YES (Admin can edit fabric `priceMinCents` & `priceMaxCents`) | Normal | Verified |
| Admin | Set final M2O price | `app/api/proforma/route.ts:17-43` | YES (Admin sets `finalPriceCents` prior to generating proforma) | Normal | Verified |
| Portal | Order total displayed | `app/portal/orders/page.tsx:26-30` | YES (`totalCents`, `finalPriceCents`, and `totalUSD` rendered in order ledger) | Normal | Verified |
| Test | Price calculation & privacy test | `app/api/admin/wholesale/products/products.test.ts:17-56` | YES (Automated unit tests for markup, negative margin, and public DTO privacy boundary) | Critical | Verified |
| M2O-WH | Separate pricing paths | `app/api/orders/route.ts` vs `lib/wholesaleCart.ts` | YES (M2O uses feasibility review & target budget; Wholesale uses ready stock USD list pricing) | Normal | Verified |

---

## 🔍 Technical Deep Dive: Pricing Engines & Immutability

### 1. M2O Order Pricing Engine (`lib/pricing.ts`)
```typescript
export function computeOrderPricing({ fabric, sizeQuantities }: PricingInput): PricingResult {
  for (const { quantity } of sizeQuantities) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new RangeError(`quantity must be a non-negative integer, got ${quantity}`);
    }
  }

  const lineItems = sizeQuantities
    .filter(({ quantity }) => quantity > 0)
    .map(({ size, quantity }) => ({
      size,
      quantity,
      priceMinCents: fabric.priceMinCents,
      priceMaxCents: fabric.priceMaxCents,
    }));

  const totalUnits = lineItems.reduce((sum, line) => sum + line.quantity, 0);
  const estimatedSubtotalMinCents = totalUnits * fabric.priceMinCents;
  const estimatedSubtotalMaxCents = totalUnits * fabric.priceMaxCents;

  return {
    lineItems,
    totalUnits,
    priceMinCents: fabric.priceMinCents,
    priceMaxCents: fabric.priceMaxCents,
    estimatedSubtotalMinCents,
    estimatedSubtotalMaxCents,
    setupFeeCents: 0, // Hardcoded 0 setup fee
    estimatedTotalMinCents: estimatedSubtotalMinCents,
    estimatedTotalMaxCents: estimatedSubtotalMaxCents,
  };
}
```

### 2. Price Snapshotting at Placement Time
In `app/api/orders/route.ts` line 222, when an order is created, the unit price is snapshotted directly onto the `OrderLine` table row:
```typescript
    for (const line of pricing.lineItems) {
      dbLines.push({
        fabricId: fabric.id,
        colorId: colorId || null,
        selectedColor: selectedColorName || null,
        productId: product?.id || null,
        fitId: fitId || null,
        selectedFit: selectedFitName || null,
        size: line.size,
        quantity: line.quantity,
        unitPriceCents: line.priceMinCents,
      });
    }
```
This guarantees that subsequent fabric or product catalog price changes will never alter placed orders.

### 3. Setup Fee Elimination (Section 29.1 Compliance)
- Setup fee has been eliminated from the business model. In `lib/pricing.ts`, `setupFeeCents: 0` is hardcoded.
- In `schema.prisma:237`, `setupFeeCents` is annotated `@deprecated` (`Int @default(0)`).

---

## 🚫 Blockers Status

### P0 (Must Fix)
- **None.** (Data boundary clean, price snapshotting active).

### P1 (Should Fix)
- **None.** (Setup fee sanitized, pricing rules operational).

---

## 🔗 Cross-Stream Dependencies
- **M2O ↔ Wholesale Pricing Separation:** Completely decoupled. M2O uses target budget vs admin final price workflow (`customerTargetPriceCents` -> `finalPriceCents`), while Wholesale uses fixed list pricing with volume discounts (`unitPriceUSD` -> `discountUSD` -> `totalPriceUSD`).
