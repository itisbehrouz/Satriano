"use client";

import { useState } from "react";
import { WholesaleProduct } from "@/app/generated/prisma/client";

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
  const [costPriceCents, setCostPriceCents] = useState(product.costPriceCents);
  const [markupPercent, setMarkupPercent] = useState(product.markupPercent);
  const [gender, setGender] = useState(product.gender || "");
  const [ageGroup, setAgeGroup] = useState(product.ageGroup || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sellPrice = Math.round(costPriceCents * (1 + markupPercent / 100));

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
            gender: gender || null,
            ageGroup: ageGroup || null,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save wholesale product");
      }

      onSave?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-lg font-semibold text-gray-900">Edit Wholesale Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 font-medium">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              SKU
            </label>
            <input
              type="text"
              value={product.sku}
              disabled
              className="mt-1 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-400">SKU is non-editable</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Unspecified / All</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Unspecified / All</option>
                <option value="Adult">Adult</option>
                <option value="Teen">Teen</option>
                <option value="Kids">Kids</option>
                <option value="Baby">Baby</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Cost Price (¢)
              </label>
              <input
                type="number"
                value={costPriceCents}
                onChange={(e) => setCostPriceCents(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                min={0}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Markup %
              </label>
              <input
                type="number"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                min={0}
                step={0.1}
              />
            </div>
          </div>

          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-900">
              Calculated Wholesale Sell Price: ${(sellPrice / 100).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
