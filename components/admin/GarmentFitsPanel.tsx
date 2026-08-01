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
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-Over Side Drawer */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-[#EAECF0] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#EAECF0] flex justify-between items-start bg-white">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-[#667085] uppercase mb-1">
              {categoryName} / {subcategoryName}
            </div>
            <h2 className="text-xl font-bold text-[#101828]">{product.name}</h2>
          </div>

          <button
            type="button"
            onClick={handleCloseRequest}
            className="p-1.5 text-[#667085] hover:text-[#101828] rounded-md hover:bg-[#F2F4F7] transition-colors"
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
            <h3 className="text-sm font-bold text-[#101828] mb-1">Allowed Fits</h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              Select which fit options are available for this product in the configurator.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs rounded-md">
              {errorMsg}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-[#ECFDF3] border border-[#ABE5C6] text-[#067647] text-xs rounded-md flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Fit selections saved successfully!</span>
            </div>
          )}

          {/* 8 Custom Styled Checkboxes */}
          <div className="space-y-2.5">
            {allFits.map((fit) => {
              const isChecked = selectedFitIds.includes(fit.id);

              return (
                <label
                  key={fit.id}
                  onClick={() => handleToggleFit(fit.id)}
                  className={`flex items-center justify-between p-3.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                    isChecked
                      ? "bg-[#F2F4F7] border-[#D0D5DD] text-[#101828] font-semibold"
                      : "bg-white border-[#D0D5DD] text-[#475467] hover:border-[#2E5AAC]"
                  }`}
                >
                  <span className="text-sm">{fit.name}</span>

                  {/* Custom Checkbox (Neutral Gray when checked, NO BLUE FILL) */}
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-[#F2F4F7] border-[#D0D5DD]"
                        : "bg-white border-[#D0D5DD]"
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 text-[#111318]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="p-4 border-t border-[#EAECF0] bg-white space-y-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !isDirty}
            className={`w-full py-2.5 px-4 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
              isDirty && !isSubmitting
                ? "bg-[#2E5AAC] hover:bg-[#24498E] text-white shadow-xs cursor-pointer"
                : "bg-[#EAECF0] text-[#98A2B3] cursor-not-allowed"
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
