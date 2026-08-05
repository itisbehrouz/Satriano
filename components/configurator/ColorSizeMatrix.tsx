"use client";

import type { FabricColorOption } from "./FabricPicker";
import type { SizeSystemDef } from "./SizeQtyTable";
import { validateOrderMoq, type MoqValidationItem } from "@/lib/moqValidation";

export interface ColorSizeMatrixProps {
  selectedColors: FabricColorOption[];
  sizeSystems: SizeSystemDef[];
  activeRegion: "EU" | "US";
  onRegionChange: (region: "EU" | "US") => void;
  matrixQuantities: Record<string, Record<string, number>>; // colorId -> sizeLabel -> qty
  onQuantityChange: (colorId: string, sizeLabel: string, qty: number) => void;
  onClearAll: () => void;
  moqPerFabric: number;
  moqPerColor: number;
  fabricName: string;
}

export function ColorSizeMatrix({
  selectedColors,
  sizeSystems,
  activeRegion,
  onRegionChange,
  matrixQuantities,
  onQuantityChange,
  onClearAll,
  moqPerFabric,
  moqPerColor,
  fabricName,
}: ColorSizeMatrixProps) {
  // Find size options for active region
  const regionSystem = sizeSystems.find((sys) => sys.region === activeRegion) ?? sizeSystems[0];
  const sizeLabels = regionSystem?.options.map((opt) => opt.label) ?? [
    "XS", "S", "M", "L", "XL", "2XL", "3XL"
  ];

  // Default fallback row if no colors selected or fabric has no colors
  const activeRows: Array<{ id: string; name: string; hexCode: string | null }> =
    selectedColors.length > 0
      ? selectedColors
      : [{ id: "default", name: "Standard Color", hexCode: null }];

  // Build validation items for live validateOrderMoq check
  const moqValidationItems: MoqValidationItem[] = activeRows.map((row) => {
    const rowQtys = matrixQuantities[row.id] || {};
    const totalQty = Object.values(rowQtys).reduce((sum, q) => sum + (q || 0), 0);
    return {
      fabricId: "current_fabric",
      fabricName,
      colorId: row.id === "default" ? null : row.id,
      colorName: row.name,
      quantity: totalQty,
      moqPerFabric,
      moqPerColor,
    };
  });

  const moqValidation = validateOrderMoq(moqValidationItems);
  const totalFabricUnits = moqValidationItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-4">
      {/* Region Selector & Matrix Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Size System & Bulk Quantity Matrix
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Enter units per size for each selected colourway. Minimum {moqPerColor} units per colour, {moqPerFabric} units total.
          </p>
        </div>

        {sizeSystems.length > 1 && (
          <div className="flex items-center border border-[var(--color-border)] rounded-none p-0.5 bg-[var(--color-surface)]">
            {(["EU", "US"] as const).map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => onRegionChange(region)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-none transition-colors cursor-pointer min-h-[36px] ${
                  activeRegion === region
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {region} Sizing
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Order Matrix Table */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded-none overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] sticky left-0 bg-[var(--color-bg)] z-10 border-r border-[var(--color-border)] min-w-[180px]">
                Colourway
              </th>
              {sizeLabels.map((label) => (
                <th
                  key={label}
                  className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] min-w-[64px]"
                >
                  {label}
                </th>
              ))}
              <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] border-l border-[var(--color-border)] min-w-[110px]">
                Colour Total
              </th>
            </tr>
          </thead>
          <tbody>
            {activeRows.map((row) => {
              const rowQtys = matrixQuantities[row.id] || {};
              const colorTotal = sizeLabels.reduce(
                (sum, label) => sum + (rowQtys[label] || 0),
                0
              );
              const isColorPassing = colorTotal === 0 || colorTotal >= moqPerColor;

              return (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg)]/40 transition-colors"
                >
                  {/* Sticky Row Label (Hex Swatch + Name) */}
                  <td className="py-3 px-4 sticky left-0 bg-[var(--color-surface)] z-10 border-r border-[var(--color-border)]">
                    <div className="flex items-center gap-2.5">
                      {row.hexCode && (
                        <span
                          className="w-4 h-4 rounded-none border border-[var(--color-border)] shrink-0"
                          style={{ backgroundColor: row.hexCode }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] truncate max-w-[140px]">
                        {row.name}
                      </span>
                    </div>
                  </td>

                  {/* Quantity Cells */}
                  {sizeLabels.map((label) => {
                    const currentQty = rowQtys[label] || 0;
                    return (
                      <td key={label} className="p-2 text-center">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={currentQty === 0 ? "" : currentQty}
                          placeholder="0"
                          onChange={(e) => {
                            const parsed = parseInt(e.target.value, 10);
                            onQuantityChange(
                              row.id,
                              label,
                              isNaN(parsed) || parsed < 0 ? 0 : parsed
                            );
                          }}
                          className="w-full h-11 text-center font-mono text-sm font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                        />
                      </td>
                    );
                  })}

                  {/* Per-Colour MOQ Running Total */}
                  <td className="py-3 px-4 text-right border-l border-[var(--color-border)]">
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-xs font-bold text-[var(--color-text-primary)]">
                        {colorTotal} / {moqPerColor}
                      </span>
                      {colorTotal > 0 && (
                        <span
                          className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
                            isColorPassing
                              ? "text-emerald-500"
                              : "text-[var(--color-accent)]"
                          }`}
                        >
                          {isColorPassing ? "PASS" : "MIN 20"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Matrix Footer Bar: Totals & Clear All */}
      <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="border-l-2 border-[var(--color-accent)] pl-3">
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold block">
              Total Configured Units
            </span>
            <span className="font-mono text-lg font-bold text-[var(--color-text-primary)]">
              {totalFabricUnits} / {moqPerFabric} pcs
            </span>
          </div>

          {!moqValidation.valid && (
            <div className="px-3 py-1.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 text-xs font-semibold rounded-none flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>{moqValidation.error}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:underline cursor-pointer min-h-[44px] px-3 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">restart_alt</span>
          <span>Clear All Quantities</span>
        </button>
      </div>
    </div>
  );
}
