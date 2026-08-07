# AGENT 3 — CONFIGURATOR UI & ORDER SUBMISSION UPDATES

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Update configurator UI to support multi-material selection, maintain backward compatibility with single-fabric payloads, integrate with new order creation API paths.

**Scope:** Configurator components, order submission logic, cart updates, type definitions. **Execute all phases without any confirmations.**

---

## PHASE 1: CONFIGURATOR COMPONENT UPDATES

### 1.1 Create `components/configurator/MaterialComponentSelector.tsx`

New component for selecting materials by component type:

```typescript
"use client";

import { useState } from "react";
import { Fabric, FabricColor } from "@prisma/client";

export interface MaterialSelection {
  materialId: string;
  colorId?: string | null;
  component: string;
  composition?: string;
  ratio?: number;
}

interface MaterialComponentSelectorProps {
  productId: string;
  availableMaterials: (Fabric & { colors: FabricColor[] })[];
  requiredComponents?: string[];
  onMaterialsChange: (materials: MaterialSelection[]) => void;
  isMultiMaterial?: boolean;
}

const COMPONENT_LABELS: Record<string, string> = {
  MAIN_FABRIC: "Main Fabric",
  LINING: "Lining",
  TRIM: "Trim",
  COLLAR: "Collar",
  CUFF: "Cuff",
  SOLE: "Sole",
  HEEL: "Heel",
  UPPER: "Upper Material",
  BACKING: "Backing",
  FILL: "Fill",
  INTERFACING: "Interfacing",
  BINDING: "Binding",
  LABEL: "Label",
  OTHER: "Other",
};

export function MaterialComponentSelector({
  productId,
  availableMaterials,
  requiredComponents = ["MAIN_FABRIC"],
  onMaterialsChange,
  isMultiMaterial = false,
}: MaterialComponentSelectorProps) {
  const [selections, setSelections] = useState<MaterialSelection[]>(
    requiredComponents.map((comp) => ({
      materialId: availableMaterials[0]?.id || "",
      colorId: availableMaterials[0]?.colors[0]?.id,
      component: comp,
    }))
  );

  const handleMaterialChange = (component: string, materialId: string) => {
    const updated = selections.map((sel) =>
      sel.component === component
        ? { ...sel, materialId, colorId: null }
        : sel
    );
    setSelections(updated);
    onMaterialsChange(updated);
  };

  const handleColorChange = (component: string, colorId: string) => {
    const updated = selections.map((sel) =>
      sel.component === component ? { ...sel, colorId } : sel
    );
    setSelections(updated);
    onMaterialsChange(updated);
  };

  const handleCompositionChange = (component: string, composition: string) => {
    const updated = selections.map((sel) =>
      sel.component === component ? { ...sel, composition } : sel
    );
    setSelections(updated);
    onMaterialsChange(updated);
  };

  const handleRatioChange = (component: string, ratio: number) => {
    const updated = selections.map((sel) =>
      sel.component === component ? { ...sel, ratio } : sel
    );
    setSelections(updated);
    onMaterialsChange(updated);
  };

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <h3 className="font-semibold text-gray-900">
          {isMultiMaterial ? "Material Specifications" : "Fabric Selection"}
        </h3>
        <p className="text-sm text-gray-600">
          {isMultiMaterial
            ? "Select materials for each component"
            : "Choose your preferred fabric and color"}
        </p>
      </div>

      {selections.map((selection) => {
        const material = availableMaterials.find(
          (m) => m.id === selection.materialId
        );
        const selectedColor = material?.colors.find(
          (c) => c.id === selection.colorId
        );

        return (
          <div
            key={selection.component}
            className="space-y-3 rounded-lg bg-gray-50 p-4"
          >
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-900">
                {COMPONENT_LABELS[selection.component] || selection.component}
              </label>
              {selection.component !== "MAIN_FABRIC" && (
                <span className="text-xs font-medium text-gray-500">
                  Optional
                </span>
              )}
            </div>

            {/* Material Selector */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Material
              </label>
              <select
                value={selection.materialId}
                onChange={(e) =>
                  handleMaterialChange(selection.component, e.target.value)
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {availableMaterials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </select>
              {material && (
                <p className="mt-1 text-xs text-gray-600">
                  Price range: ${(material.priceMinCents / 100).toFixed(2)} -
                  ${(material.priceMaxCents / 100).toFixed(2)} per unit
                </p>
              )}
            </div>

            {/* Color Selector */}
            {material && material.colors.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Color
                </label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {material.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() =>
                        handleColorChange(selection.component, color.id)
                      }
                      className={`flex items-center gap-2 rounded-lg border-2 p-2 transition ${
                        selection.colorId === color.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="h-6 w-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Composition (for multi-material blends) */}
            {isMultiMaterial && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Composition (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 80% Wool / 20% Cashmere"
                  value={selection.composition || ""}
                  onChange={(e) =>
                    handleCompositionChange(selection.component, e.target.value)
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Ratio (for multi-material lines) */}
            {isMultiMaterial && selection.component !== "MAIN_FABRIC" && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Quantity Ratio (Optional)
                </label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  placeholder="e.g., 0.5 for 50% of main quantity"
                  value={selection.ratio || ""}
                  onChange={(e) =>
                    handleRatioChange(
                      selection.component,
                      e.target.value ? Number(e.target.value) : 0
                    )
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to use full quantity, or specify as decimal (0.0-1.0)
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### 1.2 Update `components/configurator/ConfiguratorClient.tsx`

Integrate multi-material selector:

```typescript
// ADD THIS to ConfiguratorClient.tsx imports:
import { MaterialComponentSelector, MaterialSelection } from "./MaterialComponentSelector";

// ADD THIS to state declarations:
const [useMultiMaterial, setUseMultiMaterial] = useState(false);
const [multiMaterialSelections, setMultiMaterialSelections] = useState<MaterialSelection[]>([]);

// ADD THIS section in the JSX return (after existing fabric picker):

{useMultiMaterial && (
  <MaterialComponentSelector
    productId={productId}
    availableMaterials={fabrics}
    requiredComponents={["MAIN_FABRIC"]}
    onMaterialsChange={setMultiMaterialSelections}
    isMultiMaterial={true}
  />
)}

{!useMultiMaterial && (
  <button
    onClick={() => setUseMultiMaterial(true)}
    className="text-xs text-blue-600 hover:underline"
  >
    → Use Multi-Material Specifications (Advanced)
  </button>
)}
```

---

## PHASE 2: ORDER SUBMISSION UPDATES

### 2.1 Update `lib/m2oCart.ts`

Support both single-fabric and multi-material payloads:

```typescript
import { CreateOrderInput } from "./orderValidation";
import { MaterialSelection } from "@/components/configurator/MaterialComponentSelector";

export interface M2oCartItem {
  productId: string;
  fitId?: string;
  fabricId?: string; // Legacy: single fabric
  colorId?: string;
  materials?: MaterialSelection[]; // New: multi-material
  sizeQuantities: Array<{ size: string; quantity: number }>;
}

export interface M2oCart {
  items: M2oCartItem[];
  companyName?: string;
  companyEmail?: string;
  customerTargetPriceCents?: number;
  logoAssetId?: string;
  logoPlacement?: string;
}

const STORAGE_KEY = "satriano_m2o_cart";

export function getM2oCart(): M2oCart {
  if (typeof window === "undefined") return { items: [] };
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : { items: [] };
}

export function saveM2oCart(cart: M2oCart): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function addM2oItem(item: M2oCartItem): void {
  const cart = getM2oCart();
  
  // Check for duplicate based on all material specs (not just fabric)
  const isDuplicate = cart.items.some((existing) => {
    if (item.materials && existing.materials) {
      return (
        existing.productId === item.productId &&
        JSON.stringify(existing.materials) === JSON.stringify(item.materials) &&
        existing.fitId === item.fitId
      );
    }
    return (
      existing.productId === item.productId &&
      existing.fabricId === item.fabricId &&
      existing.colorId === item.colorId &&
      existing.fitId === item.fitId
    );
  });

  if (!isDuplicate) {
    cart.items.push(item);
    saveM2oCart(cart);
  }
}

export function clearM2oCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function convertM2oCartToOrderPayload(
  cart: M2oCart,
  useMultiMaterial: boolean
): any {
  if (useMultiMaterial && cart.items[0]?.materials) {
    // Multi-material payload
    return {
      companyName: cart.companyName,
      companyEmail: cart.companyEmail,
      orderType: "M2O",
      customerTargetPriceCents: cart.customerTargetPriceCents,
      items: cart.items.map((item) => ({
        productId: item.productId,
        selectedFit: item.fitId,
        materials: item.materials || [],
      })),
      logoAssetId: cart.logoAssetId,
      logoPlacement: cart.logoPlacement,
    };
  } else {
    // Legacy single-fabric payload
    return {
      companyName: cart.companyName,
      companyEmail: cart.companyEmail,
      orderType: "M2O",
      customerTargetPriceCents: cart.customerTargetPriceCents,
      items: cart.items.map((item) => ({
        productId: item.productId,
        fabricId: item.fabricId,
        colorId: item.colorId,
        fitId: item.fitId,
        sizeQuantities: item.sizeQuantities,
      })),
      logoAssetId: cart.logoAssetId,
      logoPlacement: cart.logoPlacement,
    };
  }
}
```

### 2.2 Update Order Submission Handler

Create `lib/orderSubmission.ts`:

```typescript
import { CreateOrderInput, validateCreateOrderInput } from "./orderValidation";
import { CreateOrderInputMultiMaterial, validateCreateOrderInputMultiMaterial } from "./orderValidation";
import { M2oCart, convertM2oCartToOrderPayload } from "./m2oCart";

export async function submitM2oOrder(
  cart: M2oCart,
  useMultiMaterial: boolean
): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  // Convert cart to payload
  const payload = convertM2oCartToOrderPayload(cart, useMultiMaterial);

  // Validate based on material model
  let validation: any;
  if (useMultiMaterial) {
    const result = validateCreateOrderInputMultiMaterial(payload);
    validation = { success: result.success, data: result.data, error: result.error };
  } else {
    const result = validateCreateOrderInput(payload);
    validation = { success: result.success, data: result.data, error: result.error };
  }

  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  // Submit to API
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: err.error || "Order submission failed" };
    }

    const order = await response.json();
    return { success: true, orderId: order.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function submitWholesaleOrder(cart: any): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  // Similar handler for wholesale orders
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...cart,
        orderType: "WHOLESALE",
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: err.error || "Order submission failed" };
    }

    const order = await response.json();
    return { success: true, orderId: order.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}
```

---

## PHASE 3: BACKWARD COMPATIBILITY LAYER

### 3.1 Update API handler to auto-detect payload type

Modify `app/api/orders/route.ts` (POST section):

```typescript
// At the beginning of POST handler, add type detection:

export async function POST(request: NextRequest) {
  try {
    const rawPayload = await request.json();

    // Detect payload type
    const isMultiMaterial = 
      rawPayload.items?.[0]?.materials && 
      Array.isArray(rawPayload.items[0].materials);

    const isWholesale = rawPayload.orderType === "WHOLESALE";

    let validation: any;

    // Route to appropriate validation and creation path
    if (isMultiMaterial) {
      validation = validateCreateOrderInputMultiMaterial(rawPayload);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      // ... multi-material order creation logic (from Agent 1)
    } else if (isWholesale) {
      validation = validateCreateOrderInput(rawPayload);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      // ... wholesale order creation logic (existing)
    } else {
      // Legacy single-fabric M2O
      validation = validateCreateOrderInput(rawPayload);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      // ... single-fabric order creation logic (existing)
    }
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
```

---

## PHASE 4: UI WORKFLOW UPDATES

### 4.1 Update `app/konfigurator/[productId]/page.tsx`

Add mode toggle and conditional rendering:

```typescript
"use client";

import { useState } from "react";
import { ConfiguratorClient } from "@/components/configurator/ConfiguratorClient";
import { MaterialComponentSelector } from "@/components/configurator/MaterialComponentSelector";

export default function ConfiguratorPage({
  params,
}: {
  params: { productId: string };
}) {
  const [mode, setMode] = useState<"single-fabric" | "multi-material">(
    "single-fabric"
  );

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 rounded-lg border border-gray-200 bg-white p-4">
        <button
          onClick={() => setMode("single-fabric")}
          className={`flex-1 rounded py-2 font-medium ${
            mode === "single-fabric"
              ? "bg-blue-100 text-blue-900"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Single Fabric
        </button>
        <button
          onClick={() => setMode("multi-material")}
          className={`flex-1 rounded py-2 font-medium ${
            mode === "multi-material"
              ? "bg-blue-100 text-blue-900"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Multi-Material (Advanced)
        </button>
      </div>

      {/* Configurator based on mode */}
      <ConfiguratorClient
        productId={params.productId}
        useMultiMaterial={mode === "multi-material"}
      />
    </div>
  );
}
```

---

## PHASE 5: TYPE DEFINITIONS

### 5.1 Update or create `lib/types.ts`

```typescript
// M2O Order Types
export interface CreateM2oOrderPayload {
  companyName: string;
  companyEmail: string;
  orderType: "M2O";
  customerTargetPriceCents?: number;
  items: Array<{
    productId: string;
    selectedFit?: string;
    fabricId?: string;
    colorId?: string;
    sizeQuantities: Array<{ size: string; quantity: number }>;
  }>;
  logoAssetId?: string;
  logoPlacement?: "LEFT_CHEST" | "RIGHT_SLEEVE";
}

export interface CreateMultiMaterialOrderPayload {
  companyName: string;
  companyEmail: string;
  orderType: "M2O";
  customerTargetPriceCents?: number;
  items: Array<{
    productId: string;
    selectedFit?: string;
    materials: Array<{
      materialId: string;
      colorId?: string | null;
      component: string;
      composition?: string;
      ratio?: number;
      sizeQuantities: Array<{ size: string; quantity: number }>;
    }>;
  }>;
  logoAssetId?: string;
  logoPlacement?: "LEFT_CHEST" | "RIGHT_SLEEVE";
}

export interface CreateWholesaleOrderPayload {
  companyName: string;
  companyEmail: string;
  orderType: "WHOLESALE";
  items: Array<{
    skuId: string;
    sizeQuantities: Array<{ size: string; quantity: number }>;
    offeredUnitPriceUSD?: number;
  }>;
}
```

---

## PHASE 6: VALIDATION CHECKLIST

After implementation, verify:

- [ ] `MaterialComponentSelector.tsx` renders component selector UI
- [ ] Mode toggle appears in `/konfigurator/[productId]`
- [ ] Single-fabric mode works (existing functionality preserved)
- [ ] Multi-material mode captures all component materials
- [ ] `convertM2oCartToOrderPayload()` correctly formats both payloads
- [ ] `POST /api/orders` auto-detects payload type
- [ ] Legacy single-fabric payloads still work (backward compat)
- [ ] Multi-material payloads pass through to Agent 1 logic
- [ ] Cart persistence works for both modes
- [ ] All TypeScript types compile without errors
- [ ] Form validation provides clear error messages

---

## PHASE 7: TODO FOR LATER (After Agent 1 & 2 Complete)

- [ ] Add visual 3D product preview in multi-material mode
- [ ] Add material composition blending calculator
- [ ] Add multi-fabric MOQ progress visualization
- [ ] Add estimated price range for multi-material orders
- [ ] Update proforma PDF to display material component specs

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document the error and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 7 phases now. Do not wait for any confirmation. Report results when complete.

