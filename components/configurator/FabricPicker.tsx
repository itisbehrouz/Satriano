import { formatCents } from "@/lib/formatCurrency";

export interface FabricOption {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceMinCents: number;
  priceMaxCents: number;
  setupFeeCents: number;
}

interface FabricPickerProps {
  fabrics: FabricOption[];
  selectedFabricId: string;
  onSelect: (fabricId: string) => void;
}

export function FabricPicker({ fabrics, selectedFabricId, onSelect }: FabricPickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {fabrics.map((fabric) => {
        const checked = fabric.id === selectedFabricId;
        return (
          <div key={fabric.id} className="relative">
            <input
              checked={checked}
              onChange={() => onSelect(fabric.id)}
              className="peer sr-only"
              id={`fabric-${fabric.id}`}
              name="fabric"
              type="radio"
              aria-label={fabric.name}
            />
            <label
              className={`block cursor-pointer border rounded-none p-4 bg-white transition-all h-full ${
                checked
                  ? "border-[#2E5AAC] ring-2 ring-[#2E5AAC]/20 bg-[#F5F7FA]"
                  : "border-[#D1D5DB] hover:border-[#2E5AAC]"
              }`}
              htmlFor={`fabric-${fabric.id}`}
            >
              <div
                className="w-full h-32 mb-4 bg-[#F5F7FA] rounded-none border border-[#E5E7EB] bg-cover bg-center"
                style={fabric.imageUrl ? { backgroundImage: `url('${fabric.imageUrl}')` } : undefined}
              />
              <h3 className="text-sm font-semibold text-[#1A2233] mb-1">
                {fabric.name}
              </h3>
              {fabric.description && (
                <p className="text-xs text-[#5B6B85] mb-2 leading-normal">
                  {fabric.description}
                </p>
              )}
              <p className="text-xs font-semibold text-[#2E5AAC] tabular-nums">
                Est. Range: {formatCents(fabric.priceMinCents)} – {formatCents(fabric.priceMaxCents)} / unit
              </p>
            </label>
            <div className="absolute top-3 right-3 hidden peer-checked:block text-[#2E5AAC]">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
