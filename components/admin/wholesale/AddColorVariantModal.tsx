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
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[480px] text-[var(--color-text-primary)] shadow-2xl relative p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            ADD NEW COLOR VARIANT: {productName}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1.5">
              Color Name *
            </label>
            <input
              type="text"
              required
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="e.g., Burgundy, Midnight Blue, Charcoal"
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-none focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1.5">
              Initial Stock Quantity per Size (Optional)
            </label>
            <input
              type="number"
              min="0"
              max="999"
              value={initialQty}
              onChange={(e) => setInitialQty(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono rounded-none focus:border-[var(--color-accent)] focus:outline-none"
            />
            <span className="text-[11px] text-[var(--color-text-secondary)] mt-1 block">
              Default stock allocated per standard size option.
            </span>
          </div>

          {error && <p className="text-red-500 text-[11px]">{error}</p>}

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
              CREATE VARIANT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
