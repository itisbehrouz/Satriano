"use client";

import React, { useState, useEffect } from "react";
import { Product, FitDef } from "./ProductFitTree";

interface GarmentFitsPanelProps {
  isOpen: boolean;
  product: Product | null;
  categoryName: string;
  subcategoryName: string;
  allFits: FitDef[];
  onClose: () => void;
  onSave: (productId: string, fitIds: string[]) => Promise<void>;
}

export function GarmentFitsPanel({
  isOpen,
  product,
  categoryName,
  subcategoryName,
  allFits,
  onClose,
  onSave,
}: GarmentFitsPanelProps) {
  const [selectedFitIds, setSelectedFitIds] = useState<string[]>([]);
  const [initialFitIds, setInitialFitIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state whenever selected product changes
  useEffect(() => {
    if (product) {
      const currentFitIds = product.fits.map((pf) => pf.fit.id);
      setSelectedFitIds(currentFitIds);
      setInitialFitIds(currentFitIds);
      setErrorMsg(null);
      setSaveSuccess(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Check if there are unsaved changes
  const isDirty =
    selectedFitIds.length !== initialFitIds.length ||
    selectedFitIds.some((id) => !initialFitIds.includes(id));

  const handleCloseRequest = () => {
    if (isDirty) {
      const confirmExit = window.confirm("You have unsaved changes. Are you sure you want to exit?");
      if (!confirmExit) return;
    }
    onClose();
  };

  const handleToggleFit = (fitId: string) => {
    setSaveSuccess(false);
    setSelectedFitIds((prev) =>
      prev.includes(fitId) ? prev.filter((id) => id !== fitId) : [...prev, fitId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSaveSuccess(false);
    try {
      await onSave(product.id, selectedFitIds);
      setInitialFitIds(selectedFitIds);
      setSaveSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save fits";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleCloseRequest}
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-Over Side Drawer */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-2xl z-50 flex flex-col border-l border-[var(--color-border)] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-start bg-[var(--color-surface)]">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase mb-1">
              {categoryName} / {subcategoryName}
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{product.name}</h2>
          </div>

          <button
            type="button"
            onClick={handleCloseRequest}
            className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-none hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">Allowed Fits</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Select which fit options are available for this product in the configurator.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-none">
              {errorMsg}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs rounded-none flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Fit selections saved successfully!</span>
            </div>
          )}

          {/* Custom Styled Checkboxes */}
          <div className="space-y-2.5">
            {allFits.map((fit) => {
              const isChecked = selectedFitIds.includes(fit.id);

              return (
                <label
                  key={fit.id}
                  onClick={() => handleToggleFit(fit.id)}
                  className={`flex items-center justify-between p-3.5 rounded-none border text-xs cursor-pointer select-none transition-all ${
                    isChecked
                      ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-text-primary)] font-semibold"
                      : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  <span className="text-sm">{fit.name}</span>

                  <div
                    className={`w-5 h-5 rounded-none border flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                        : "bg-[var(--color-surface)] border-[var(--color-border)]"
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !isDirty}
            className={`w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
              isDirty && !isSubmitting
                ? "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white cursor-pointer"
                : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
