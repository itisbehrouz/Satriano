"use client";

import { useState } from "react";
import { WholesalePricingModal } from "./WholesalePricingModal";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

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
  const { t } = useAdminLanguage();
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
    <section className="bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none p-6 space-y-6 select-none font-sans transition-colors">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            {t.pricingManager}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {t.wholesaleSubtitle}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[var(--color-text-primary)] font-bold uppercase tracking-wider h-11">
              <th className="py-3 px-4">{t.productName}</th>
              <th className="py-3 px-4">{t.m2oPriceRange}</th>
              <th className="py-3 px-4">{t.wholesalePrice}</th>
              <th className="py-3 px-4">{t.stockLevel}</th>
              <th className="py-3 px-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {products.map((item) => {
              const isOutOfStock = item.stockLevel === 0;
              const isLowStock = item.stockLevel > 0 && item.stockLevel <= 5;
              const isGoodStock = item.stockLevel > 5;

              return (
                <tr
                  key={item.id}
                  className="h-14 transition-colors bg-[var(--color-surface)] hover:bg-[var(--color-bg)]/50"
                >
                  <td className="py-3 px-4 font-bold text-[var(--color-text-primary)]">
                    {item.productName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--color-text-secondary)]">
                    {item.m2oPriceRange}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[var(--color-accent)]">
                    ${item.wholesalePriceUSD.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    {isGoodStock && (
                      <span className="text-emerald-500 inline-flex items-center gap-1">
                        {item.stockLevel} {t.unitsQty} ✓
                      </span>
                    )}
                    {isLowStock && (
                      <span className="text-amber-500 inline-flex items-center gap-1">
                        {item.stockLevel} {t.unitsQty} ⚠
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="text-red-500 inline-flex items-center gap-1">
                        0 {t.unitsQty} ({t.outOfStock || "Stok Tükenmiş"}) ✗
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(item)}
                        className="px-3 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase rounded-none transition-colors cursor-pointer"
                      >
                        {t.editBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProduct(item)}
                        className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-red-500 hover:bg-red-500/10 text-xs font-bold uppercase rounded-none transition-colors cursor-pointer"
                      >
                        {t.deleteBtn}
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
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[440px] text-[var(--color-text-primary)] shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-red-500">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Remove Wholesale Product
              </h3>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Remove <strong>{deletingProduct.productName}</strong> from wholesale catalog? This cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none font-bold uppercase tracking-wider text-xs hover:bg-[var(--color-surface)] cursor-pointer"
              >
                KEEP
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-none font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
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
