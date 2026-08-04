"use client";

import React from "react";
import { parseQuantityInput } from "@/lib/configuratorLogic";

export interface SizeOptionDef {
  id: string;
  label: string;
  sortOrder: number;
}

export interface SizeSystemDef {
  id: string;
  name: string; // "Alpha", "Waist", "Chest", "Shoe", "OneSize"
  region: string; // "EU" or "US"
  options: SizeOptionDef[];
}

interface SizeQtyTableProps {
  sizeSystems?: SizeSystemDef[];
  activeRegion: "EU" | "US";
  onRegionChange: (region: "EU" | "US") => void;
  quantities: Record<string, number>;
  onChange: (quantities: Record<string, number>) => void;
  moqPerFabric?: number;
}

const DEFAULT_ALPHA_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

/**
 * Stepper increment for quantity inputs (+1 per click).
 */
const STEP_INCREMENT = 1;

export function SizeQtyTable({
  sizeSystems = [],
  activeRegion,
  onRegionChange,
  quantities,
  onChange,
  moqPerFabric = 50,
}: SizeQtyTableProps) {
  // Find system matching active region (e.g. EU or US)
  const currentSystem = sizeSystems.find((sys) => sys.region === activeRegion) || sizeSystems[0];
  const sizeOptions = currentSystem?.options.map((o) => o.label) || DEFAULT_ALPHA_SIZES;

  const totalUnits = Object.values(quantities).reduce((acc, qty) => acc + (qty || 0), 0);
  const isMoqMet = totalUnits >= moqPerFabric;

  function handleQtyChange(size: string, rawValue: string) {
    onChange({
      ...quantities,
      [size]: parseQuantityInput(rawValue),
    });
  }

  function handleStepClick(size: string, direction: "up" | "down") {
    const current = quantities[size] ?? 0;
    const delta = direction === "up" ? STEP_INCREMENT : -STEP_INCREMENT;
    onChange({
      ...quantities,
      [size]: Math.max(0, current + delta),
    });
  }

  // Calculate balanced column layout for two rows on desktop based on size count
  const count = sizeOptions.length;
  const isOneSize = count === 1;

  let desktopGridCols = "lg:grid-cols-4";
  if (count <= 4) {
    desktopGridCols = "lg:grid-cols-2";
  } else if (count <= 6) {
    desktopGridCols = "lg:grid-cols-3";
  } else if (count <= 8) {
    desktopGridCols = "lg:grid-cols-4";
  } else {
    desktopGridCols = "lg:grid-cols-5";
  }

  return (
    <div className="border border-[var(--color-border)] rounded-none bg-[var(--color-surface)] shadow-none transition-colors">
      {/* Header Bar */}
      <div className="bg-[var(--color-bg)] border-b border-[var(--color-border)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[var(--color-text-primary)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-text-primary)] font-mono">
              REGIONAL SIZING &amp; UNIT QUANTITY MATRIX
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] rounded-none">
              {currentSystem?.name || "Alpha Standard"} ({activeRegion})
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            Specify per-size unit production run. Minimum order quantity (MOQ) is {moqPerFabric} units.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Total Units Configured Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-mono">
            <span className="text-[var(--color-text-secondary)] uppercase text-[10px] font-semibold">
              Units Configured:
            </span>
            <span
              className={`font-bold tabular-nums ${
                isMoqMet
                  ? "text-[var(--color-status-success)]"
                  : "text-[var(--color-text-primary)]"
              }`}
            >
              {totalUnits} / {moqPerFabric}
            </span>
          </div>

          {/* Regional System Toggle */}
          <div className="inline-flex rounded-none border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 text-[var(--color-text-primary)]">
            <button
              type="button"
              onClick={() => onRegionChange("EU")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-colors cursor-pointer ${
                activeRegion === "EU"
                  ? "bg-[var(--color-text-primary)] text-[var(--color-bg)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              EU Standard
            </button>
            <button
              type="button"
              onClick={() => onRegionChange("US")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-colors cursor-pointer ${
                activeRegion === "US"
                  ? "bg-[var(--color-text-primary)] text-[var(--color-bg)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              US Standard
            </button>
          </div>
        </div>
      </div>

      {/* Two-Row Adaptable Size Matrix Layout */}
      <div className="p-4 sm:p-6 bg-[var(--color-surface)]">
        <div
          className={
            isOneSize
              ? "max-w-md mx-auto"
              : `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${desktopGridCols} gap-4`
          }
        >
          {sizeOptions.map((size) => {
            const qty = quantities[size] ?? 0;
            const hasQty = qty > 0;

            return (
              <div
                key={size}
                className={`flex flex-col justify-between p-4 border transition-all rounded-none min-h-[120px] ${
                  hasQty
                    ? "border-[var(--color-accent)] bg-[var(--color-bg)] shadow-xs"
                    : "border-[var(--color-border)] bg-[var(--color-bg)]/40 hover:border-[var(--color-text-secondary)]/50"
                }`}
              >
                {/* Size Cell Top Header: Size Label & Region */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border)] mb-3">
                  <span
                    className={`font-mono text-base font-bold tracking-tight ${
                      hasQty
                        ? "text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {size}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-secondary)] uppercase">
                    {activeRegion} CODE
                  </span>
                </div>

                {/* Quantity Value & Stepper Control Group */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-secondary)] uppercase font-semibold">
                    <span>UNIT QUANTITY</span>
                    <span className={hasQty ? "text-[var(--color-accent)] font-bold" : ""}>
                      {qty > 0 ? `${qty} UNITS` : "0 UNITS"}
                    </span>
                  </div>

                  <div className="inline-flex items-center border border-[var(--color-border)] rounded-none w-full bg-[var(--color-surface)]">
                    <button
                      type="button"
                      aria-label={`decrease quantity for size ${size}`}
                      onClick={() => handleStepClick(size, "down")}
                      className={`w-11 h-11 flex items-center justify-center text-base font-mono transition-colors cursor-pointer shrink-0 hover:bg-[var(--color-bg)] ${
                        hasQty
                          ? "text-[var(--color-text-primary)] font-bold"
                          : "text-[var(--color-text-secondary)]"
                      }`}
                    >
                      −
                    </button>
                    <input
                      aria-label={`${size} ${activeRegion}`}
                      className={`flex-1 min-w-0 h-11 bg-transparent text-center focus:outline-none px-2 text-base font-bold font-mono tabular-nums border-x border-[var(--color-border)] focus:border-[var(--color-accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        hasQty
                          ? "text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-secondary)]"
                      }`}
                      min={0}
                      type="number"
                      value={qty}
                      onChange={(event) => handleQtyChange(size, event.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={`increase quantity for size ${size}`}
                      onClick={() => handleStepClick(size, "up")}
                      className={`w-11 h-11 flex items-center justify-center text-base font-mono transition-colors cursor-pointer shrink-0 hover:bg-[var(--color-bg)] ${
                        hasQty
                          ? "text-[var(--color-text-primary)] font-bold"
                          : "text-[var(--color-text-secondary)]"
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
