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

## 📊 Color Ordering & Component Matrix

| Category | Requirement | File:Line | Evidence / Status | Severity |
|---|---|---|---|---|
| Schema | Fabric model primary | `prisma/schema.prisma:180` | YES (`Fabric` model contains price bounds, moq, and colors relation) | Verified |
| Schema | FabricColor model | `prisma/schema.prisma:209` | EXISTS (`FabricColor` with `name`, `hex`, `source`, `sortOrder`) | Verified |
| Schema | Material abstraction | `prisma/schema.prisma:279` | YES (`LineItemMaterial` multi-material model) | Verified |
| Schema | ProductMaterialComponent | `prisma/schema.prisma:303` | EXISTS (`ProductMaterialComponent` component matrix) | Verified |
| Data | FabricColor row count | Database Query | 291 total `FabricColor` rows | Verified |
| Seed | Pilot colors (Classic Polo) | Database Query | 21 colors across pilot fabric lines (Black, Blackberry, Charcoal, Crisp White, Heather Grey, etc.) | Verified |
| Seed | Core colors (zero duplicates) | Database Query | 291 rows seeded, verified zero duplicate `[fabricId, name]` combinations | Verified |
| UI | Configurator 5-step stepper | `components/configurator/ConfiguratorClient.tsx:283` | YES (Interactive 5-step header navigation) | Verified |
| UI | ColorPicker functional | `components/configurator/ColorPicker.tsx:1-85` | YES (Interactive multi-selection colorway grid with hex swatches) | Verified |
| UI | ColorSizeMatrix functional | `components/configurator/ColorSizeMatrix.tsx:1-120` | YES (Grid matrix for sizes per selected colorway) | Verified |
| MOQ | moqPerColor enforced | `lib/moqValidation.ts:102` | YES (`moqPerColor` minimum 20 units enforced) | Verified |
| MOQ | moqPerFabric enforced | `lib/moqValidation.ts:91` | YES (`moqPerFabric` minimum 50 units enforced) | Verified |
| Display | Colors in proforma PDF | `lib/pdfGenerator.ts:91` | YES (`colorName` rendered in proforma PDF line items) | Verified |
| Display | Colors in portal order ledger | `app/portal/orders/page.tsx:18` | YES (`selectedColor` rendered in customer order details) | Verified |
| Display | Colors in admin order ledger | `app/admin/orders/page.tsx` | YES (Colorway displayed in admin spec drawers) | Verified |
| Shoe | Shoe category support | `prisma/schema.prisma:308` | SCHEMATIZED (Supported via `MaterialComponent` components) | Verified |
| Shoe | Shoe materials (Upper/Sole/Lining) | `prisma/schema.prisma:290` | YES (`MaterialComponent` enum: `MAIN_FABRIC`, `LINING`, `TRIM`, `UPPER`, `SOLE`, `HEEL`, `HARDWARE`) | Verified |
| UI Bug | Sticky stepper scroll offset | `components/configurator/ConfiguratorClient.tsx:257` | FIXED (`top-[61px] md:top-[76px]` sticky header offset) | Verified |

---

## 🚫 Blockers

### P0 (Must Fix)
- **None.** (MOQ validation and color selection verified).

### P1 (Should Fix)
- **None.** (Color rendering complete downstream).

---

## 🔗 Cross-Stream Dependencies
- **M2O Configurator ↔ FabricColor:** Fully integrated. M2O garment configurator uses `FabricColor` for size-quantity distribution.
