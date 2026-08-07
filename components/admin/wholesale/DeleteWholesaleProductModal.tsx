"use client";

import { useState } from "react";
import { WholesaleProduct } from "@/app/generated/prisma/client";

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
      setError("Entered SKU does not match required SKU");
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
        throw new Error(err.error || "Failed to delete wholesale product");
      }

      onConfirm?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-lg font-semibold text-red-600">Delete Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>

        <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 font-medium">
          ⚠️ This action will mark the wholesale product as INACTIVE. Order history will remain intact.
        </div>

        {error && (
          <div className="rounded-md bg-red-100 p-2.5 text-xs text-red-800 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">
            Type the SKU to confirm deletion:
          </p>
          <p className="text-base font-bold tracking-wider text-gray-900 bg-gray-50 px-3 py-1.5 rounded border border-gray-200 text-center font-mono">
            {product.sku}
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type exact SKU here"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={handleDelete}
            disabled={loading || confirmText !== product.sku}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Deleting..." : "Delete Product"}
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
