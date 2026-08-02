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
      <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[520px] text-[#111318] shadow-2xl relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
            EDIT WHOLESALE PRICE: {product.productName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111318] text-lg font-bold cursor-pointer"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Read-Only Info */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-md space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-[#64748B]">M2O Price Range:</span>
            <span className="font-bold text-[#0F172A]">{product.m2oPriceRange}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Current Wholesale Price:</span>
            <span className="font-bold text-[#2E5AAC]">${product.wholesalePriceUSD.toFixed(2)}</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1.5">
              New Wholesale Price (USD, per unit) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#64748B] font-mono font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="9999.99"
                required
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="125.00"
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] font-mono font-bold rounded-md focus:border-[#2E5AAC] focus:outline-none"
              />
            </div>
            {error && <p className="text-[#C5221F] text-[11px] mt-1">{error}</p>}
          </div>

          {/* Warning Banner */}
          <div className="bg-[#FDF6E7] border border-[#F0B94A]/40 p-3 rounded-md text-[11px] text-[#854F0B] flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#F0B94A]">warning</span>
            <span>⚠️ This price change will affect all future wholesale stock orders.</span>
          </div>

          {/* Buttons */}
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
              SAVE PRICE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
