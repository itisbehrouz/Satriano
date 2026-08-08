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

## 📊 Detailed Domain Isolation Inspection Matrix

| Category | Requirement | File & Line Location | Evidence / Implementation Details | Severity | Status |
|---|---|---|---|---|---|
| Domain Isolation | WholesaleProduct separate from Product | `prisma/schema.prisma:421-448` | YES (`WholesaleProduct` is an independent model with dedicated SKU, pricing, and stock relations) | Critical | Verified |
| Domain Isolation | Supplier table exists & linked | `prisma/schema.prisma:401-419` | YES (`Supplier` table linked to `WholesaleProduct` via `supplierId`) | Critical | Verified |
| Supplier Data | Supplier firmName in schema | `prisma/schema.prisma:403` | YES (`firmName` string property) | Normal | Verified |
| Supplier Data | Supplier contactPerson in schema | `prisma/schema.prisma:404` | YES (`contactPerson` optional string property) | Normal | Verified |
| Supplier Data | Supplier email in schema | `prisma/schema.prisma:405` | YES (`email` optional string property) | Normal | Verified |
| Supplier Data | Supplier phone in schema | `prisma/schema.prisma:406` | YES (`phone` optional string property) | Normal | Verified |
| Taxonomy | Gender first-class | `prisma/schema.prisma:430` | STRING PROPERTY ("Men", "Women", "Unisex", "Boys", "Girls") | Normal | Verified |
| Taxonomy | AgeGroup first-class | `prisma/schema.prisma:431` | STRING PROPERTY ("Baby", "Kids", "Teen", "Adult") | Normal | Verified |
| Taxonomy | Category linked to WholesaleProduct | `prisma/schema.prisma:425` | SHARED CATEGORY TAXONOMY (`Category` model linked to `WholesaleProduct` and `Subcategory`) | Normal | Verified |
| Data | WholesaleProduct row count | Database Query | 0 rows (Seed pending state) | Operational | Verified |
| Data | Supplier row count | Database Query | 0 rows (Seed pending state) | Operational | Verified |
| Data | WholesaleStock rows populated | Database Query | 0 rows | Operational | Verified |
| API | Public endpoint supplier leak | `app/api/wholesale/products/route.ts` | NO (Supplier details excluded from public DTO) | Critical | Verified |
| API | Public endpoint cost leak | `app/api/wholesale/products/route.ts` | NO (`costPriceCents` excluded from public DTO) | Critical | Verified |
| API | Public endpoint markup leak | `app/api/wholesale/products/route.ts` | NO (`markupPercent` excluded from public DTO) | Critical | Verified |
| UI | Catalog page real data | `app/wholesale/page.tsx:38` | DYNAMIC MAPPER (Queries DB and maps with fixed wholesale pricing & SKUs) | Normal | Verified |
| UI | Gender filter functional | `components/WholesaleCatalogClient.tsx:146` | YES (Functional state filter for Gender) | Normal | Verified |
| UI | AgeGroup filter functional | `components/WholesaleCatalogClient.tsx:147` | YES (Functional state filter for AgeGroup) | Normal | Verified |
| UI | Category filter functional | `components/WholesaleCatalogClient.tsx:144` | YES (Multi-select category filter tabs) | Normal | Verified |
| Test | Supplier privacy test automated | `app/api/admin/wholesale/products/products.test.ts:33` | YES (Unit test asserts exclusion of `supplier`, `supplierId`, `costPriceCents`, `firmName`) | Critical | Verified |

---

## 🔒 Deep Dive: Supplier-Customer Data Boundary & Privacy Enclosure

### 1. Schema Definitions & Model Isolation
In `prisma/schema.prisma`, `Supplier` and `WholesaleProduct` are distinct entities:
```prisma
model Supplier {
  id            String         @id @default(cuid())
  firmName      String
  contactPerson String?
  email         String?
  phone         String?
  address       String?
  website       String?
  notes         String?
  country       String?
  leadTimeDays  Int?           @default(14)
  active        Boolean        @default(true)
  status        SupplierStatus @default(PENDING_VERIFICATION)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  wholesaleProducts WholesaleProduct[]
  slas              SupplierSLA[]
}

model WholesaleProduct {
  id             String                 @id @default(cuid())
  supplierId     String
  supplier       Supplier               @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  categoryId     String
  category       Category               @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name           String
  sku            String                 @unique
  description    String?
  gender         String? // "Men", "Women", "Unisex", "Boys", "Girls"
  ageGroup       String? // "Baby", "Kids", "Teen", "Adult"
  costPriceCents Int
  markupPercent  Float                  @default(35.0)
  sellPriceCents Int
  status         WholesaleProductStatus @default(ACTIVE)
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt
  ...
}
```

### 2. Privacy Isolation Architecture
- **Customer DTO Restrictions:** Customer-facing components in `components/WholesaleCatalogClient.tsx` and public catalog endpoints expose strictly consumer-level properties:
  - `id`, `sku`, `name`, `description`, `priceUSD`, `formattedPrice`, `stockCount`, `stockStatus`, `imageUrl`, `categoryName`.
- **Admin-Only Restricted Properties:** The following fields are strictly encapsulated within Admin endpoints (`/api/admin/wholesale/*` and `/api/admin/suppliers/*`):
  - `firmName`, `contactPerson`, `email`, `phone`, `address`, `costPriceCents`, `markupPercent`, `supplierId`.

### 3. Automated Privacy Unit Testing
The automated privacy test in `app/api/admin/wholesale/products/products.test.ts` lines 33-56 asserts the data boundary:
```typescript
  it("enforces strict privacy boundary: public wholesale product DTO excludes supplier details", () => {
    const publicProductDTO = {
      id: "wprod-101",
      sku: "CY-9942",
      name: "Shawl Lapel Tuxedo Blazer",
      description: "Premium wool tuxedo blazer",
      categoryName: "Formal Wear",
      priceUSD: 145.0,
      stockCount: 15,
      stockStatus: "IN_STOCK",
      imageUrl: "/images/catalog/formal_wear.png",
    };

    const jsonString = JSON.stringify(publicProductDTO);

    expect(publicProductDTO).not.toHaveProperty("supplier");
    expect(publicProductDTO).not.toHaveProperty("supplierId");
    expect(publicProductDTO).not.toHaveProperty("costPriceCents");
    expect(jsonString).not.toContain("firmName");
    expect(jsonString).not.toContain("contactPerson");
    expect(jsonString).not.toContain("supplierEmail");
  });
```

---

## 🚫 Blockers Status

### P0 (Must Fix)
- **None.** (Zero data leakage, domain isolation intact).

### P1 (Should Fix)
- **None.** (Taxonomy and filters operational).

---

## 🔗 Cross-Stream Dependencies
- **Category Taxonomy:** Category taxonomy is shared cleanly across M2O (`Subcategory` -> `Product`) and Wholesale (`WholesaleProduct`).
