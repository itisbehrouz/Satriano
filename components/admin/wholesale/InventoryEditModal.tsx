"use client";

import { useState, useEffect } from "react";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

export interface InventoryEditModalProps {
  isOpen: boolean;
  productName: string;
  colorVariant?: string;
  colorVariantName?: string;
  sizeStock?: Record<string, number>;
  sizeInventory?: Record<string, number>;
  onClose: () => void;
  onSave: (newInventory: Record<string, number>) => void;
}

export function InventoryEditModal({
  isOpen,
  productName,
  colorVariant,
  colorVariantName,
  sizeStock,
  sizeInventory,
  onClose,
  onSave,
}: InventoryEditModalProps) {
  const { t } = useAdminLanguage();
  const [tempStock, setTempStock] = useState<Record<string, number>>({});
  const activeColorVariant = colorVariantName ?? colorVariant ?? "";
  const activeSizeStock = sizeInventory ?? sizeStock ?? {};

  useEffect(() => {
    if (activeSizeStock) {
      setTempStock({ ...activeSizeStock });
    }
  }, [sizeInventory, sizeStock, isOpen]);

  if (!isOpen) return null;

  const handleStep = (sizeKey: string, delta: number) => {
    setTempStock((prev) => {
      const current = prev[sizeKey] || 0;
      const next = Math.max(0, Math.min(999, current + delta));
      return { ...prev, [sizeKey]: next };
    });
  };

  const handleInputChange = (sizeKey: string, valStr: string) => {
    const parsed = parseInt(valStr, 10);
    const validVal = isNaN(parsed) ? 0 : Math.max(0, Math.min(999, parsed));
    setTempStock((prev) => ({ ...prev, [sizeKey]: validVal }));
  };

  const totalUnits = Object.values(tempStock).reduce((acc, curr) => acc + curr, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(tempStock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[560px] text-[var(--color-text-primary)] shadow-2xl relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              {t.editInventory}: {productName}
            </h2>
            <div className="text-xs font-semibold text-[var(--color-accent)] mt-0.5">
              {t.colorVariantLabel}: {activeColorVariant}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-lg font-bold cursor-pointer"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Size Steppers Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {Object.entries(tempStock).map(([sz, qty]) => {
              const inStock = qty > 0;
              return (
                <div
                  key={sz}
                  className="p-3 border border-[var(--color-border)] rounded-none bg-[var(--color-bg)] flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold font-mono text-xs uppercase block text-[var(--color-text-primary)]">
                      {t.sizeLabel} {sz}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        inStock ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {inStock ? `✓ ${t.inStock}` : `✗ ${t.outOfStock}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStep(sz, -1)}
                      className="w-7 h-7 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text-primary)] font-bold rounded-none flex items-center justify-center cursor-pointer min-h-[30px]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={qty}
                      onChange={(e) => handleInputChange(sz, e.target.value)}
                      className="w-12 h-7 bg-[var(--color-surface)] border border-[var(--color-accent)] font-mono text-center text-xs font-bold text-[var(--color-text-primary)] rounded-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleStep(sz, 1)}
                      className="w-7 h-7 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text-primary)] font-bold rounded-none flex items-center justify-center cursor-pointer min-h-[30px]"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Total Counter */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-none flex justify-between items-center font-mono font-bold text-xs">
            <span className="text-[var(--color-text-secondary)] uppercase">{t.totalInventoryStock}:</span>
            <span className="text-[var(--color-accent)] text-sm tabular-nums">{totalUnits} {t.unitsQty}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none font-bold uppercase tracking-wider text-xs hover:bg-[var(--color-surface)] cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-none font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              {t.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
