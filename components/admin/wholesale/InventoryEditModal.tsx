"use client";

import { useState, useEffect } from "react";

export interface InventoryEditModalProps {
  isOpen: boolean;
  productName: string;
  colorVariant: string;
  sizeStock: Record<string, number>;
  onClose: () => void;
  onSave: (newSizeStock: Record<string, number>) => void;
}

export function InventoryEditModal({
  isOpen,
  productName,
  colorVariant,
  sizeStock,
  onClose,
  onSave,
}: InventoryEditModalProps) {
  const [tempStock, setTempStock] = useState<Record<string, number>>({});

  useEffect(() => {
    if (sizeStock) {
      setTempStock({ ...sizeStock });
    }
  }, [sizeStock, isOpen]);

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
      <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[560px] text-[#111318] shadow-2xl relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
              EDIT INVENTORY: {productName}
            </h2>
            <div className="text-xs font-semibold text-[#2E5AAC] mt-0.5">
              Color Variant: {colorVariant}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111318] text-lg font-bold cursor-pointer"
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
                  className="p-3 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold font-mono text-xs uppercase block text-[#0F172A]">
                      SIZE {sz}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        inStock ? "text-[#067647]" : "text-[#C5221F]"
                      }`}
                    >
                      {inStock ? "✓ In Stock" : "✗ Out of Stock"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStep(sz, -1)}
                      className="w-7 h-7 bg-white border border-[#CBD5E1] hover:bg-[#E2E8F0] text-[#0F172A] font-bold rounded-md flex items-center justify-center cursor-pointer min-h-[30px]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={qty}
                      onChange={(e) => handleInputChange(sz, e.target.value)}
                      className="w-12 h-7 bg-white border border-[#2E5AAC] font-mono text-center text-xs font-bold text-[#0F172A] rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleStep(sz, 1)}
                      className="w-7 h-7 bg-white border border-[#CBD5E1] hover:bg-[#E2E8F0] text-[#0F172A] font-bold rounded-md flex items-center justify-center cursor-pointer min-h-[30px]"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Total Counter */}
          <div className="bg-[#F1F5F9] border border-[#CBD5E1] p-3 rounded-md flex justify-between items-center font-mono font-bold text-xs">
            <span className="text-[#475569] uppercase">TOTAL INVENTORY STOCK:</span>
            <span className="text-[#2E5AAC] text-sm tabular-nums">{totalUnits} units</span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-[#344054] border border-[#D0D5DD] rounded-md font-bold uppercase tracking-wider text-xs hover:bg-[#F9FAFB] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white rounded-md font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-xs"
            >
              SAVE INVENTORY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
