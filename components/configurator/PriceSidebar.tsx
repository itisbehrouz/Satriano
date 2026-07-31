import { computeOrderPricing, type SizeQuantity } from "@/lib/pricing";
import { formatCents } from "@/lib/formatCurrency";

interface PriceSidebarProps {
  fabric: {
    name: string;
    priceMinCents: number;
    priceMaxCents: number;
    setupFeeCents: number;
  };
  sizeQuantities: SizeQuantity[];
  customerTargetPrice?: string;
  onSubmit?: () => void;
  submitting?: boolean;
  errorMessage?: string | null;
}

export function PriceSidebar({
  fabric,
  sizeQuantities,
  customerTargetPrice = "",
  onSubmit,
  submitting = false,
  errorMessage = null,
}: PriceSidebarProps) {
  const result = computeOrderPricing({ fabric, sizeQuantities });

  return (
    <div className="sticky top-24 bg-white border-2 border-[#2E5AAC]/40 rounded-lg p-6 flex flex-col h-auto shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-4">
        <h2 className="text-base font-semibold text-[#1A2233]">
          Price Guidance & Ledger
        </h2>
        <span className="text-[11px] font-semibold text-[#185FA5] uppercase tracking-wider bg-[#E6F1FB] px-2 py-0.5 rounded">
          Review Required
        </span>
      </div>

      <div className="flex flex-col gap-3 mb-6 text-sm">
        <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
          <span className="text-[#5B6B85]">Fabric Range ({fabric.name})</span>
          <span className="font-semibold text-[#1A2233] tabular-nums text-xs">
            {formatCents(fabric.priceMinCents)} – {formatCents(fabric.priceMaxCents)} / unit
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
          <span className="text-[#5B6B85]">Setup &amp; Branding Fee</span>
          <span className="font-semibold text-[#1A2233] tabular-nums">
            {formatCents(result.setupFeeCents)}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
          <span className="text-[#5B6B85]">Total Order Units</span>
          <span className="font-semibold text-[#1A2233] tabular-nums">
            {result.totalUnits}
          </span>
        </div>
        {customerTargetPrice.trim() !== "" && (
          <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2 bg-[#F5F7FA] p-2 rounded">
            <span className="text-[#5B6B85] text-xs">Target Budget / Unit</span>
            <span className="font-bold text-[#2E5AAC] tabular-nums">
              ${customerTargetPrice} / unit
            </span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-[#E5E7EB]">
        <div className="mb-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#5B6B85] block mb-1">
            Estimated Total Range
          </span>
          <span className="text-xl font-bold text-[#2E5AAC] tabular-nums block">
            {formatCents(result.estimatedTotalMinCents)} – {formatCents(result.estimatedTotalMaxCents)}
          </span>
          <p className="text-[11px] text-[#5B6B85] mt-1 leading-snug">
            Estimated range — final price confirmed after manual feasibility review.
          </p>
        </div>

        <button
          type="button"
          disabled={result.totalUnits === 0 || submitting}
          onClick={onSubmit}
          className="w-full bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs uppercase font-semibold tracking-wider py-3.5 px-6 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting for Review…" : "Submit Order for Feasibility Review →"}
        </button>

        {errorMessage && (
          <p className="text-center text-xs text-[#A32D2D] bg-[#FCEBEB] p-2 rounded mt-3">
            {errorMessage}
          </p>
        )}
        <p className="text-center text-xs text-[#5B6B85] mt-3">
          No instant charge. Our atelier team reviews your specs before final proforma delivery.
        </p>
      </div>
    </div>
  );
}
