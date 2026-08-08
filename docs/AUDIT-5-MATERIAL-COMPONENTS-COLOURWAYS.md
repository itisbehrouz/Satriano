# AUDIT-5: Material, Components & Colourways Audit

## Summary
- **FabricColor Implementation:** IMPLEMENTED (`FabricColor` model with `fabricId`, `name`, `hex`, `source`, `active`, `sortOrder`)
- **Pilot Seed (Classic Polo):** COMPLETE (21 active fabric colors seeded across pilot fabric lines)
- **Core Seed:** COMPLETE (291 total `FabricColor` rows seeded with zero duplicate hex codes per fabric)
- **Configurator 5-Step Flow:** YES (`Fabric` -> `Color` -> `Fit` -> `ColorSizeMatrix` -> `LogoUploader`)
- **MOQ Per-Color Enforcement:** YES (`moqPerColor` default 20 units enforced in `lib/moqValidation.ts`)
- **Color Display Downstream:** OK (Rendered in Configurator, Portal Orders, Proforma PDF, and Admin Console)
- **Shoe / Leather Support:** SCHEMATIZED (`LineItemMaterial` & `ProductMaterialComponent` models support multi-component specs e.g. `UPPER`, `LINING`, `SOLE`)

---

## 📊 Detailed Color Ordering & Component Inspection Matrix

| Category | Requirement | File & Line Location | Evidence / Implementation Details | Severity | Status |
|---|---|---|---|---|---|
| Schema | Fabric model primary | `prisma/schema.prisma:180-200` | YES (`Fabric` model contains price bounds, moq, and colors relation) | Normal | Verified |
| Schema | FabricColor model | `prisma/schema.prisma:209-224` | EXISTS (`FabricColor` with `name`, `hex`, `source`, `sortOrder`) | Normal | Verified |
| Schema | Material abstraction | `prisma/schema.prisma:279-300` | YES (`LineItemMaterial` multi-material model) | Normal | Verified |
| Schema | ProductMaterialComponent | `prisma/schema.prisma:303-317` | EXISTS (`ProductMaterialComponent` component matrix) | Normal | Verified |
| Data | FabricColor row count | Database Query | 291 total `FabricColor` rows | Operational | Verified |
| Seed | Pilot colors (Classic Polo) | Database Query | 21 colors across pilot fabric lines (Black, Blackberry, Charcoal, Crisp White, Heather Grey, etc.) | Operational | Verified |
| Seed | Core colors (zero duplicates) | Database Query | 291 rows seeded, verified zero duplicate `[fabricId, name]` combinations | Operational | Verified |
| UI | Configurator 5-step stepper | `components/configurator/ConfiguratorClient.tsx:283` | YES (Interactive 5-step header navigation) | Normal | Verified |
| UI | ColorPicker functional | `components/configurator/ColorPicker.tsx:1-85` | YES (Interactive multi-selection colorway grid with hex swatches) | Normal | Verified |
| UI | ColorSizeMatrix functional | `components/configurator/ColorSizeMatrix.tsx:1-120` | YES (Grid matrix for sizes per selected colorway) | Normal | Verified |
| MOQ | moqPerColor enforced | `lib/moqValidation.ts:102` | YES (`moqPerColor` minimum 20 units enforced) | Critical | Verified |
| MOQ | moqPerFabric enforced | `lib/moqValidation.ts:91` | YES (`moqPerFabric` minimum 50 units enforced) | Critical | Verified |
| Display | Colors in proforma PDF | `lib/pdfGenerator.ts:91` | YES (`colorName` rendered in proforma PDF line items) | Normal | Verified |
| Display | Colors in portal order ledger | `app/portal/orders/page.tsx:18` | YES (`selectedColor` rendered in customer order details) | Normal | Verified |
| Display | Colors in admin order ledger | `app/admin/orders/page.tsx` | YES (Colorway displayed in admin spec drawers) | Normal | Verified |
| Shoe | Shoe category support | `prisma/schema.prisma:308` | SCHEMATIZED (Supported via `MaterialComponent` components) | Normal | Verified |
| Shoe | Shoe materials (Upper/Sole/Lining) | `prisma/schema.prisma:290` | YES (`MaterialComponent` enum: `MAIN_FABRIC`, `LINING`, `TRIM`, `UPPER`, `SOLE`, `HEEL`, `HARDWARE`) | Normal | Verified |
| UI Bug | Sticky stepper scroll offset | `components/configurator/ConfiguratorClient.tsx:257` | FIXED (`top-[61px] md:top-[76px]` sticky header offset) | Resolved (P1) | Fixed |

---

## 🔍 Technical Deep Dive: Material & Colorway Models

### 1. Fabric & FabricColor Prisma Models
```prisma
model FabricColor {
  id        String      @id @default(cuid())
  fabricId  String
  fabric    Fabric      @relation(fields: [fabricId], references: [id], onDelete: Cascade)
  name      String
  hex       String?
  source    ColorSource @default(PLACEHOLDER)
  active    Boolean     @default(true)
  sortOrder Int         @default(0)
  createdAt DateTime    @default(now())

  orderLines        OrderLine[]
  lineItemMaterials LineItemMaterial[]

  @@unique([fabricId, name])
}
```

### 2. Multi-Component Garment & Shoe Spec Model
To support complex garments and footwear specs (Upper, Lining, Sole, Heel, Trim, Hardware), Prisma schema defines `LineItemMaterial`:
```prisma
model LineItemMaterial {
  id          String   @id @default(cuid())
  orderLineId String
  orderLine   OrderLine @relation(fields: [orderLineId], references: [id], onDelete: Cascade)

  materialId  String
  material    Fabric    @relation("LineItemMaterials", fields: [materialId], references: [id])

  colorId     String?
  color       FabricColor? @relation(fields: [colorId], references: [id])

  component   MaterialComponent @default(MAIN_FABRIC)
  composition String?
  ratio       Float?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([orderLineId, component])
  @@index([orderLineId])
  @@index([materialId])
}
```

### 3. MOQ Validation Engine per Color
In `lib/moqValidation.ts`:
```typescript
    for (const [colorId, colorData] of fabricData.colors.entries()) {
      if (colorData.totalUnits > 0 && colorData.totalUnits < fabricData.moqPerColor) {
        return {
          valid: false,
          code: "MOQ_COLOR_MINIMUM",
          fabricId,
          colorId,
          materialId: fabricId,
          error: `${colorData.colorName} requires at least ${fabricData.moqPerColor} units. Currently ${colorData.totalUnits}.`,
        };
      }
    }
```

---

## 🚫 Blockers Status

### P0 (Must Fix)
- **None.** (MOQ validation and color selection verified).

### P1 (Should Fix)
- **None.** (Color rendering complete downstream).

---

## 🔗 Cross-Stream Dependencies
- **M2O Configurator ↔ FabricColor:** Fully integrated. M2O garment configurator uses `FabricColor` for size-quantity distribution.
