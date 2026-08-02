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
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[700px] text-[var(--color-text-primary)] shadow-2xl relative p-6 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
              {product.name}
            </h2>
            <div className="text-xs text-[var(--color-accent)] font-mono font-bold mt-0.5">
              Supplier: {product.supplierName} • SKU: {product.supplierSku}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-lg font-bold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Photo Management Section */}
          <ProductImageUploader
            images={product.images}
            onChangeImages={(newImages) => {
              onUpdateProduct({ ...product, images: newImages });
            }}
          />

          {/* Pricing Block */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 rounded-none space-y-3 font-mono text-xs">
            <div className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider text-[11px] pb-1 border-b border-[var(--color-border)]">
              PRICING & MARGIN ANALYSIS
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[var(--color-text-secondary)] block">Wholesale Cost:</span>
                <span className="font-bold text-[var(--color-text-primary)] text-sm">
                  ${product.wholesaleCostPriceUSD.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[var(--color-text-secondary)] block">Your Markup:</span>
                <span className="font-bold text-emerald-500 text-sm">
                  +${currentMarkupUSD.toFixed(2)} ({product.markupPercent}%)
                </span>
              </div>

              <div>
                <span className="text-[var(--color-text-secondary)] block">Customer Retail Price:</span>
                <span className="font-bold text-[var(--color-accent)] text-sm">
                  ${product.sellPriceUSD.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Edit Markup Form Inline */}
            {isEditingMarkup ? (
              <form onSubmit={handleSaveMarkup} className="pt-2 border-t border-[var(--color-border)] space-y-2">
                <label className="block text-[11px] font-bold text-[var(--color-text-primary)]">
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
                    className="w-28 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-accent)] text-xs font-bold text-[var(--color-text-primary)] rounded-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-xs font-bold uppercase rounded-none cursor-pointer"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingMarkup(false)}
                    className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] uppercase rounded-none cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-2 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => {
                    setMarkupPercentInput(product.markupPercent.toString());
                    setIsEditingMarkup(true);
                  }}
                  className="text-xs font-bold text-[var(--color-accent)] hover:underline cursor-pointer"
                >
                  ✏️ Edit Markup Percentage
                </button>
              </div>
            )}
          </div>

          {/* Size / Stock Matrix */}
          <div className="border border-[var(--color-border)] p-4 rounded-none space-y-3 font-sans">
            <div className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider text-xs pb-1 border-b border-[var(--color-border)]">
              INVENTORY MATRIX (Size & Stock)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(product.sizeStockMatrix).map(([sz, qty]) => {
                const inStock = qty > 0;
                return (
                  <div
                    key={sz}
                    className={`p-2.5 border rounded-none font-mono text-xs ${
                      inStock ? "bg-[var(--color-surface)] border-[var(--color-border)]" : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    <div className="font-bold text-[var(--color-text-primary)]">SIZE {sz}</div>
                    <div className="text-[var(--color-text-secondary)]">{qty} units</div>
                    <div className={`text-[10px] font-bold ${inStock ? "text-emerald-500" : "text-red-500"}`}>
                      {inStock ? "✓ In Stock" : "✗ Out of Stock"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier Note */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-none text-xs font-mono">
            <span className="font-bold text-amber-500 uppercase block mb-1">Supplier Note:</span>
            <p className="text-[var(--color-text-primary)] italic">&quot;{product.supplierNote}&quot;</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={handleSyncInventory}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] text-xs font-bold uppercase rounded-none cursor-pointer inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">sync</span>
            SYNC INVENTORY
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] rounded-none font-bold uppercase tracking-wider text-xs cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
