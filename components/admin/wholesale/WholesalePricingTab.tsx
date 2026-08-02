"use client";

import { useState } from "react";
import { WholesalePricingModal } from "./WholesalePricingModal";

export interface PricingProduct {
  id: string;
  productName: string;
  m2oPriceRange: string;
  wholesalePriceUSD: number;
  stockLevel: number;
}

export interface WholesalePricingTabProps {
  products: PricingProduct[];
  onUpdatePrice: (id: string, newPriceUSD: number) => void;
  onDeleteProduct: (id: string) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function WholesalePricingTab({
  products,
  onUpdatePrice,
  onDeleteProduct,
  showToast,
}: WholesalePricingTabProps) {
  const [editingProduct, setEditingProduct] = useState<PricingProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<PricingProduct | null>(null);

  const handleSavePrice = (id: string, newPriceUSD: number) => {
    onUpdatePrice(id, newPriceUSD);
    showToast(`Wholesale price updated to $${newPriceUSD.toFixed(2)}/unit`, "success");
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      onDeleteProduct(deletingProduct.id);
      showToast(`Removed ${deletingProduct.productName} from wholesale catalog`, "success");
      setDeletingProduct(null);
    }
  };

  return (
    <section className="bg-white border border-[#EAECF0] rounded-md p-6 space-y-6 select-none font-sans">
      <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
            WHOLESALE PRICING MANAGER
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Configure fixed wholesale unit prices vs made-to-order ranges
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F7F8FA] border-b border-[#EAECF0] text-[#111318] font-bold uppercase tracking-wider h-11">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">M2O Price Range</th>
              <th className="py-3 px-4">Wholesale Price</th>
              <th className="py-3 px-4">Stock Level</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0]">
            {products.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const isOutOfStock = item.stockLevel === 0;
              const isLowStock = item.stockLevel > 0 && item.stockLevel <= 5;
              const isGoodStock = item.stockLevel > 5;

              return (
                <tr
                  key={item.id}
                  className={`h-14 transition-colors ${
                    isEven ? "bg-white" : "bg-[#F9FAFB]"
                  } hover:bg-[#F2F4F7]`}
                >
                  <td className="py-3 px-4 font-bold text-[#111318]">
                    {item.productName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#6B7280]">
                    {item.m2oPriceRange}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#2E5AAC]">
                    ${item.wholesalePriceUSD.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    {isGoodStock && (
                      <span className="text-[#067647] inline-flex items-center gap-1">
                        {item.stockLevel} units ✓
                      </span>
                    )}
                    {isLowStock && (
                      <span className="text-[#854F0B] inline-flex items-center gap-1">
                        {item.stockLevel} units ⚠
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="text-[#C5221F] inline-flex items-center gap-1">
                        0 units (Out of Stock) ✗
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(item)}
                        className="px-3 py-1.5 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase rounded-md transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProduct(item)}
                        className="px-3 py-1.5 bg-white border border-[#D0D5DD] text-[#C5221F] hover:bg-[#FEE4E2] hover:border-[#F8B4B4] text-xs font-bold uppercase rounded-md transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <WholesalePricingModal
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSavePrice}
      />

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
          <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[440px] text-[#111318] shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-[#C5221F]">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
                Remove Wholesale Product
              </h3>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed">
              Remove <strong>{deletingProduct.productName}</strong> from wholesale catalog? This cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EAECF0]">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-white text-[#344054] border border-[#D0D5DD] rounded-md font-bold uppercase tracking-wider text-xs hover:bg-[#F9FAFB] cursor-pointer"
              >
                KEEP
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-[#C5221F] hover:bg-red-800 text-white rounded-md font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                REMOVE
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
