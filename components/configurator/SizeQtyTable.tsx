"use client";

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
 * Stepper increment for quantity inputs.
 * +1 per click is the most usable default — precise enough for wholesale MOQ tracking.
 * Long-press behavior: browsers auto-repeat keydown; user gets +N naturally without extra logic.
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

  return (
    <div className="border border-[var(--color-border)] rounded-none bg-[var(--color-surface)] overflow-hidden shadow-sm">
      {sizeSystems.length > 0 && (
        <div className="bg-[var(--color-bg)] border-b border-[var(--color-border)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[var(--color-text-primary)]">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-[var(--color-text-secondary)]">
              Sizing System: {currentSystem?.name || "Standard"} ({activeRegion})
            </span>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              Select regional measurement standard for your production lot.
            </p>
          </div>

          <div className="inline-flex rounded-none border border-[var(--color-border)] bg-[var(--color-surface)] p-1 text-[var(--color-text-primary)]">
            <button
              type="button"
              onClick={() => onRegionChange("EU")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-none transition-colors ${activeRegion === "EU"
                  ? "bg-[var(--color-text-primary)] text-[var(--color-bg)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
            >
              EU Standard
            </button>
            <button
              type="button"
              onClick={() => onRegionChange("US")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-none transition-colors ${activeRegion === "US"
                  ? "bg-[var(--color-text-primary)] text-[var(--color-bg)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
            >
              US Standard
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-xs uppercase font-semibold text-[var(--color-text-secondary)]">
              <th className="py-2.5 px-4 w-1/2">Size Code ({activeRegion})</th>
              <th className="py-2.5 px-4 text-right">Unit Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] text-sm">
            {sizeOptions.map((size) => {
              const qty = quantities[size] ?? 0;
              const hasQty = qty > 0;
              return (
                <tr 
                  key={size} 
                  className={`transition-colors bg-[var(--color-surface)] ${hasQty ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
                >
                  <td className="py-2 px-4 font-semibold">
                    {size} <span className="text-[11px] font-normal opacity-75">({activeRegion})</span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="inline-flex items-center border border-[var(--color-border)] rounded-none">
                      <button
                        type="button"
                        aria-label={`decrease quantity for size ${size}`}
                        onClick={() => handleStepClick(size, "down")}
                        className={`w-[44px] h-[44px] flex items-center justify-center text-xs font-mono transition-colors hover:text-[var(--color-accent)] ${hasQty ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
                      >
                        −
                      </button>
                      <input
                        aria-label={`${size} ${activeRegion}`}
                        className={`w-14 h-[44px] bg-transparent text-center focus:outline-none py-1.5 px-1 text-sm font-medium tabular-nums focus:text-[var(--color-accent)] border-x border-[var(--color-border)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${hasQty ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
                        min={0}
                        type="number"
                        value={qty}
                        onChange={(event) => handleQtyChange(size, event.target.value)}
                      />
                      <button
                        type="button"
                        aria-label={`increase quantity for size ${size}`}
                        onClick={() => handleStepClick(size, "up")}
                        className={`w-[44px] h-[44px] flex items-center justify-center text-xs font-mono transition-colors hover:text-[var(--color-accent)] ${hasQty ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
