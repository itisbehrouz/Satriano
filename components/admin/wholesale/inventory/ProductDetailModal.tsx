"use client";

import { useState } from "react";
import { InventoryGarmentProduct } from "./ProductCard";
import { ProductImageUploader } from "../images/ProductImageUploader";

export interface ProductDetailModalProps {
  isOpen: boolean;
  product: InventoryGarmentProduct | null;
  onClose: () => void;
  onUpdateProduct: (updated: InventoryGarmentProduct) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function ProductDetailModal({
  isOpen,
  product,
  onClose,
  onUpdateProduct,
  showToast,
}: ProductDetailModalProps) {
  const [markupPercentInput, setMarkupPercentInput] = useState<string>("");
  const [isEditingMarkup, setIsEditingMarkup] = useState(false);

  if (!isOpen || !product) return null;

  const currentMarkupUSD = product.sellPriceUSD - product.wholesaleCostPriceUSD;

  const handleSaveMarkup = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPct = parseFloat(markupPercentInput);
    if (isNaN(parsedPct) || parsedPct < 0 || parsedPct > 300) {
      showToast("Please enter a valid markup percentage between 0% and 300%.", "error");
      return;
    }

    const newSellPriceUSD = product.wholesaleCostPriceUSD * (1 + parsedPct / 100);
    const updated: InventoryGarmentProduct = {
      ...product,
      markupPercent: parsedPct,
      sellPriceUSD: newSellPriceUSD,
    };

    onUpdateProduct(updated);
    setIsEditingMarkup(false);
    showToast(`Updated retail price to $${newSellPriceUSD.toFixed(2)} (${parsedPct}% markup)`, "success");
  };

  const handleSyncInventory = () => {
    showToast(`Inventory synced with supplier ${product.supplierName}`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[700px] text-[#111318] shadow-2xl relative p-6 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#111318] uppercase tracking-wide">
              {product.name}
            </h2>
            <div className="text-xs text-[#2E5AAC] font-mono font-bold mt-0.5">
              Supplier: {product.supplierName} • SKU: {product.supplierSku}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111318] text-lg font-bold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Photo Management Section (PROMPT 3) */}
          <ProductImageUploader
            images={product.images}
            onChangeImages={(newImages) => {
              onUpdateProduct({ ...product, images: newImages });
            }}
          />

          {/* Pricing Block */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-md space-y-3 font-mono text-xs">
            <div className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] pb-1 border-b border-[#E2E8F0]">
              PRICING & MARGIN ANALYSIS
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[#64748B] block">Wholesale Cost:</span>
                <span className="font-bold text-[#0F172A] text-sm">
                  ${product.wholesaleCostPriceUSD.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[#64748B] block">Your Markup:</span>
                <span className="font-bold text-[#067647] text-sm">
                  +${currentMarkupUSD.toFixed(2)} ({product.markupPercent}%)
                </span>
              </div>

              <div>
                <span className="text-[#64748B] block">Customer Retail Price:</span>
                <span className="font-bold text-[#2E5AAC] text-sm">
                  ${product.sellPriceUSD.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Edit Markup Form Inline */}
            {isEditingMarkup ? (
              <form onSubmit={handleSaveMarkup} className="pt-2 border-t border-[#E2E8F0] space-y-2">
                <label className="block text-[11px] font-bold text-[#344054]">
                  Edit Markup Percentage (%):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="300"
                    value={markupPercentInput}
                    onChange={(e) => setMarkupPercentInput(e.target.value)}
                    placeholder="20"
                    className="w-28 px-3 py-1.5 bg-white border border-[#2E5AAC] text-xs font-bold rounded-md"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#2E5AAC] text-white text-xs font-bold uppercase rounded-md cursor-pointer"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingMarkup(false)}
                    className="px-3 py-1.5 bg-white border border-[#D0D5DD] text-xs font-bold uppercase rounded-md cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    setMarkupPercentInput(product.markupPercent.toString());
                    setIsEditingMarkup(true);
                  }}
                  className="text-xs font-bold text-[#2E5AAC] hover:underline cursor-pointer"
                >
                  ✏️ Edit Markup Percentage
                </button>
              </div>
            )}
          </div>

          {/* Size / Stock Matrix */}
          <div className="border border-[#EAECF0] p-4 rounded-md space-y-3 font-sans">
            <div className="font-bold text-[#111318] uppercase tracking-wider text-xs pb-1 border-b border-[#EAECF0]">
              INVENTORY MATRIX (Size & Stock)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(product.sizeStockMatrix).map(([sz, qty]) => {
                const inStock = qty > 0;
                return (
                  <div
                    key={sz}
                    className={`p-2.5 border rounded-md font-mono text-xs ${
                      inStock ? "bg-white border-[#D0D5DD]" : "bg-[#FEE4E2]/50 border-[#F8B4B4]"
                    }`}
                  >
                    <div className="font-bold text-[#111318]">SIZE {sz}</div>
                    <div className="text-[#64748B]">{qty} units</div>
                    <div className={`text-[10px] font-bold ${inStock ? "text-[#067647]" : "text-[#C5221F]"}`}>
                      {inStock ? "✓ In Stock" : "✗ Out of Stock"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier Note */}
          <div className="bg-[#FDF6E7] border border-[#F0B94A]/40 p-3.5 rounded-md text-xs font-mono">
            <span className="font-bold text-[#854F0B] uppercase block mb-1">Supplier Note:</span>
            <p className="text-[#3A2E14] italic">&quot;{product.supplierNote}&quot;</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-[#EAECF0]">
          <button
            type="button"
            onClick={handleSyncInventory}
            className="px-4 py-2 bg-white border border-[#D0D5DD] text-[#111318] hover:bg-[#F9FAFB] text-xs font-bold uppercase rounded-md cursor-pointer inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">sync</span>
            SYNC INVENTORY
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] rounded-md font-bold uppercase tracking-wider text-xs cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
