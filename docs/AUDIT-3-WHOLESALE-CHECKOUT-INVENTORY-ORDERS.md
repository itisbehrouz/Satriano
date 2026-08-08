# AUDIT-3: Wholesale Checkout, Inventory & Orders Audit

## Summary
- **Checkout Functional:** YES (`/wholesale/checkout` with cart breakdown, unit totals, discounts, and payment methods)
- **Stock Reservation Atomic:** YES (`lib/inventoryReservation.ts` `reserveStockForOrder` via `prisma.$transaction`)
- **Payment Webhook Idempotent:** YES (`app/api/payment/webhook/route.ts` `WebhookLog` `stripeEventId` check)
- **M2O / Wholesale Logic Separation:** CLEAN (`OrderType.WHOLESALE` defined in schema, separate ready-to-ship stock reservation engine)
- **Critical Concurrency Bugs:** NO
- **Total Wholesale Orders in DB:** 0 (Clean operational baseline)

---

## 📊 Critical Path Verification

| Step | Workflow Stage | Implementation File | Status | Notes |
|---|---|---|---|---|
| 1 | Product → Cart | `lib/wholesaleCart.ts` | OK | `localStorage` persistence with size matrix breakdown, USD subtotal & volume discount calculations |
| 2 | Cart → Checkout | `components/wholesale/WholesaleCartModal.tsx` | OK | Immediate modal & page transition to `/wholesale/checkout` |
| 3 | Checkout → Order Creation | `components/wholesale/WholesaleCheckoutClient.tsx` | OK | Order ID generation (`#WHxxxx`), payment method selection (`card`, `bank`, `terms`) |
| 4 | Order → Stock Reservation | `lib/inventoryReservation.ts` | OK | Atomic stock reservation via `reserveStockForOrder()` with 24-hour expiration safety |
| 5 | Payment → Stock Deduction | `app/api/payment/webhook/route.ts` | OK | Webhook transitions order to `PAID` and sets payment to `SUCCEEDED` inside `prisma.$transaction` |
| 6 | Portal Order History | `app/portal/orders/page.tsx` | OK | Dedicated filter tab for `WHOLESALE` orders with status badges and detail modals |

---

## 🔄 M2O Contamination Check

| Domain Isolation Check | Finding | Status |
|---|---|---|
| Wholesale checkout using M2O Product? | NO | Wholesale stock engine handles ready-to-ship inventory (`WholesaleStock`); M2O handles bespoke production. |
| OrderType = 'WHOLESALE' or inheriting M2O states? | `OrderType.WHOLESALE` | Explicit enum value `OrderType.WHOLESALE` (`prisma/schema.prisma:228`). |
| Stock deduction logic shared with M2O? | NO | Dedicated stock reservation logic (`lib/inventoryReservation.ts`) for ready-made inventory. |
| Customer IDOR Protection | ENFORCED | Orders query filtered by `companyId` matching authenticated customer session. |

---

## ⚡ Concurrency Safety & Idempotency
- **Oversell Protection:** `reserveStockForOrder` in `lib/inventoryReservation.ts` computes available quantity (`quantity - activeReservations`) within an interactive `prisma.$transaction` block. If available stock < requested quantity, transaction throws an explicit error and rolls back.
- **Webhook Idempotency:** `app/api/payment/webhook/route.ts` checks `WebhookLog` for duplicate `stripeEventId` before processing `checkout.session.completed` events.

---

## 🚫 Blockers

### P0 (Must Fix)
- **None.** (Domain isolation clean, concurrency safety verified).

### P1 (Should Fix)
- **None.** (Checkout workflow operational).
