"use client";

export interface FitOption {
  id: string;
  name: string; // "Slim Fit", "Regular Fit", "Relaxed Fit", "Oversized Fit"
  code: string; // "SLIM", "REGULAR", "RELAXED", "OVERSIZED"
  description?: string | null;
}

interface FitPickerProps {
  fits: FitOption[];
  selectedFitId: string;
  onSelect: (fitId: string) => void;
}

export function FitPicker({ fits, selectedFitId, onSelect }: FitPickerProps) {
  if (!fits || fits.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fits.map((fit) => {
        const isSelected = fit.id === selectedFitId;
        return (
          <div
            key={fit.id}
            onClick={() => onSelect(fit.id)}
            className={`border rounded-none p-4 cursor-pointer transition-all flex flex-col justify-between ${
              isSelected
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)] text-[var(--color-text-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]/50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-bold text-sm text-[var(--color-text-primary)] block">
                  {fit.name}
                </span>
                <span className="text-[10px] font-mono uppercase text-[var(--color-accent)] font-semibold bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 px-2 py-0.5 rounded-none inline-block mt-1">
                  {fit.code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="garment-fit"
                  checked={isSelected}
                  onChange={() => onSelect(fit.id)}
                  className="sr-only"
                  aria-label={fit.name}
                />
                <div className={`w-5 h-5 rounded-none border flex items-center justify-center transition-colors ${
                  isSelected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-bg)]"
                }`}>
                  {isSelected && (
                    <span className="material-symbols-outlined text-xs font-bold">
                      check
                    </span>
                  )}
                </div>
              </div>
            </div>
            {fit.description && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-3 leading-relaxed">
                {fit.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
