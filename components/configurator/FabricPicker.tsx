import { formatCents } from "@/lib/formatCurrency";

export interface FabricColorOption {
  id: string;
  name: string;
  hexCode: string;
}

export interface FabricOption {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceMinCents: number;
  priceMaxCents: number;
  setupFeeCents?: number;
  moqPerColor?: number;
  colors?: FabricColorOption[];
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
              className={`block cursor-pointer border rounded-none p-4 transition-all h-full ${
                checked
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/50"
              }`}
              htmlFor={`fabric-${fabric.id}`}
            >
              <div
                className="w-full h-32 mb-4 bg-[var(--color-bg)] rounded-none border border-[var(--color-border)] bg-cover bg-center flex items-center justify-center text-[var(--color-text-secondary)]"
                style={fabric.imageUrl ? { backgroundImage: `url('${fabric.imageUrl}')` } : undefined}
              >
                {!fabric.imageUrl && (
                  <span className="material-symbols-outlined text-3xl opacity-40">
                    texture
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">
                {fabric.name}
              </h3>
              {fabric.description && (
                <p className="text-xs text-[var(--color-text-secondary)] mb-2 leading-normal">
                  {fabric.description}
                </p>
              )}
              <p className="text-xs font-semibold font-mono text-[var(--color-accent)] tabular-nums">
                Est. Range: {formatCents(fabric.priceMinCents)} – {formatCents(fabric.priceMaxCents)} / unit
              </p>
            </label>
            <div className="absolute top-3 right-3 hidden peer-checked:block text-[var(--color-accent)]">
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
