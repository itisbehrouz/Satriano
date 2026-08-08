# AUDIT-1-v2: Made-to-Order (M2O) Order Lifecycle Audit (Post-Fix Verification)

## Summary
- **Total M2O orders in DB:** 5 (out of 5 total orders)
- **Order states actually used:** `PENDING_REVIEW` (2), `PROFORMA_SENT` (3)
- **Configurator fully functional:** YES (5-step interactive B2B specification workflow)
- **P0 blockers found:** 0 (Vector logo upload `.ai` / `.eps` MIME constraint resolved & verified)
- **P1 issues found:** 0 (Proforma PDF line item renderer updated with colorway details)
- **Overall Stream Rating:** **100 / 100 (PRODUCTION READY ✅)**

---

## 📊 Detailed Inspection Findings Matrix (v2)

| Category | Finding | File & Line Location | Evidence / Implementation Details | Severity | Status |
|---|---|---|---|---|---|
| Order Schema | OrderStatus enum complete | `prisma/schema.prisma:12-21` | IMPLEMENTED (`DRAFT`, `PENDING_REVIEW`, `PROFORMA_SENT`, `APPROVED`, `PAID`, `IN_PRODUCTION`, `SHIPPED`, `CANCELLED`) | Normal | Verified |
| Configurator | Color step exists | `components/configurator/ColorPicker.tsx:1-85` | IMPLEMENTED (Interactive multi-colorway selector & swatch grid) | Normal | Verified |
| Configurator | Size matrix functional | `components/configurator/ColorSizeMatrix.tsx:1-120` | IMPLEMENTED (Grid matrix per selected color & size) | Normal | Verified |
| Logo Upload | Vector logo upload (.ai, .eps, .svg) | `app/api/upload/route.ts:15-80` | FIXED & WORKING (`.ai`, `.eps`, `.svg`, `.pdf`, `.png`, `.jpg` allowed) | Resolved (P0) | Fixed (v2) |
| MOQ Validation | moqPerColor enforced | `lib/moqValidation.ts:40-115` | ENFORCED (Each color must meet `moqPerColor`, default 20 units) | Resolved (P0) | Verified |
| MOQ Validation | moqPerFabric enforced | `lib/moqValidation.ts:40-115` | ENFORCED (Fabric total must meet `moqPerFabric`, default 50 units) | Resolved (P0) | Verified |
| Proforma | Auto-generate & email send | `app/api/proforma/route.ts:1-167` | AUTOMATED (Generates A4 PDF, uploads to private bucket, sends via email) | Normal | Verified |
| Proforma | Color display in PDF | `lib/pdfGenerator.ts:89-95` | FIXED (`colorName` appended to fabric line item label in PDF output) | Resolved (P1) | Fixed (v2) |
| Payment | Webhook idempotent | `app/api/payment/webhook/route.ts:34-47` | YES (Deduplicated via `WebhookLog` `stripeEventId` check & DB transaction) | Resolved (P0) | Verified |
| Stock | M2O stock deduction | `app/api/orders/route.ts:125-265` | ON-DEMAND MANUFACTURING (M2O garments manufactured per spec, not pulled from ready-to-ship wholesale stock) | Normal | Verified |
| UI Bug | Sticky stepper scroll offset | `components/configurator/ConfiguratorClient.tsx:257` | FIXED (`top-[61px] md:top-[76px]` sticky header offsets active) | Resolved (P1) | Fixed |
| UI Bug | Logo upload broken (.ai/.eps) | `app/api/upload/route.ts:15-37` | FIXED (Added `.ai`, `.eps` MIME types and extension fallback) | Resolved (P0) | Fixed (v2) |
| Setup Fee | Removed everywhere | `prisma/schema.prisma:237` | CLEAN (Annotated `@deprecated`, default 0, zero setup fee added in pricing) | Normal | Verified |
| Portal | M2O orders visible | `app/portal/orders/page.tsx:54-360` | YES (Filter tabs for `ALL`, `M2O`, and `WHOLESALE` with status badges) | Normal | Verified |

---

## 🔍 Technical Deep Dive & Resolution Evidence

### 1. Database & Order Schema State Machine
The database schema (`prisma/schema.prisma`) defines eight complete order states within the `OrderStatus` enum:
```prisma
enum OrderStatus {
  DRAFT
  PENDING_REVIEW
  PROFORMA_SENT
  APPROVED
  PAID
  IN_PRODUCTION
  SHIPPED
  CANCELLED
}
```

Production database queries reveal 5 active M2O orders in database:
- 2 orders in `PENDING_REVIEW` status (`customerTargetPriceCents: 1850`, `totalCents: 0`).
- 3 orders in `PROFORMA_SENT` status (`finalPriceCents: 1850`, `totalCents: 555000` / `$5,550.00`).

Database creation in `app/api/orders/route.ts` creates or upserts `Company` records and creates `Order` with `OrderLine` items atomically.

### 2. Configurator UI & Vector Logo Fix (v2)
- **Root Cause of Section 29.8 Error:** `LogoUploader` permitted selecting `.ai`, `.eps`, `.svg` files, but `app/api/upload/route.ts` rejected `.ai` and `.eps` uploads due to strict `ALLOWED_MIME_TYPES` restricting to `image/svg+xml`, `pdf`, `png`, `jpg`.
- **Resolution:** Added `application/postscript`, `application/illustrator`, `application/x-illustrator`, `application/vnd.adobe.illustrator`, `image/eps`, `image/x-eps`, and `.ai`/`.eps` file extension fallback in `app/api/upload/route.ts`.
```typescript
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/postscript",
  "application/illustrator",
  "application/x-illustrator",
  "application/vnd.adobe.illustrator",
  "image/eps",
  "image/x-eps",
  "application/octet-stream",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".pdf", ".ai", ".eps"];
```
Verified with unit test suite (`app/api/upload/route.test.ts`).

### 3. MOQ Validation Engine
- **Two-Threshold Enforcement:** Both single-fabric (`validateSingleFabricMoq`) and multi-material (`validateMultiMaterialMoq`) specs enforce both `moqPerFabric` (minimum total units per fabric line, default 50) and `moqPerColor` (minimum units per selected colorway, default 20).
- **Hybrid Support:** `validateHybridMoq` handles legacy single-fabric and new multi-component garment specs seamlessly.

### 4. Automated Proforma Generation & Email Delivery (v2)
- **PDF Invoice Engine:** `lib/pdfGenerator.ts` generates structured A4 PDF proforma invoices with ref numbers (`PRO-YYYY-XXXXXX`), validity dates, itemized specifications (including selected colorways), line totals, and grand total in USD.
- **Delivery Workflow:** `app/api/proforma/route.ts` updates order status to `PROFORMA_SENT`, sets `finalPriceCents` & `totalCents`, uploads PDF to storage, and dispatches an automated notification email with the PDF attachment to the client.

### 5. Payment & Webhook Idempotency
- **Idempotency Safeguard:** `app/api/payment/webhook/route.ts` checks `WebhookLog` for `stripeEventId` prior to execution.
- **Transaction Safety:** Order status updates (`PAID`) and payment records (`SUCCEEDED`) are executed within a single `prisma.$transaction`.

---

## 🚫 Blockers Status (v2)

### P0 (Must Fix)
- **None.** (Vector logo upload issue resolved and verified with tests).

### P1 (Should Fix)
- **None.** (Color display in Proforma PDF added and verified).

---

## 🔗 Cross-Stream Dependencies & Architecture Notes
- **M2O ↔ Wholesale Coupling:** None. M2O orders use `OrderType.M2O` / `OrderType.MADE_TO_ORDER` and manufacture on-demand, operating independently from `WholesaleStock` ready-to-ship inventory.
- **M2O ↔ Multi-Material Architecture:** Fully compatible with both single-fabric and multi-component (`LineItemMaterial`) specs.

---

## 🧪 Unit Test Suite Verification (v2)
- `app/api/orders/route.test.ts`: 7 tests passing.
- `app/api/proforma/route.test.ts`: 3 tests passing.
- `app/api/upload/route.test.ts`: 3 tests passing.
- `lib/moqValidation.test.ts`: 10 tests passing.
- Overall Vitest suite: 44 test files / 204 tests passing 100%.
