"use client";

import { useRef } from "react";
import type { LogoPlacement } from "@/app/generated/prisma/enums";

const POLO_BLUEPRINT_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBTSAoeVOLT6Iov43g3gTpmIBcHwl3CyklUgPMGB5RmKVWGK7L55GJkovkY3AHlt3IqofdbYnoqluUfo6tW0tM8mcRIjOKVa3-wo4QAh1BgXYOXV08PVc2MZWZSsGW6mURb0lkmQGZq245OFkbZEoTgDw5-rrEfzsm3gma9NjaWytDQWN3VpC-SulDRDje6PhXp9TCL8yDWEziwUFKoC5-eP0VoFsL33nwSpfz-Ng71pLl3bHwAftghmYB0P_wy-9S5Rrm_WUVAbCsN";

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
        className="border-2 border-dashed border-[#D1D5DB] rounded-lg bg-white p-8 flex flex-col items-center justify-center text-center hover:border-[#2E5AAC] transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <span className="material-symbols-outlined text-4xl text-[#5B6B85] mb-3">
          cloud_upload
        </span>
        <h3 className="text-sm font-semibold text-[#1A2233] mb-1 uppercase tracking-wider">
          Upload Vector Logo File
        </h3>
        <p className="text-xs text-[#5B6B85] mb-4">
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
          className="text-xs font-semibold text-[#2E5AAC] border border-[#2E5AAC] hover:bg-[#E6F1FB] px-4 py-2 rounded transition-colors uppercase tracking-wider"
        >
          {file ? "Change File" : "Select Vector File"}
        </button>
      </div>

      <div className="border border-[#D1D5DB] bg-white rounded-lg p-5 flex flex-col">
        <h3 className="text-sm font-semibold text-[#1A2233] mb-3 uppercase tracking-wider">
          Logo Placement Spec
        </h3>
        <div
          className="flex-grow flex items-center justify-center bg-[#F5F7FA] rounded border border-[#E5E7EB] relative overflow-hidden p-4"
          style={{ minHeight: 180 }}
        >
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center"
            style={{ backgroundImage: `url('${POLO_BLUEPRINT_IMAGE_URL}')` }}
          />
          <div className="relative z-10 flex gap-3">
            {PLACEMENT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border border-[#D1D5DB] rounded shadow-sm hover:border-[#2E5AAC]"
              >
                <input
                  type="radio"
                  name="placement"
                  className="text-[#2E5AAC] focus:ring-[#2E5AAC]"
                  checked={placement === option.value}
                  onChange={() => onPlacementChange(option.value)}
                />
                <span className="text-xs font-medium text-[#1A2233]">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
