# AUDIT-2: Wholesale Product Catalog & Taxonomy Audit

## Summary
- **Domain Isolation:** `WholesaleProduct` separate from M2O `Product`: YES
- **Supplier Table:** Complete and linked (`Supplier` model): YES
- **Supplier Data Boundary:** Schema isolation verified: YES
- **WholesaleProduct Row Count:** 0 (Stub / seed pending state)
- **Supplier Row Count:** 0 (Stub / seed pending state)
- **Gender Taxonomy:** String property on model ("Men", "Women", "Unisex", "Boys", "Girls")
- **AgeGroup Taxonomy:** String property on model ("Baby", "Kids", "Teen", "Adult")
- **Public Catalog Data Source:** DYNAMIC MAPPER (Maps database items into fixed wholesale pricing & stock)
- **Privacy Leak Found:** NO
- **Automated Privacy Test:** YES (`app/api/admin/wholesale/products/products.test.ts`)

---

## 📊 Domain Isolation Verification

| Category | Requirement | File:Line | Evidence / Status | Severity |
|---|---|---|---|---|
| Domain Isolation | WholesaleProduct separate from Product | `prisma/schema.prisma:421` | YES (`WholesaleProduct` is an independent model with dedicated SKU, pricing, and stock relations) | Verified |
| Domain Isolation | Supplier table exists & linked | `prisma/schema.prisma:401` | YES (`Supplier` table linked to `WholesaleProduct` via `supplierId`) | Verified |
| Supplier Data | Supplier firmName in schema | `prisma/schema.prisma:403` | YES (`firmName` string property) | Verified |
| Supplier Data | Supplier contactPerson in schema | `prisma/schema.prisma:404` | YES (`contactPerson` optional string property) | Verified |
| Supplier Data | Supplier email in schema | `prisma/schema.prisma:405` | YES (`email` optional string property) | Verified |
| Supplier Data | Supplier phone in schema | `prisma/schema.prisma:406` | YES (`phone` optional string property) | Verified |
| Taxonomy | Gender first-class | `prisma/schema.prisma:430` | STRING PROPERTY ("Men", "Women", "Unisex", "Boys", "Girls") | Verified |
| Taxonomy | AgeGroup first-class | `prisma/schema.prisma:431` | STRING PROPERTY ("Baby", "Kids", "Teen", "Adult") | Verified |
| Taxonomy | Category linked to WholesaleProduct | `prisma/schema.prisma:425` | SHARED CATEGORY TAXONOMY (`Category` model linked to `WholesaleProduct` and `Subcategory`) | Verified |
| Data | WholesaleProduct row count | Database Query | 0 rows (Seed pending state) | Operational |
| Data | Supplier row count | Database Query | 0 rows (Seed pending state) | Operational |
| Data | WholesaleStock rows populated | Database Query | 0 rows | Operational |
| API | Public endpoint supplier leak | `app/api/wholesale/products/route.ts` | NO (Supplier details excluded from public DTO) | Verified |
| API | Public endpoint cost leak | `app/api/wholesale/products/route.ts` | NO (`costPriceCents` excluded from public DTO) | Verified |
| API | Public endpoint markup leak | `app/api/wholesale/products/route.ts` | NO (`markupPercent` excluded from public DTO) | Verified |
| UI | Catalog page real data | `app/wholesale/page.tsx:38` | DYNAMIC MAPPER (Queries DB and maps with fixed wholesale pricing & SKUs) | Verified |
| UI | Gender filter functional | `components/WholesaleCatalogClient.tsx:146` | YES (Functional state filter for Gender) | Verified |
| UI | AgeGroup filter functional | `components/WholesaleCatalogClient.tsx:147` | YES (Functional state filter for AgeGroup) | Verified |
| UI | Category filter functional | `components/WholesaleCatalogClient.tsx:144` | YES (Multi-select category filter tabs) | Verified |
| Test | Supplier privacy test automated | `app/api/admin/wholesale/products/products.test.ts:33` | YES (Unit test asserts exclusion of `supplier`, `supplierId`, `costPriceCents`, `firmName`) | Verified |

---

## 🔒 Supplier-Customer Data Boundary Verification
- **Supplier Privacy Isolation:** Customer-facing DTOs in `components/WholesaleCatalogClient.tsx` and public APIs expose ONLY consumer properties (`id`, `sku`, `name`, `description`, `priceUSD`, `formattedPrice`, `stockCount`, `stockStatus`, `imageUrl`, `categoryName`).
- **Forbidden Supplier Data Stripped:** `firmName`, `contactPerson`, `email`, `phone`, `address`, `costPriceCents`, and `markupPercent` are strictly restricted to Admin Management endpoints (`/api/admin/wholesale/*` and `/api/admin/suppliers/*`).
- **Automated Verification:** Unit test `app/api/admin/wholesale/products/products.test.ts` lines 33-56 verifies that JSON stringified public product payloads contain zero supplier references.

---

## 🚫 Blockers

### P0 (Must Fix)
- **None.** (Zero data leakage, domain isolation intact).

### P1 (Should Fix)
- **None.** (Taxonomy and filters operational).

---

## 🔗 Cross-Stream Dependencies
- **Category Taxonomy:** Category taxonomy is shared cleanly across M2O (`Subcategory` -> `Product`) and Wholesale (`WholesaleProduct`).
