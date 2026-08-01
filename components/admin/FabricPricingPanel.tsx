"use client";

import React, { useState, useEffect } from "react";
import type { FabricItem } from "./FabricPricingTree";

interface FabricPricingPanelProps {
  isOpen: boolean;
  fabric: FabricItem | null;
  onClose: () => void;
  onSave: (
    fabricId: string,
    updatedData: {
      name: string;
      colorway?: string | null;
      priceMinCents: number;
      priceMaxCents: number;
      setupFeeCents: number;
      active: boolean;
    }
  ) => Promise<void>;
}

export function FabricPricingPanel({
  isOpen,
  fabric,
  onClose,
  onSave,
}: FabricPricingPanelProps) {
  const [name, setName] = useState("");
  const [colorway, setColorway] = useState("");
  const [minPriceDollars, setMinPriceDollars] = useState("");
  const [maxPriceDollars, setMaxPriceDollars] = useState("");
  const [setupFeeDollars, setSetupFeeDollars] = useState("");
  const [active, setActive] = useState(true);

  // Initial values tracker for unsaved changes detection
  const [initialFormState, setInitialFormState] = useState<{
    name: string;
    colorway: string;
    minPriceDollars: string;
    maxPriceDollars: string;
    setupFeeDollars: string;
    active: boolean;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Synchronize form inputs when target fabric changes
  useEffect(() => {
    if (fabric) {
      const minStr = (fabric.priceMinCents / 100).toFixed(2);
      const maxStr = (fabric.priceMaxCents / 100).toFixed(2);
      const setupStr = (fabric.setupFeeCents / 100).toFixed(2);
      const fabName = fabric.name;
      const fabColorway = fabric.colorway || "";
      const fabActive = fabric.active;

      setName(fabName);
      setColorway(fabColorway);
      setMinPriceDollars(minStr);
      setMaxPriceDollars(maxStr);
      setSetupFeeDollars(setupStr);
      setActive(fabActive);

      const stateSnapshot = {
        name: fabName,
        colorway: fabColorway,
        minPriceDollars: minStr,
        maxPriceDollars: maxStr,
        setupFeeDollars: setupStr,
        active: fabActive,
      };

      setInitialFormState(stateSnapshot);
      setError(null);
      setShowConfirmClose(false);
    }
  }, [fabric]);

  if (!isOpen || !fabric) return null;

  const currentFormState = {
    name,
    colorway,
    minPriceDollars,
    maxPriceDollars,
    setupFeeDollars,
    active,
  };

  const hasUnsavedChanges =
    initialFormState !== null &&
    JSON.stringify(currentFormState) !== JSON.stringify(initialFormState);

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

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault();

    const minNum = parseFloat(minPriceDollars);
    const maxNum = parseFloat(maxPriceDollars);
    const setupNum = parseFloat(setupFeeDollars);

    if (isNaN(minNum) || minNum < 0) {
      setError("Please enter a valid Minimum Price ($).");
      return;
    }
    if (isNaN(maxNum) || maxNum < minNum) {
      setError("Maximum Price ($) must be greater than or equal to Minimum Price.");
      return;
    }
    if (isNaN(setupNum) || setupNum < 0) {
      setError("Please enter a valid Setup Fee ($).");
      return;
    }

    const priceMinCents = Math.round(minNum * 100);
    const priceMaxCents = Math.round(maxNum * 100);
    const setupFeeCents = Math.round(setupNum * 100);

    setSaving(true);
    setError(null);

    try {
      await onSave(fabric.id, {
        name,
        colorway: colorway.trim() ? colorway.trim() : null,
        priceMinCents,
        priceMaxCents,
        setupFeeCents,
        active,
      });

      setInitialFormState(currentFormState);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update fabric configuration.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Dark Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-[#101828]/50 backdrop-blur-xs z-50 transition-opacity"
        onClick={handleAttemptClose}
      />

      {/* Slide-Over Side Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col font-sans border-l border-[#D0D5DD] animate-slideInRight">
        {/* Panel Header */}
        <div className="p-5 border-b border-[#EAECF0] bg-[#F9FAFB] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#101828]">
                Configure Fabric Line
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#F2F4F7] text-[#344054] rounded border border-[#D0D5DD]">
                {fabric.name}
              </span>
            </div>
            <p className="text-xs text-[#475467]">
              Update volume price ranges, setup fee, and active status.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAttemptClose}
            className="w-8 h-8 rounded-md bg-white border border-[#D0D5DD] text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Associated Context Bar */}
        <div className="px-5 py-3 bg-[#F0F5FF] border-b border-[#D0D5DD] flex items-center justify-between text-xs">
          <span className="text-[#344054]">
            <strong>Product Spec:</strong> {fabric.productName || "Global Fabric Line"}
          </span>
          {fabric.subcategoryName && (
            <span className="text-[#2E5AAC] font-mono text-[11px] font-semibold">
              {fabric.categoryName} &rarr; {fabric.subcategoryName}
            </span>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-[#FEF3F2] border-b border-[#FECDCA] text-[#B42318] text-xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-[#B42318] font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Form Body */}
        <form id="fabric-form" onSubmit={handleSaveClick} className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
          {/* Fabric Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#344054]">
              Fabric Name Line
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-[#D0D5DD] rounded-md text-xs text-[#101828] focus:outline-none focus:ring-1 focus:ring-[#2E5AAC] focus:border-[#2E5AAC]"
            />
          </div>

          {/* Colorway / Variant Tag */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#344054]">
              Colorway / Variant Tag (Optional)
            </label>
            <input
              type="text"
              value={colorway}
              onChange={(e) => setColorway(e.target.value)}
              placeholder="e.g. Navy Super 130s Wool"
              className="w-full px-3 py-2 bg-white border border-[#D0D5DD] rounded-md text-xs text-[#101828] focus:outline-none focus:ring-1 focus:ring-[#2E5AAC] focus:border-[#2E5AAC]"
            />
          </div>

          {/* Unit Price Tiering (Min & Max Dollars) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#344054]">
                Min Unit Price ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono text-[#667085]">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minPriceDollars}
                  onChange={(e) => setMinPriceDollars(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2 bg-white border border-[#D0D5DD] rounded-md text-xs text-[#101828] font-mono focus:outline-none focus:ring-1 focus:ring-[#2E5AAC] focus:border-[#2E5AAC]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#344054]">
                Max Unit Price ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono text-[#667085]">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={maxPriceDollars}
                  onChange={(e) => setMaxPriceDollars(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2 bg-white border border-[#D0D5DD] rounded-md text-xs text-[#101828] font-mono focus:outline-none focus:ring-1 focus:ring-[#2E5AAC] focus:border-[#2E5AAC]"
                />
              </div>
            </div>
          </div>

          {/* Setup Fee ($) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#344054]">
              Fabric Setup / Milling Fee ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono text-[#667085]">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={setupFeeDollars}
                onChange={(e) => setSetupFeeDollars(e.target.value)}
                required
                className="w-full pl-7 pr-3 py-2 bg-white border border-[#D0D5DD] rounded-md text-xs text-[#101828] font-mono focus:outline-none focus:ring-1 focus:ring-[#2E5AAC] focus:border-[#2E5AAC]"
              />
            </div>
            <p className="text-[11px] text-[#667085]">
              One-off setup fee applied per production run when using this fabric tier.
            </p>
          </div>

          {/* Active Status Toggle */}
          <div className="pt-2 border-t border-[#EAECF0]">
            <label className="flex items-center justify-between p-3 rounded-md border border-[#D0D5DD] bg-[#F9FAFB] cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#101828] block">
                  Active Status
                </span>
                <span className="text-[11px] text-[#667085] block">
                  Enable or disable this fabric option across the B2B configurator.
                </span>
              </div>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 text-[#2E5AAC] rounded border-[#D0D5DD] focus:ring-[#2E5AAC]"
              />
            </label>
          </div>
        </form>

        {/* Footer Actions Bar */}
        <div className="p-5 border-t border-[#EAECF0] bg-[#F9FAFB] flex items-center justify-between">
          <button
            type="button"
            onClick={handleAttemptClose}
            className="px-4 py-2 bg-white border border-[#D0D5DD] hover:bg-[#F2F4F7] text-xs font-semibold text-[#344054] rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="fabric-form"
            disabled={saving || !hasUnsavedChanges}
            className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving Changes…" : "Save Tiering & Fees"}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-[#101828]/60 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-fadeIn">
          <div className="bg-white border border-[#D0D5DD] rounded-lg p-5 max-w-sm w-full shadow-xl space-y-4 font-sans">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#101828]">
                Discard Unsaved Changes?
              </h4>
              <p className="text-xs text-[#475467]">
                You have modified price tiering or setup fees for {fabric.name}. Discarding will revert all pending edits.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmClose(false)}
                className="px-3 py-1.5 bg-white border border-[#D0D5DD] text-xs font-semibold text-[#344054] rounded-md hover:bg-[#F2F4F7]"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-3 py-1.5 bg-[#B42318] text-white text-xs font-semibold rounded-md hover:bg-[#912015]"
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
