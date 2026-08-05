"use client";

import type { FabricColorOption } from "./FabricPicker";

interface ColorPickerProps {
  colors: FabricColorOption[];
  selectedColorIds: string[];
  onToggleColor: (colorId: string) => void;
  onSelectAll: () => void;
}

export function ColorPicker({
  colors,
  selectedColorIds,
  onToggleColor,
  onSelectAll,
}: ColorPickerProps) {
  if (!colors || colors.length === 0) {
    return (
      <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-none flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[var(--color-accent)] text-lg">
            palette
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
              Standard Fabric Colorway
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              This fabric line includes standard B2B production dyeing per order specification.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-none">
          Default Applied
        </span>
      </div>
    );
  }

  const allSelected = selectedColorIds.length === colors.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Select One or More Colourways ({selectedColorIds.length} of {colors.length} selected)
        </p>
        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] hover:underline cursor-pointer min-h-[44px] px-2 flex items-center"
        >
          {allSelected ? "Deselect All" : "Select All Colours"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {colors.map((color) => {
          const checked = selectedColorIds.includes(color.id);
          return (
            <label
              key={color.id}
              htmlFor={`color-${color.id}`}
              className={`relative p-4 border rounded-none cursor-pointer transition-colors flex items-center gap-3.5 select-none min-h-[56px] ${
                checked
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 text-[var(--color-text-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)]"
              }`}
            >
              <input
                type="checkbox"
                id={`color-${color.id}`}
                checked={checked}
                onChange={() => onToggleColor(color.id)}
                className="sr-only"
              />
              <span
                className="w-6 h-6 rounded-none border border-[var(--color-border)] shrink-0 shadow-sm"
                style={{ backgroundColor: color.hexCode }}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold tracking-wider uppercase flex-grow truncate">
                {color.name}
              </span>
              <span
                className={`material-symbols-outlined text-base shrink-0 ${
                  checked ? "text-[var(--color-accent)]" : "opacity-0"
                }`}
              >
                check_box
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
