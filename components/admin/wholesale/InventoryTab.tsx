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
    <section className="bg-white border border-[#EAECF0] rounded-md p-6 space-y-6 select-none font-sans">
      {/* Top Product Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAECF0] pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
            INVENTORY BY SIZE/COLOR
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage granular ready-made stock levels per garment color variant
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-[#6B7280]">Select Product:</label>
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              const p = products.find((pr) => pr.id === e.target.value);
              if (p && p.colorVariants[0]) {
                setSelectedVariantId(p.colorVariants[0].id);
              }
            }}
            className="bg-[#F7F8FA] border border-[#D0D5DD] rounded-md px-3 py-1.5 text-xs text-[#111318] font-bold focus:outline-none focus:border-[#2E5AAC] cursor-pointer"
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
        <div className="space-y-6 bg-[#F9FAFB] border border-[#EAECF0] p-6 rounded-md">
          {/* Main Header & Color Dropdown */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#EAECF0] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#111318]">
                PRODUCT: {currentProduct.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-semibold text-[#2E5AAC]">
                  Color Variant: {currentVariant.colorName}
                </span>

                {/* Color Variant Selector Dropdown */}
                <select
                  value={currentVariant.id}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-bold px-3 py-1 rounded-md cursor-pointer focus:outline-none focus:border-[#2E5AAC]"
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
              <div className="font-mono font-bold text-sm text-[#111318]">
                Total Stock: <span className="text-[#2E5AAC]">{totalStock} units</span>
              </div>
              <div className="text-[11px] text-[#6B7280] font-mono">
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
                  className={`p-3.5 border rounded-md text-xs space-y-1.5 transition-all ${
                    inStock
                      ? "bg-white border-[#D0D5DD] text-[#111318]"
                      : "bg-[#FEE4E2]/50 border-[#F8B4B4] text-[#C5221F]"
                  }`}
                >
                  <div className="font-bold uppercase tracking-wide font-mono text-[11px]">
                    SIZE {sz}
                  </div>
                  <div className="font-mono text-sm font-bold">{qty} units</div>
                  <div className="pt-1">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-none ${
                        inStock ? "bg-[#ECFDF3] text-[#067647]" : "bg-[#FEE4E2] text-[#C5221F]"
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
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#EAECF0]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="px-5 py-2.5 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-xs"
              >
                EDIT STOCK LEVELS
              </button>

              <button
                type="button"
                onClick={() => setIsAddColorOpen(true)}
                className="px-4 py-2.5 bg-white border border-[#D0D5DD] text-[#111318] hover:bg-[#F9FAFB] text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
              >
                ADD NEW COLOR VARIANT
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsArchiveConfirmOpen(true)}
              className="px-4 py-2.5 bg-white border border-[#D0D5DD] text-[#C5221F] hover:bg-[#FEE4E2] text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
            >
              ARCHIVE COLOR
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[#6B7280] bg-[#F9FAFB] rounded-md border border-[#EAECF0]">
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
          <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[460px] text-[#111318] shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-[#C5221F]">
              <span className="material-symbols-outlined text-2xl">archive</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
                Archive Color Variant
              </h3>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed">
              Archive <strong>{currentVariant.colorName}</strong> color variant? You won&apos;t be able to order this variant, but historical data is preserved.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EAECF0]">
              <button
                type="button"
                onClick={() => setIsArchiveConfirmOpen(false)}
                className="px-4 py-2 bg-white text-[#344054] border border-[#D0D5DD] rounded-md font-bold uppercase tracking-wider text-xs hover:bg-[#F9FAFB] cursor-pointer"
              >
                KEEP
              </button>
              <button
                type="button"
                onClick={handleArchiveColor}
                className="px-4 py-2 bg-[#C5221F] hover:bg-red-800 text-white rounded-md font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
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
