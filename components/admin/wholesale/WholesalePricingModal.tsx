"use client";

import { useState, useEffect } from "react";

export interface WholesalePricingModalProps {
  isOpen: boolean;
  product: {
    id: string;
    productName: string;
    m2oPriceRange: string;
    wholesalePriceUSD: number;
  } | null;
  onClose: () => void;
  onSave: (id: string, newPriceUSD: number) => void;
}

export function WholesalePricingModal({
  isOpen,
  product,
  onClose,
  onSave,
}: WholesalePricingModalProps) {
  const [priceInput, setPriceInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setPriceInput(product.wholesalePriceUSD.toString());
      setError(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(priceInput);
    if (isNaN(val) || val <= 0 || val > 9999.99) {
      setError("Please enter a valid price between $0.01 and $9999.99.");
      return;
    }
    onSave(product.id, val);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[520px] text-[var(--color-text-primary)] shadow-2xl relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            EDIT WHOLESALE PRICE: {product.productName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-lg font-bold cursor-pointer"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Read-Only Info */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 rounded-none space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">M2O Price Range:</span>
            <span className="font-bold text-[var(--color-text-primary)]">{product.m2oPriceRange}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Current Wholesale Price:</span>
            <span className="font-bold text-[var(--color-accent)]">${product.wholesalePriceUSD.toFixed(2)}</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1.5">
              New Wholesale Price (USD, per unit) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[var(--color-text-secondary)] font-mono font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="9999.99"
                required
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="125.00"
                className="w-full pl-8 pr-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono font-bold rounded-none focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
            {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-none text-[11px] text-amber-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>⚠️ This price change will affect all future wholesale stock orders.</span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none font-bold uppercase tracking-wider text-xs hover:bg-[var(--color-surface)] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-none font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              SAVE PRICE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
