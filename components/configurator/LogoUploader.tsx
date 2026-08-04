"use client";

import { useRef } from "react";
import type { LogoPlacement } from "@/app/generated/prisma/enums";

const PLACEMENT_OPTIONS: { value: LogoPlacement; label: string }[] = [
  { value: "LEFT_CHEST", label: "Left Chest" },
  { value: "RIGHT_SLEEVE", label: "Right Sleeve" },
];

interface LogoUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  placement: LogoPlacement;
  onPlacementChange: (placement: LogoPlacement) => void;
}

export function LogoUploader({
  file,
  onFileChange,
  placement,
  onPlacementChange,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        className="border-2 border-dashed border-[var(--color-border)] rounded-none bg-[var(--color-surface)] text-[var(--color-text-primary)] p-8 flex flex-col items-center justify-center text-center hover:border-[var(--color-accent)] transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <span className="material-symbols-outlined text-4xl text-[var(--color-text-secondary)] mb-3">
          cloud_upload
        </span>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1 uppercase tracking-wider">
          Upload Vector Logo File
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">
          {file ? file.name : "Supports .ai, .eps, .svg vector formats."}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".ai,.eps,.svg"
          className="hidden"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
          className="text-xs font-semibold text-[var(--color-accent)] border border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white px-4 py-2 rounded-none transition-colors uppercase tracking-wider"
        >
          {file ? "Change File" : "Select Vector File"}
        </button>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-none p-5 flex flex-col">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 uppercase tracking-wider">
          Logo Placement Spec
        </h3>
        <div
          className="flex-grow flex flex-col items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-none border border-[var(--color-border)] relative overflow-hidden p-6"
          style={{ minHeight: 180 }}
        >
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-4">
            <span className="material-symbols-outlined text-3xl">stitching</span>
            <span className="text-xs font-semibold uppercase tracking-widest">
              Atelier Placement Guide
            </span>
          </div>
          <div className="relative z-10 flex gap-3">
            {PLACEMENT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer bg-[var(--color-surface)] text-[var(--color-text-primary)] px-3.5 py-2 border border-[var(--color-border)] rounded-none shadow-sm hover:border-[var(--color-accent)] transition-colors"
              >
                <input
                  type="radio"
                  name="placement"
                  className="text-[var(--color-accent)] bg-[var(--color-surface)] border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:ring-offset-[var(--color-surface)]"
                  checked={placement === option.value}
                  onChange={() => onPlacementChange(option.value)}
                />
                <span className="text-xs font-medium text-[var(--color-text-primary)]">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
