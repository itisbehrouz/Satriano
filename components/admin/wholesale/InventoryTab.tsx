"use client";

import { useState, useMemo } from "react";
import { InventoryEditModal } from "./InventoryEditModal";
import { AddColorVariantModal } from "./AddColorVariantModal";

export interface ColorVariant {
  id: string;
  productId: string;
  colorName: string;
  sizeInventory: Record<string, number>;
  lastRestocked: string;
}

export interface InventoryProduct {
  id: string;
  name: string;
  colorVariants: ColorVariant[];
}

export interface InventoryTabProps {
  products: InventoryProduct[];
  onUpdateInventory: (productId: string, variantId: string, newSizeStock: Record<string, number>) => void;
  onAddColorVariant: (productId: string, colorName: string, initialQty: number) => void;
  onArchiveColorVariant: (productId: string, variantId: string) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function InventoryTab({
  products,
  onUpdateInventory,
  onAddColorVariant,
  onArchiveColorVariant,
  showToast,
}: InventoryTabProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "p1");

  const currentProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    currentProduct?.colorVariants[0]?.id || "v1"
  );

  const currentVariant = useMemo(() => {
    if (!currentProduct || !currentProduct.colorVariants.length) return null;
    return (
      currentProduct.colorVariants.find((v) => v.id === selectedVariantId) ||
      currentProduct.colorVariants[0]
    );
  }, [currentProduct, selectedVariantId]);

  const totalStock = useMemo(() => {
    if (!currentVariant) return 0;
    return Object.values(currentVariant.sizeInventory).reduce((acc, curr) => acc + curr, 0);
  }, [currentVariant]);

  // Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddColorOpen, setIsAddColorOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  const handleSaveInventory = (newSizeStock: Record<string, number>) => {
    if (currentProduct && currentVariant) {
      onUpdateInventory(currentProduct.id, currentVariant.id, newSizeStock);
      showToast(`Updated stock levels for ${currentProduct.name} (${currentVariant.colorName})`, "success");
    }
  };

  const handleCreateColorVariant = (colorName: string, initialQty: number) => {
    if (currentProduct) {
      onAddColorVariant(currentProduct.id, colorName, initialQty);
      showToast(`Added new color variant: ${colorName}`, "success");
    }
  };

  const handleArchiveColor = () => {
    if (currentProduct && currentVariant) {
      onArchiveColorVariant(currentProduct.id, currentVariant.id);
      showToast(`Archived ${currentVariant.colorName} color variant`, "success");
      setIsArchiveConfirmOpen(false);
      // Select another variant if available
      const remaining = currentProduct.colorVariants.filter((v) => v.id !== currentVariant.id);
      if (remaining.length > 0) {
        setSelectedVariantId(remaining[0].id);
      }
    }
  };

  return (
    <section className="bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none p-6 space-y-6 select-none font-sans transition-colors">
      {/* Top Product Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            INVENTORY BY SIZE/COLOR
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Manage granular ready-made stock levels per garment color variant
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-[var(--color-text-secondary)]">Select Product:</label>
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              const p = products.find((pr) => pr.id === e.target.value);
              if (p && p.colorVariants[0]) {
                setSelectedVariantId(p.colorVariants[0].id);
              }
            }}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none px-3 py-1.5 text-xs text-[var(--color-text-primary)] font-bold focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentProduct && currentVariant ? (
        <div className="space-y-6 bg-[var(--color-bg)] border border-[var(--color-border)] p-6 rounded-none">
          {/* Main Header & Color Dropdown */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--color-border)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                PRODUCT: {currentProduct.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-semibold text-[var(--color-accent)]">
                  Color Variant: {currentVariant.colorName}
                </span>

                {/* Color Variant Selector Dropdown */}
                <select
                  value={currentVariant.id}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold px-3 py-1 rounded-none cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
                >
                  {currentProduct.colorVariants.map((v) => {
                    const isCurrent = v.id === currentVariant.id;
                    const stock = Object.values(v.sizeInventory).reduce((a, b) => a + b, 0);
                    return (
                      <option key={v.id} value={v.id}>
                        {v.colorName} {isCurrent ? "(current, ✓)" : `(${stock} units)`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="font-mono font-bold text-sm text-[var(--color-text-primary)]">
                Total Stock: <span className="text-[var(--color-accent)]">{totalStock} units</span>
              </div>
              <div className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                Last Restocked: {currentVariant.lastRestocked}
              </div>
            </div>
          </div>

          {/* Size Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(currentVariant.sizeInventory).map(([sz, qty]) => {
              const inStock = qty > 0;
              return (
                <div
                  key={sz}
                  className={`p-3.5 border rounded-none text-xs space-y-1.5 transition-all ${
                    inStock
                      ? "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                      : "bg-red-500/10 border-red-500/30 text-red-500"
                  }`}
                >
                  <div className="font-bold uppercase tracking-wide font-mono text-[11px]">
                    SIZE {sz}
                  </div>
                  <div className="font-mono text-sm font-bold">{qty} units</div>
                  <div className="pt-1">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-none ${
                        inStock ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-red-500/10 text-red-500 border border-red-500/30"
                      }`}
                    >
                      {inStock ? "✓ In Stock" : "✗ Out of Stock"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="px-5 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer"
              >
                EDIT STOCK LEVELS
              </button>

              <button
                type="button"
                onClick={() => setIsAddColorOpen(true)}
                className="px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer"
              >
                ADD NEW COLOR VARIANT
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsArchiveConfirmOpen(true)}
              className="px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-red-500 hover:bg-red-500/10 text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer"
            >
              ARCHIVE COLOR
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg)] rounded-none border border-[var(--color-border)]">
          No color variants available for this product. Click &quot;Add New Color Variant&quot; to begin.
        </div>
      )}

      {/* Edit Inventory Modal */}
      {currentProduct && currentVariant && (
        <InventoryEditModal
          isOpen={isEditOpen}
          productName={currentProduct.name}
          colorVariant={currentVariant.colorName}
          sizeStock={currentVariant.sizeInventory}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveInventory}
        />
      )}

      {/* Add Color Variant Modal */}
      {currentProduct && (
        <AddColorVariantModal
          isOpen={isAddColorOpen}
          productName={currentProduct.name}
          onClose={() => setIsAddColorOpen(false)}
          onCreate={handleCreateColorVariant}
        />
      )}

      {/* Archive Color Confirm Modal */}
      {isArchiveConfirmOpen && currentVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[460px] text-[var(--color-text-primary)] shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-red-500">
              <span className="material-symbols-outlined text-2xl">archive</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Archive Color Variant
              </h3>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Archive <strong>{currentVariant.colorName}</strong> color variant? You won&apos;t be able to order this variant, but historical data is preserved.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsArchiveConfirmOpen(false)}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none font-bold uppercase tracking-wider text-xs hover:bg-[var(--color-surface)] cursor-pointer"
              >
                KEEP
              </button>
              <button
                type="button"
                onClick={handleArchiveColor}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-none font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                ARCHIVE
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
