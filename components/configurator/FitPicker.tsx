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
            className={`border rounded-lg p-4 cursor-pointer transition-all flex flex-col justify-between ${
              isSelected
                ? "border-[#2E5AAC] bg-[#E6F1FB]/30 ring-1 ring-[#2E5AAC]"
                : "border-[#D1D5DB] bg-white hover:border-[#2E5AAC]/60"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-sm text-[#1A2233] block">
                  {fit.name}
                </span>
                <span className="text-[10px] font-mono uppercase text-[#2E5AAC] font-semibold bg-[#E6F1FB] px-2 py-0.5 rounded inline-block mt-1">
                  {fit.code}
                </span>
              </div>
              <input
                type="radio"
                name="garment-fit"
                checked={isSelected}
                onChange={() => onSelect(fit.id)}
                className="mt-1 h-4 w-4 text-[#2E5AAC] focus:ring-[#2E5AAC]"
                aria-label={fit.name}
              />
            </div>
            {fit.description && (
              <p className="text-xs text-[#5B6B85] mt-2 leading-relaxed">
                {fit.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
