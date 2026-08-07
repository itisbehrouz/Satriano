# AGENT 2 — WHOLESALE UI & ADMIN FORM ENHANCEMENTS

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Build out missing Admin UI forms and Wholesale discovery filters. Gender/Age filtering, fabric price range editor, wholesale product edit/delete modals.

**Scope:** React components, form handlers, API integration, styling. **Execute all phases without any confirmations.**

---

## PHASE 1: ADMIN FABRIC PRICE RANGE EDITOR

### 1.1 Create `components/admin/FabricPriceRangeEditor.tsx`

```typescript
"use client";

import { useState } from "react";
import { Fabric } from "@prisma/client";

interface FabricPriceRangeEditorProps {
  fabric: Fabric;
  onSave?: (fabric: Fabric) => void;
  onCancel?: () => void;
}

export function FabricPriceRangeEditor({
  fabric,
  onSave,
  onCancel,
}: FabricPriceRangeEditorProps) {
  const [minCents, setMinCents] = useState(fabric.priceMinCents);
  const [maxCents, setMaxCents] = useState(fabric.priceMaxCents);
  const [moqPerColor, setMoqPerColor] = useState(fabric.moqPerColor);
  const [moqPerFabric, setMoqPerFabric] = useState(fabric.moqPerFabric);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    // Validation
    if (minCents < 0 || maxCents < 0 || moqPerColor <= 0 || moqPerFabric <= 0) {
      setError("All values must be positive");
      return;
    }

    if (minCents > maxCents) {
      setError("Minimum price cannot exceed maximum price");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/catalog/fabric/${fabric.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceMinCents: minCents,
          priceMaxCents: maxCents,
          moqPerColor,
          moqPerFabric,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save");
      }

      const updated = await response.json();
      setSuccess(true);
      setTimeout(() => onSave?.(updated), 500);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Fabric: <span className="font-semibold">{fabric.name}</span>
        </label>
        <p className="text-xs text-gray-500">Edit pricing and MOQ thresholds</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          ✓ Saved successfully
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Min Price */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Min Price per Unit (¢)
          </label>
          <input
            type="number"
            value={minCents}
            onChange={(e) => setMinCents(Number(e.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="e.g., 2500"
            min={0}
          />
          <p className="text-xs text-gray-500">
            ${(minCents / 100).toFixed(2)}/unit
          </p>
        </div>

        {/* Max Price */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Max Price per Unit (¢)
          </label>
          <input
            type="number"
            value={maxCents}
            onChange={(e) => setMaxCents(Number(e.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="e.g., 4500"
            min={0}
          />
          <p className="text-xs text-gray-500">
            ${(maxCents / 100).toFixed(2)}/unit
          </p>
        </div>

        {/* MOQ Per Color */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            MOQ per Colorway (units)
          </label>
          <input
            type="number"
            value={moqPerColor}
            onChange={(e) => setMoqPerColor(Number(e.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="e.g., 20"
            min={1}
          />
          <p className="text-xs text-gray-500">Minimum units per color</p>
        </div>

        {/* MOQ Per Fabric */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            MOQ per Fabric (units)
          </label>
          <input
            type="number"
            value={moqPerFabric}
            onChange={(e) => setMoqPerFabric(Number(e.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="e.g., 50"
            min={1}
          />
          <p className="text-xs text-gray-500">Minimum total units for fabric</p>
        </div>
      </div>

      <div className="flex gap-2 border-t border-gray-200 pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

### 1.2 Create `app/api/admin/catalog/fabric/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "");

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin auth
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await verify(token, JWT_SECRET);

    // Get request body
    const body = await request.json();
    const { priceMinCents, priceMaxCents, moqPerColor, moqPerFabric } = body;

    // Validate
    if (
      priceMinCents === undefined ||
      priceMaxCents === undefined ||
      moqPerColor === undefined ||
      moqPerFabric === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (priceMinCents > priceMaxCents) {
      return NextResponse.json(
        { error: "Min price cannot exceed max price" },
        { status: 400 }
      );
    }

    // Update fabric
    const fabric = await prisma.fabric.update({
      where: { id: params.id },
      data: {
        priceMinCents,
        priceMaxCents,
        moqPerColor,
        moqPerFabric,
      },
    });

    return NextResponse.json(fabric);
  } catch (error: any) {
    console.error("Error updating fabric:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update fabric" },
      { status: 500 }
    );
  }
}
```

### 1.3 Integrate into `components/admin/FabricColorPanel.tsx`

Find existing FabricColorPanel and add edit button:

```typescript
// ADD THIS to each fabric row in the panel:

<button
  onClick={() => setSelectedFabricForEdit(fabric)}
  className="text-xs text-blue-600 hover:underline"
>
  Edit Pricing
</button>

// Then render editor modal:
{selectedFabricForEdit && (
  <FabricPriceRangeEditor
    fabric={selectedFabricForEdit}
    onSave={(updated) => {
      // Refresh fabric list
      setSelectedFabricForEdit(null);
    }}
    onCancel={() => setSelectedFabricForEdit(null)}
  />
)}
```

---

## PHASE 2: WHOLESALE PRODUCT EDIT/DELETE UI

### 2.1 Create `components/admin/wholesale/EditWholesaleProductModal.tsx`

```typescript
"use client";

import { useState } from "react";
import { WholesaleProduct } from "@prisma/client";

interface EditWholesaleProductModalProps {
  product: WholesaleProduct & { supplier?: any; images?: any[] };
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function EditWholesaleProductModal({
  product,
  isOpen,
  onClose,
  onSave,
}: EditWholesaleProductModalProps) {
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [costPriceCents, setCostPriceCents] = useState(product.costPriceCents);
  const [markupPercent, setMarkupPercent] = useState(product.markupPercent);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product.lowStockThreshold ?? 3
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sellPrice = Math.round(
    costPriceCents * (1 + markupPercent / 100)
  );

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/wholesale/products/${product.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            costPriceCents,
            markupPercent,
            lowStockThreshold,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save");
      }

      onSave?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Wholesale Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              type="text"
              value={sku}
              disabled
              className="mt-1 w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">SKU cannot be changed</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cost Price (¢)
              </label>
              <input
                type="number"
                value={costPriceCents}
                onChange={(e) => setCostPriceCents(Number(e.target.value))}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                min={0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Markup %
              </label>
              <input
                type="number"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(Number(e.target.value))}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                min={0}
                step={0.1}
              />
            </div>
          </div>

          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-900">
              Calculated Sell Price: ${(sellPrice / 100).toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Low Stock Threshold
            </label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              min={1}
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-200 pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 2.2 Create `components/admin/wholesale/DeleteWholesaleProductModal.tsx`

```typescript
"use client";

import { useState } from "react";
import { WholesaleProduct } from "@prisma/client";

interface DeleteWholesaleProductModalProps {
  product: WholesaleProduct;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function DeleteWholesaleProductModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: DeleteWholesaleProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (confirmText !== product.sku) {
      setError("SKU must match to confirm deletion");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/wholesale/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete");
      }

      onConfirm?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-red-600">Delete Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          ⚠️ This action cannot be undone. All order history for this product
          will remain, but the product will no longer be available for purchase.
        </div>

        {error && (
          <div className="rounded-md bg-red-100 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700">
            Type the SKU to confirm:
          </p>
          <p className="text-lg font-semibold text-gray-900">{product.sku}</p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Enter SKU to confirm"
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 border-t border-gray-200 pt-4">
          <button
            onClick={handleDelete}
            disabled={loading || confirmText !== product.sku}
            className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Product"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 2.3 Create API endpoints

**`app/api/admin/wholesale/products/[id]/route.ts`:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "");

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await verify(token, JWT_SECRET);

    const body = await request.json();
    const { name, costPriceCents, markupPercent, lowStockThreshold } = body;

    const product = await prisma.wholesaleProduct.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(costPriceCents !== undefined && { costPriceCents }),
        ...(markupPercent !== undefined && {
          markupPercent,
          sellPriceCents: Math.round(
            costPriceCents * (1 + markupPercent / 100)
          ),
        }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold }),
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await verify(token, JWT_SECRET);

    // Soft delete: set status to INACTIVE
    const product = await prisma.wholesaleProduct.update({
      where: { id: params.id },
      data: { status: "INACTIVE" },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete" },
      { status: 500 }
    );
  }
}
```

---

## PHASE 3: WHOLESALE GENDER & AGE GROUP FILTERS

### 3.1 Update `components/WholesaleCatalogClient.tsx`

Add filter state and UI:

```typescript
"use client";

import { useState, useMemo } from "react";
import { WholesaleProduct } from "@prisma/client";

interface WholesaleCatalogClientProps {
  products: WholesaleProduct[];
}

export function WholesaleCatalogClient({ products }: WholesaleCatalogClientProps) {
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique genders and age groups
  const genders = useMemo(() => {
    return [...new Set(products.map((p) => p.gender).filter(Boolean))].sort();
  }, [products]);

  const ageGroups = useMemo(() => {
    return [...new Set(products.map((p) => p.ageGroup).filter(Boolean))].sort();
  }, [products]);

  // Filter products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchGender = !selectedGender || p.gender === selectedGender;
      const matchAgeGroup = !selectedAgeGroup || p.ageGroup === selectedAgeGroup;
      const matchPrice = p.sellPriceCents >= priceRange.min && p.sellPriceCents <= priceRange.max;
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.includes(searchQuery);
      const matchCategory = !selectedCategory || p.categoryId === selectedCategory;

      return matchGender && matchAgeGroup && matchPrice && matchSearch && matchCategory;
    });
  }, [products, selectedGender, selectedAgeGroup, priceRange, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Filters</h3>

        <div className="space-y-4">
          {/* Gender Filter */}
          {genders.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGender(null)}
                  className={`rounded px-3 py-1 text-sm ${
                    selectedGender === null
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  All
                </button>
                {genders.map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender)}
                    className={`rounded px-3 py-1 text-sm capitalize ${
                      selectedGender === gender
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Age Group Filter */}
          {ageGroups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Age Group</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAgeGroup(null)}
                  className={`rounded px-3 py-1 text-sm ${
                    selectedAgeGroup === null
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  All
                </button>
                {ageGroups.map((ageGroup) => (
                  <button
                    key={ageGroup}
                    onClick={() => setSelectedAgeGroup(ageGroup)}
                    className={`rounded px-3 py-1 text-sm capitalize ${
                      selectedAgeGroup === ageGroup
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    {ageGroup}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: Number(e.target.value) })
                }
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: Number(e.target.value) })
                }
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <h3 className="mb-4 font-semibold text-gray-900">
          Products ({filtered.length})
        </h3>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">No products match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md"
              >
                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.sku}</p>
                <div className="mt-2 flex justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    ${(product.sellPriceCents / 100).toFixed(2)}
                  </span>
                  {product.gender && (
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {product.gender}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3.2 Update Prisma schema for WholesaleProduct

Add gender and ageGroup fields to `WholesaleProduct` in `prisma/schema.prisma`:

```prisma
model WholesaleProduct {
  id String @id @default(cuid())
  sku String @unique
  name String
  description String?
  categoryId String
  category Category @relation(fields: [categoryId], references: [id])
  
  // NEW: Demographics
  gender String? // "Men", "Women", "Unisex", "Boys", "Girls"
  ageGroup String? // "Baby", "Kids", "Teen", "Adult"
  
  // Pricing
  costPriceCents Int
  markupPercent Float @default(35.0)
  sellPriceCents Int
  
  // Stock
  status String @default("ACTIVE")
  lowStockThreshold Int @default(3)
  
  // Relations
  supplierId String
  supplier Supplier @relation(fields: [supplierId], references: [id])
  images WholesaleProductImage[]
  stock WholesaleStock[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([categoryId])
  @@index([supplierId])
  @@index([gender])
  @@index([ageGroup])
}
```

---

## PHASE 4: API ENDPOINT FOR WHOLESALE FILTERS

### 4.1 Create `app/api/wholesale/filters/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get unique genders and age groups
    const genders = await prisma.wholesaleProduct.findMany({
      where: { status: "ACTIVE" },
      distinct: ["gender"],
      select: { gender: true },
    });

    const ageGroups = await prisma.wholesaleProduct.findMany({
      where: { status: "ACTIVE" },
      distinct: ["ageGroup"],
      select: { ageGroup: true },
    });

    return NextResponse.json({
      genders: genders.map((g) => g.gender).filter(Boolean),
      ageGroups: ageGroups.map((a) => a.ageGroup).filter(Boolean),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## PHASE 5: VALIDATION CHECKLIST

After implementation, verify:

- [ ] `FabricPriceRangeEditor.tsx` renders with input fields
- [ ] Fabric price updates via `PATCH /api/admin/catalog/fabric/[id]`
- [ ] `EditWholesaleProductModal.tsx` opens and saves changes
- [ ] `DeleteWholesaleProductModal.tsx` requires SKU confirmation
- [ ] Wholesale DELETE endpoint soft-deletes (sets `status: INACTIVE`)
- [ ] Gender filter UI renders in `/wholesale`
- [ ] Age Group filter UI renders in `/wholesale`
- [ ] Product filtering works across all dimensions (gender, age, price, search)
- [ ] Prisma migration adds `gender` and `ageGroup` columns to WholesaleProduct
- [ ] Seed data updated with gender/age values for wholesale products
- [ ] All TypeScript types compile

---

## PHASE 6: TODO FOR LATER (After Agent 1 & 3 Complete)

- [ ] Integrate edit/delete modals into admin wholesale inventory table
- [ ] Add bulk edit UI for multiple products at once
- [ ] Implement gender/age filtering in customer-facing `/wholesale` page
- [ ] Add stock matrix filtering by size + gender

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document the error and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 6 phases now. Do not wait for any confirmation. Report results when complete.

