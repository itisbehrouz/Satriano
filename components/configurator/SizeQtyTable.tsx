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
    <div className="border border-[#D1D5DB] rounded-lg bg-white overflow-hidden shadow-sm">
      {sizeSystems.length > 0 && (
        <div className="bg-[#F5F7FA] border-b border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-[#5B6B85]">
              Sizing System: {currentSystem?.name || "Standard"} ({activeRegion})
            </span>
            <p className="text-[11px] text-[#5B6B85] mt-0.5">
              Select regional measurement standard for your production lot.
            </p>
          </div>

          <div className="inline-flex rounded-md border border-[#D1D5DB] bg-white p-1">
            <button
              type="button"
              onClick={() => onRegionChange("EU")}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${activeRegion === "EU"
                  ? "bg-[#2E5AAC] text-white shadow-sm"
                  : "text-[#5B6B85] hover:text-[#1A2233]"
                }`}
            >
              EU Standard
            </button>
            <button
              type="button"
              onClick={() => onRegionChange("US")}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${activeRegion === "US"
                  ? "bg-[#2E5AAC] text-white shadow-sm"
                  : "text-[#5B6B85] hover:text-[#1A2233]"
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
            <tr className="border-b border-[#E5E7EB] bg-[#F5F7FA] text-xs uppercase font-semibold text-[#5B6B85]">
              <th className="py-3 px-4 w-1/3">Size Code ({activeRegion})</th>
              <th className="py-3 px-4 text-right">Unit Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#1A2233]">
            {sizeOptions.map((size) => (
              <tr key={size} className="hover:bg-[#F5F7FA]/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-[#1A2233]">
                  {size} <span className="text-[11px] font-normal text-[#5B6B85]">({activeRegion})</span>
                </td>
                <td className="py-3 px-4 text-right">
                  {/* Direct number input — still editable by typing */}
                  <input
                    aria-label={`${size} ${activeRegion}`}
                    className="w-28 bg-[#F5F7FA] border border-[#D1D5DB] text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none py-1.5 px-3 rounded text-sm text-right font-medium tabular-nums"
                    min={0}
                    type="number"
                    value={quantities[size] ?? 0}
                    onChange={(event) =>
                      handleQtyChange(size, event.target.value)
                    }
                  />
                  {/* +/- Stepper buttons — 44x44px touch target minimum via button-element */}
                  <div className="inline-flex px-2 py-1" style={{ minWidth: "88px" }}>
                    <button
                      type="button"
                      aria-label={`decrease quantity for size ${size}`}
                      onClick={() => handleStepClick(size, "down")}
                      className="px-4.5 py-4 text-xs font-mono rounded border border-[#D1D5DB] bg-[#E6F1FB] text-[#185FA5] transition-colors"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      aria-label={`increase quantity for size ${size}`}
                      onClick={() => handleStepClick(size, "up")}
                      className="px-4.5 py-4 text-xs font-mono rounded border border-[#D1D5DB] bg-[#E6F1FB] text-[#185FA5] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
