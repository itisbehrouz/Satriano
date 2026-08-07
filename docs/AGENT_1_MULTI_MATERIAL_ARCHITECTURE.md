# AGENT 1 — MULTI-MATERIAL COMPONENT ARCHITECTURE

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Implement component-level material support across Satriano. Enable garments with multiple material components (leather shell + silk lining, wool body + cashmere blend + viscose lining).

**Scope:** Prisma schema extension, order validation, configurator UI prep, admin UI prep. **Execute all phases without any confirmations.**

---

## PHASE 1: DATABASE SCHEMA MIGRATION

### 1.1 Extend Prisma Schema (`prisma/schema.prisma`)

Add new models **after** existing `Fabric` and `FabricColor` models, **before** `Order` model:

```prisma
// ============================================================================
// MATERIAL COMPONENT ARCHITECTURE
// ============================================================================

/// Component types for multi-material garments (e.g., SHELL, LINING, TRIM, SOLE)
enum MaterialComponent {
  MAIN_FABRIC
  LINING
  TRIM
  COLLAR
  CUFF
  SOLE
  HEEL
  UPPER
  BACKING
  FILL
  INTERFACING
  BINDING
  LABEL
  OTHER
}

/// Color source tracking for material procurement
enum ColorSource {
  PLACEHOLDER        // Seed data / example colorways
  SUPPLIER_VERIFIED  // Verified with supplier, in stock
  MANUAL_OVERRIDE    // Admin manually entered hex
}

/// Extended FabricColor model to track color source
model FabricColor {
  id String @id @default(cuid())
  fabricId String
  fabric Fabric @relation(fields: [fabricId], references: [id], onDelete: Cascade)
  
  name String
  hex String @db.VarChar(7) // e.g., "#0B1E3D"
  source ColorSource @default(PLACEHOLDER)
  
  orderLines OrderLine[]
  lineItemMaterials LineItemMaterial[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([fabricId, hex]) // No duplicate hex colors per fabric
  @@index([fabricId])
}

/// Line-item material assignments (supports multi-material specs)
model LineItemMaterial {
  id String @id @default(cuid())
  orderLineId String
  orderLine OrderLine @relation(fields: [orderLineId], references: [id], onDelete: Cascade)
  
  materialId String
  material Fabric @relation("LineItemMaterials", fields: [materialId], references: [id])
  
  colorId String?
  color FabricColor? @relation(fields: [colorId], references: [id])
  
  component MaterialComponent @default(MAIN_FABRIC)
  composition String? // e.g., "80% Wool / 20% Cashmere" or "100% Genuine Leather"
  ratio Float? // e.g., 0.80 for 80% of line item quantity
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([orderLineId, component])
  @@index([orderLineId])
  @@index([materialId])
}

/// Product material compatibility matrix
model ProductMaterialComponent {
  id String @id @default(cuid())
  productId String
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  component MaterialComponent
  isRequired Boolean @default(false)
  allowedMaterialIds String[] // FK array: ["fabric_id_1", "fabric_id_2"]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([productId, component])
  @@index([productId])
}
```

### 1.2 Update Existing Models

**Update `OrderLine` model** (find existing OrderLine, modify):

```prisma
model OrderLine {
  id String @id @default(cuid())
  orderId String
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  productId String
  product Product @relation(fields: [productId], references: [id])
  
  // LEGACY: Keep for backward compatibility, but prefer LineItemMaterial
  fabricId String?
  selectedColor FabricColor? @relation(fields: [fabricId], references: [id])
  
  // NEW: Multi-material support
  materials LineItemMaterial[]
  
  selectedFit String?
  size String
  quantity Int @default(1)
  unitPriceCents Int
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderId])
  @@index([productId])
  @@index([fabricId])
}
```

**Update `Fabric` model** (find existing Fabric, extend):

```prisma
model Fabric {
  id String @id @default(cuid())
  name String @unique
  
  // PRICING
  priceMinCents Int @default(2500)
  priceMaxCents Int @default(4500)
  
  // MOQ
  moqPerColor Int @default(20)
  moqPerFabric Int @default(50)
  moqCombinedMultiFabric Int? // Optional: combined multi-fabric MOQ
  
  // DEPRECATED (keep for backward compat)
  setupFeeCents Int @default(0)
  colorway String? // Deprecated: use FabricColor relation
  
  // Relations
  colors FabricColor[]
  lineItemMaterials LineItemMaterial[] @relation("LineItemMaterials")
  productComponents ProductMaterialComponent[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Update `Product` model** (find existing Product, extend):

```prisma
model Product {
  id String @id @default(cuid())
  name String
  subcategoryId String
  subcategory Subcategory @relation(fields: [subcategoryId], references: [id])
  
  // EXISTING FIELDS
  fabrics Fabric[]
  fits ProductFit[]
  orderLines OrderLine[]
  
  // MOQ
  moqPerFabric Int @default(50)
  moqPerColor Int @default(20)
  moqCombinedMultiFabric Int? // Combined MOQ across all materials
  
  // NEW: Material component requirements
  materialComponents ProductMaterialComponent[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([subcategoryId])
}
```

### 1.3 Generate & Apply Migration

```bash
# Generate migration
npx prisma migrate dev --name add_multi_material_components

# Name the migration: "add_multi_material_components"
# This will:
# 1. Create LineItemMaterial table
# 2. Create ProductMaterialComponent table
# 3. Update FabricColor to add ColorSource enum + source field
# 4. Update OrderLine to add materials relation
# 5. Update Fabric to add lineItemMaterials relation
```

**After migration succeeds:**
```bash
npx prisma generate
npx prisma db push --skip-generate
```

---

## PHASE 2: VALIDATION ENGINE UPDATES

### 2.1 Update `lib/moqValidation.ts`

Replace entire file with:

```typescript
import { Prisma } from "@prisma/client";

export interface MoqValidationItem {
  fabricId: string;
  colorId?: string | null;
  quantity: number;
  moqPerFabric?: number;
  moqPerColor?: number;
}

export interface MultiMaterialMoqItem {
  materialId: string;
  colorId?: string | null;
  component: string; // MaterialComponent enum
  quantity: number;
  ratio?: number; // e.g., 0.80 for 80% of line
  moqPerFabric?: number;
  moqPerColor?: number;
}

export type MoqValidationResult =
  | { valid: true; warnings?: string[] }
  | {
      valid: false;
      error: string;
      code: "MOQ_FABRIC_MINIMUM" | "MOQ_COLOR_MINIMUM" | "MOQ_COMBINED_MULTI_FABRIC";
      fabricId?: string;
      colorId?: string | null;
      materialId?: string;
      component?: string;
    };

/**
 * Single-Fabric MOQ Validation (Legacy path for backward compat)
 */
export function validateSingleFabricMoq(items: MoqValidationItem[]): MoqValidationResult {
  if (!items.length) {
    return { valid: false, error: "No items to validate", code: "MOQ_FABRIC_MINIMUM" };
  }

  const itemsByFabric = new Map<string, { total: number; byColor: Map<string, number> }>();

  for (const item of items) {
    const fabricId = item.fabricId;
    const colorId = item.colorId || "unspecified";
    const moqPerFabric = item.moqPerFabric ?? 50;
    const moqPerColor = item.moqPerColor ?? 20;

    if (!itemsByFabric.has(fabricId)) {
      itemsByFabric.set(fabricId, { total: 0, byColor: new Map() });
    }

    const fabricData = itemsByFabric.get(fabricId)!;
    fabricData.total += item.quantity;
    fabricData.byColor.set(colorId, (fabricData.byColor.get(colorId) ?? 0) + item.quantity);

    // Check fabric-level MOQ
    if (fabricData.total < moqPerFabric) {
      return {
        valid: false,
        error: `Fabric ${fabricId} requires minimum ${moqPerFabric} units, got ${fabricData.total}`,
        code: "MOQ_FABRIC_MINIMUM",
        fabricId,
      };
    }

    // Check colorway-level MOQ
    const colorTotal = fabricData.byColor.get(colorId) ?? 0;
    if (colorTotal > 0 && colorTotal < moqPerColor) {
      return {
        valid: false,
        error: `Color ${colorId} for fabric ${fabricId} requires minimum ${moqPerColor} units, got ${colorTotal}`,
        code: "MOQ_COLOR_MINIMUM",
        fabricId,
        colorId,
      };
    }
  }

  return { valid: true };
}

/**
 * Multi-Material MOQ Validation (NEW)
 * Supports component-level material specs with optional combined MOQ
 */
export function validateMultiMaterialMoq(
  items: MultiMaterialMoqItem[],
  options?: {
    combinedMultiFabricMoq?: number;
    strictComponentValidation?: boolean;
  }
): MoqValidationResult {
  if (!items.length) {
    return {
      valid: false,
      error: "No material items to validate",
      code: "MOQ_FABRIC_MINIMUM",
    };
  }

  const itemsByMaterial = new Map<
    string,
    { total: number; byColor: Map<string, number>; byComponent: Map<string, number> }
  >();
  let combinedTotal = 0;

  for (const item of items) {
    const materialId = item.materialId;
    const colorId = item.colorId || "unspecified";
    const component = item.component || "MAIN_FABRIC";
    const moqPerFabric = item.moqPerFabric ?? 50;
    const moqPerColor = item.moqPerColor ?? 20;

    const effectiveQuantity = item.ratio ? Math.ceil(item.quantity * item.ratio) : item.quantity;
    combinedTotal += effectiveQuantity;

    if (!itemsByMaterial.has(materialId)) {
      itemsByMaterial.set(materialId, { total: 0, byColor: new Map(), byComponent: new Map() });
    }

    const matData = itemsByMaterial.get(materialId)!;
    matData.total += effectiveQuantity;
    matData.byColor.set(colorId, (matData.byColor.get(colorId) ?? 0) + effectiveQuantity);
    matData.byComponent.set(component, (matData.byComponent.get(component) ?? 0) + effectiveQuantity);

    // Check material-level MOQ
    if (matData.total < moqPerFabric) {
      return {
        valid: false,
        error: `Material ${materialId} requires minimum ${moqPerFabric} units, got ${matData.total}`,
        code: "MOQ_FABRIC_MINIMUM",
        materialId,
      };
    }

    // Check colorway-level MOQ
    const colorTotal = matData.byColor.get(colorId) ?? 0;
    if (colorTotal > 0 && colorTotal < moqPerColor) {
      return {
        valid: false,
        error: `Color ${colorId} for material ${materialId} requires minimum ${moqPerColor} units, got ${colorTotal}`,
        code: "MOQ_COLOR_MINIMUM",
        materialId,
        colorId,
      };
    }
  }

  // Check combined multi-material MOQ if specified
  if (options?.combinedMultiFabricMoq && combinedTotal < options.combinedMultiFabricMoq) {
    return {
      valid: false,
      error: `Combined material total requires minimum ${options.combinedMultiFabricMoq} units, got ${combinedTotal}`,
      code: "MOQ_COMBINED_MULTI_FABRIC",
    };
  }

  return { valid: true, warnings: [] };
}

/**
 * Hybrid Validation: checks both legacy single-fabric AND new multi-material specs
 */
export function validateHybridMoq(
  singleFabricItems?: MoqValidationItem[],
  multiMaterialItems?: MultiMaterialMoqItem[],
  options?: { combinedMultiFabricMoq?: number }
): MoqValidationResult {
  if (multiMaterialItems && multiMaterialItems.length > 0) {
    return validateMultiMaterialMoq(multiMaterialItems, options);
  }

  if (singleFabricItems && singleFabricItems.length > 0) {
    return validateSingleFabricMoq(singleFabricItems);
  }

  return { valid: false, error: "No items provided for validation", code: "MOQ_FABRIC_MINIMUM" };
}
```

### 2.2 Update `lib/orderValidation.ts`

Add new validation for multi-material payloads (keep existing single-fabric validation intact):

```typescript
// ADD THIS SECTION at the end of orderValidation.ts

export interface CreateOrderInputMultiMaterial extends Omit<CreateOrderInput, 'items'> {
  items: Array<{
    productId: string;
    materials: Array<{
      materialId: string;
      colorId?: string | null;
      component: string; // MaterialComponent enum value
      composition?: string;
      ratio?: number;
      sizeQuantities: Array<{ size: string; quantity: number }>;
    }>;
    selectedFit?: string;
  }>;
}

/**
 * Validate multi-material order payload
 */
export function validateCreateOrderInputMultiMaterial(payload: unknown): {
  success: boolean;
  data?: CreateOrderInputMultiMaterial;
  error?: string;
} {
  if (!payload || typeof payload !== "object") {
    return { success: false, error: "Payload must be an object" };
  }

  const p = payload as Record<string, any>;

  // Basic company validation
  if (!p.companyName || typeof p.companyName !== "string" || !p.companyName.trim()) {
    return { success: false, error: "companyName is required and must be non-empty string" };
  }

  if (!p.companyEmail || !VALID_EMAIL_REGEX.test(p.companyEmail)) {
    return { success: false, error: `Invalid companyEmail: ${p.companyEmail}` };
  }

  // Validate items array
  if (!Array.isArray(p.items) || p.items.length === 0) {
    return { success: false, error: "items must be a non-empty array" };
  }

  for (const item of p.items) {
    if (!item.productId || typeof item.productId !== "string") {
      return { success: false, error: "Each item must have a valid productId" };
    }

    if (!Array.isArray(item.materials) || item.materials.length === 0) {
      return { success: false, error: `Item ${item.productId} must have at least one material` };
    }

    for (const mat of item.materials) {
      if (!mat.materialId || typeof mat.materialId !== "string") {
        return { success: false, error: "Each material must have a valid materialId" };
      }

      if (!mat.component || typeof mat.component !== "string") {
        return { success: false, error: `Material ${mat.materialId} must specify a component` };
      }

      if (mat.colorId && typeof mat.colorId !== "string") {
        return { success: false, error: `Material ${mat.materialId} colorId must be a string` };
      }

      if (!Array.isArray(mat.sizeQuantities) || mat.sizeQuantities.length === 0) {
        return { success: false, error: `Material ${mat.materialId} must have size quantities` };
      }

      for (const sq of mat.sizeQuantities) {
        if (typeof sq.quantity !== "number" || sq.quantity <= 0) {
          return { success: false, error: `Size ${sq.size} quantity must be > 0` };
        }
      }
    }
  }

  return {
    success: true,
    data: p as CreateOrderInputMultiMaterial,
  };
}
```

---

## PHASE 3: ORDER CREATION API UPDATES

### 3.1 Update `app/api/orders/route.ts`

Find the `POST /api/orders` handler and add multi-material branch:

```typescript
// ADD THIS SECTION in POST /api/orders handler

// Detect if this is a multi-material order payload
const isMultiMaterial = payload.items?.[0]?.materials && Array.isArray(payload.items[0].materials);

if (isMultiMaterial) {
  // MULTI-MATERIAL PATH
  const validation = validateCreateOrderInputMultiMaterial(payload);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const input = validation.data!;

  // Aggregate total units across all materials
  let totalUnits = 0;
  const multiMaterialItems: MultiMaterialMoqItem[] = [];

  for (const item of input.items) {
    for (const material of item.materials) {
      const matTotal = material.sizeQuantities.reduce((sum, sq) => sum + sq.quantity, 0);
      totalUnits += matTotal;

      multiMaterialItems.push({
        materialId: material.materialId,
        colorId: material.colorId,
        component: material.component,
        quantity: matTotal,
        ratio: material.ratio,
        moqPerFabric: 50, // TODO: fetch from database
        moqPerColor: 20,
      });
    }
  }

  // Validate multi-material MOQ
  const product = await prisma.product.findUnique({
    where: { id: input.items[0].productId },
  });

  const moqResult = validateMultiMaterialMoq(multiMaterialItems, {
    combinedMultiFabricMoq: product?.moqCombinedMultiFabric,
  });

  if (!moqResult.valid) {
    return NextResponse.json({ error: moqResult.error }, { status: 400 });
  }

  // Create order with multi-material line items
  const order = await prisma.order.create({
    data: {
      companyId: company.id,
      orderType: "M2O",
      status: "PENDING_REVIEW",
      customerTargetPriceCents: input.customerTargetPriceCents ?? 0,
      totalCents: 0, // Will be set by admin price lock
      orderLines: {
        create: input.items.flatMap((item) =>
          item.materials.map((material) => ({
            productId: item.productId,
            selectedFit: item.selectedFit,
            size: "MULTI", // Aggregated line
            quantity: material.sizeQuantities.reduce((sum, sq) => sum + sq.quantity, 0),
            unitPriceCents: 0,
            materials: {
              create: material.sizeQuantities.map((sq) => ({
                materialId: material.materialId,
                colorId: material.colorId,
                component: material.component,
                composition: material.composition,
                ratio: material.ratio,
              })),
            },
          }))
        ),
      },
    },
    include: { orderLines: { include: { materials: true } } },
  });

  return NextResponse.json(order, { status: 201 });
} else {
  // EXISTING SINGLE-FABRIC PATH (unchanged)
  // ... keep existing code ...
}
```

---

## PHASE 4: SEED DATA UPDATES

### 4.1 Update `prisma/seed.ts`

Add product material component definitions **after** existing product seeding:

```typescript
// ADD THIS SECTION after product creation in seed.ts

console.log("Seeding product material component requirements...");

// Define component requirements for specific products
const componentRequirements = [
  {
    productName: "Classic Polo",
    components: [
      { component: "MAIN_FABRIC", isRequired: true, allowedFabricNames: ["Royal Oxford", "Pique"] },
      { component: "COLLAR", isRequired: false, allowedFabricNames: ["Royal Oxford"] },
    ],
  },
  {
    productName: "Double-Breasted Blazer",
    components: [
      { component: "MAIN_FABRIC", isRequired: true, allowedFabricNames: ["Italian Wool Blend"] },
      { component: "LINING", isRequired: true, allowedFabricNames: ["Viscose Lining"] },
      { component: "COLLAR", isRequired: false, allowedFabricNames: ["Interfacing"] },
    ],
  },
  {
    productName: "Oxford Shirt",
    components: [
      { component: "MAIN_FABRIC", isRequired: true, allowedFabricNames: ["Oxford Cotton"] },
      { component: "COLLAR", isRequired: false, allowedFabricNames: ["Oxford Cotton"] },
    ],
  },
];

for (const req of componentRequirements) {
  const product = await prisma.product.findFirst({
    where: { name: req.productName },
  });

  if (!product) continue;

  for (const comp of req.components) {
    const allowedFabrics = await prisma.fabric.findMany({
      where: { name: { in: comp.allowedFabricNames } },
    });

    await prisma.productMaterialComponent.create({
      data: {
        productId: product.id,
        component: comp.component as any,
        isRequired: comp.isRequired,
        allowedMaterialIds: allowedFabrics.map((f) => f.id),
      },
    });
  }
}

console.log("✓ Product material components seeded");
```

### 4.2 Update FabricColor Seeding

Add `ColorSource` to existing fabric color seeds:

```typescript
// Find existing fabric color creation in seed.ts and UPDATE to:

await prisma.fabricColor.create({
  data: {
    fabricId: fabric.id,
    name: colorName,
    hex: hexCode,
    source: "PLACEHOLDER", // Default for all seed data
  },
});
```

---

## PHASE 5: TYPE SAFETY & EXPORTS

### 5.1 Update `lib/types.ts` or create new file

Add TypeScript interfaces for multi-material support:

```typescript
export interface LineItemMaterialSpec {
  materialId: string;
  colorId?: string | null;
  component: "MAIN_FABRIC" | "LINING" | "TRIM" | "COLLAR" | "CUFF" | "SOLE" | "HEEL" | "UPPER" | "BACKING" | "FILL" | "INTERFACING" | "BINDING" | "LABEL" | "OTHER";
  composition?: string; // e.g., "80% Wool / 20% Cashmere"
  ratio?: number; // Optional ratio for blended materials
}

export interface OrderLineMultiMaterial {
  productId: string;
  selectedFit?: string;
  materials: LineItemMaterialSpec[];
  sizeQuantities: Array<{ size: string; quantity: number }>;
}

export interface CreateMultiMaterialOrderPayload {
  companyName: string;
  companyEmail: string;
  orderType: "M2O";
  customerTargetPriceCents?: number;
  items: OrderLineMultiMaterial[];
  logoAssetId?: string;
  logoPlacement?: "LEFT_CHEST" | "RIGHT_SLEEVE";
}
```

---

## PHASE 6: BACKWARD COMPATIBILITY LAYER

### 6.1 Create `lib/orderMigration.ts`

Helper to convert legacy single-fabric payloads to multi-material format:

```typescript
import { CreateOrderInput } from "./orderValidation";
import { CreateMultiMaterialOrderPayload } from "./types";

/**
 * Convert legacy single-fabric order payload to multi-material format
 * Ensures old API calls still work
 */
export function convertLegacyToMultiMaterial(
  legacyPayload: CreateOrderInput
): CreateMultiMaterialOrderPayload {
  return {
    companyName: legacyPayload.companyName,
    companyEmail: legacyPayload.companyEmail,
    orderType: "M2O",
    customerTargetPriceCents: legacyPayload.customerTargetPriceCents,
    items: legacyPayload.items.map((item) => ({
      productId: item.productId,
      selectedFit: item.fitId,
      materials: [
        {
          materialId: item.fabricId,
          colorId: item.colorId,
          component: "MAIN_FABRIC",
          composition: undefined,
          ratio: undefined,
        },
      ],
      sizeQuantities: item.sizeQuantities,
    })),
    logoAssetId: legacyPayload.logoAssetId,
    logoPlacement: legacyPayload.logoPlacement,
  };
}
```

---

## PHASE 7: VALIDATION CHECKLIST

After implementation, verify:

- [ ] `npx prisma migrate dev` runs without errors
- [ ] New tables exist: `LineItemMaterial`, `ProductMaterialComponent`, `FabricColor` updated
- [ ] `validateMultiMaterialMoq()` correctly rejects insufficient MOQ
- [ ] `validateMultiMaterialMoq()` accepts valid combined multi-fabric MOQ
- [ ] `POST /api/orders` accepts multi-material payloads
- [ ] Legacy single-fabric payloads still work (backward compat)
- [ ] `lib/orderMigration.ts` converts old format to new format without errors
- [ ] Database seed includes product material components
- [ ] All TypeScript types compile without errors
- [ ] Admin can view LineItemMaterial records in order details (future UI work)

---

## PHASE 8: TODO FOR LATER (After Agent 2 & 3 Complete)

- [ ] Configurator UI multi-material material picker (modal per component)
- [ ] Admin order detail UI to display all materials per order line
- [ ] Proforma PDF generator to include material composition specs
- [ ] Product detail page to show required material components

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document the error and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 7 phases now. Do not wait for any confirmation. Report results when complete.

