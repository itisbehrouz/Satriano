"use client";

import { useState } from "react";

export interface AddColorVariantModalProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  onCreate: (colorName: string, initialQty: number) => void;
}

export function AddColorVariantModal({
  isOpen,
  productName,
  onClose,
  onCreate,
}: AddColorVariantModalProps) {
  const [colorName, setColorName] = useState<string>("");
  const [initialQty, setInitialQty] = useState<string>("0");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorName.trim()) {
      setError("Please enter a valid color variant name.");
      return;
    }
    const parsedQty = parseInt(initialQty, 10);
    const validQty = isNaN(parsedQty) ? 0 : Math.max(0, parsedQty);

    onCreate(colorName.trim(), validQty);
    setColorName("");
    setInitialQty("0");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[480px] text-[#111318] shadow-2xl relative p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
            ADD NEW COLOR VARIANT: {productName}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1.5">
              Color Name *
            </label>
            <input
              type="text"
              required
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="e.g., Burgundy, Midnight Blue, Charcoal"
              className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] rounded-md focus:border-[#2E5AAC] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1.5">
              Initial Stock Quantity per Size (Optional)
            </label>
            <input
              type="number"
              min="0"
              max="999"
              value={initialQty}
              onChange={(e) => setInitialQty(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] font-mono rounded-md focus:border-[#2E5AAC] focus:outline-none"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Default stock allocated per standard size option.
            </span>
          </div>

          {error && <p className="text-[#C5221F] text-[11px]">{error}</p>}

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
              CREATE VARIANT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
