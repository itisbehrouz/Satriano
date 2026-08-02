"use client";

import React, { useState, useEffect } from "react";

export interface SizeOption {
  id: string;
  label: string;
  sortOrder: number;
}

export interface SizeSystem {
  id: string;
  name: string;
  region: string;
  options: SizeOption[];
}

export interface CategoryWithSubcategories {
  id: string;
  name: string;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    sizeSystems: Array<{ sizeSystem: { id: string } }>;
  }>;
}

interface RegionalSizePanelProps {
  isOpen: boolean;
  sizeSystem: SizeSystem | null;
  categories: CategoryWithSubcategories[];
  onClose: () => void;
  onSave: (sizeSystemId: string, assignedSubcategoryIds: string[]) => Promise<void>;
}

export function RegionalSizePanel({
  isOpen,
  sizeSystem,
  categories,
  onClose,
  onSave,
}: RegionalSizePanelProps) {
  const [selectedSubcatIds, setSelectedSubcatIds] = useState<string[]>([]);
  const [initialSubcatIds, setInitialSubcatIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Initialize selected subcategory IDs when sizeSystem or categories change
  useEffect(() => {
    if (sizeSystem && categories.length > 0) {
      const assignedIds: string[] = [];
      for (const cat of categories) {
        for (const sub of cat.subcategories) {
          if (sub.sizeSystems.some((ss) => ss.sizeSystem.id === sizeSystem.id)) {
            assignedIds.push(sub.id);
          }
        }
      }
      setSelectedSubcatIds(assignedIds);
      setInitialSubcatIds(assignedIds);
      setError(null);
      setShowConfirmClose(false);
    }
  }, [sizeSystem, categories]);

  if (!isOpen || !sizeSystem) return null;

  const hasUnsavedChanges =
    JSON.stringify([...selectedSubcatIds].sort()) !==
    JSON.stringify([...initialSubcatIds].sort());

  const handleToggleSubcategory = (subcatId: string) => {
    setSelectedSubcatIds((prev) =>
      prev.includes(subcatId)
        ? prev.filter((id) => id !== subcatId)
        : [...prev, subcatId]
    );
  };

  const handleAttemptClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const handleSaveClick = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(sizeSystem.id, selectedSubcatIds);
      setInitialSubcatIds(selectedSubcatIds);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save subcategory mapping.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Dark Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity"
        onClick={handleAttemptClose}
      />

      {/* Slide-Over Side Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-2xl z-50 flex flex-col font-sans border-l border-[var(--color-border)] animate-slideInRight">
        {/* Panel Header */}
        <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {sizeSystem.name} Sizing Standard
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-none border border-[var(--color-accent)]/20">
                {sizeSystem.region} Region
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Select subcategories that support this CAD sizing standard.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAttemptClose}
            className="w-8 h-8 rounded-none bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Size Matrix Badge Bar */}
        <div className="px-5 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)] shrink-0">
            Size Matrix:
          </span>
          <div className="flex flex-wrap gap-1">
            {sizeSystem.options.map((opt) => (
              <span
                key={opt.id}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-[11px] font-semibold px-2 py-0.5 rounded-none font-mono"
              >
                {opt.label}
              </span>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/30 text-red-500 text-xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 font-bold cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Subcategories Selection List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[var(--color-surface)]">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-3">
              {/* Category Header */}
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-1.5 flex items-center justify-between">
                <span>Category: {cat.name}</span>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                  {cat.subcategories.filter((s) => selectedSubcatIds.includes(s.id)).length}/
                  {cat.subcategories.length} selected
                </span>
              </div>

              {/* Checkbox Items */}
              <div className="space-y-2">
                {cat.subcategories.map((sub) => {
                  const isChecked = selectedSubcatIds.includes(sub.id);
                  return (
                    <label
                      key={sub.id}
                      onClick={() => handleToggleSubcategory(sub.id)}
                      className={`flex items-center justify-between p-3 rounded-none border cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-text-primary)]"
                          : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-none border flex items-center justify-center transition-colors ${
                            isChecked
                              ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                              : "bg-[var(--color-surface)] border-[var(--color-border)]"
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-secondary)] block font-mono">
                            {sub.slug}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-between">
          <button
            type="button"
            onClick={handleAttemptClose}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-none transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving || !hasUnsavedChanges}
            onClick={handleSaveClick}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold px-5 py-2 rounded-none transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving Changes…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-fadeIn">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-5 max-w-sm w-full shadow-xl space-y-4 font-sans text-[var(--color-text-primary)]">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                Discard Unsaved Changes?
              </h4>
              <p className="text-xs text-[var(--color-text-secondary)]">
                You have modified subcategory assignments for {sizeSystem.name}. Discarding will revert all pending changes.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmClose(false)}
                className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] rounded-none hover:bg-[var(--color-surface)] cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-none hover:bg-red-700 cursor-pointer"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
