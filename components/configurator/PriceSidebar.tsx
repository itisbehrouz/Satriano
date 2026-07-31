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
  totalUnits?: number;
  moqPerFabric?: number;
}

export function PriceSidebar({
  fabric,
  sizeQuantities,
  customerTargetPrice = "",
  onSubmit,
  submitting = false,
  errorMessage = null,
  totalUnits: propTotalUnits,
  moqPerFabric = 50,
}: PriceSidebarProps) {
  const result = computeOrderPricing({ fabric, sizeQuantities });

  // Use prop if provided (ConfiguratorClient pre-calculates), otherwise derive from pricing
  const totalUnits = propTotalUnits ?? result.totalUnits;

  // MOQ gating logic
  const meetsMoq = totalUnits >= moqPerFabric;
  const unitsRemaining = Math.max(0, moqPerFabric - totalUnits);

  // Progress percentage for the indicator (capped at 100%)
  const progressPct = Math.min(100, Math.round((totalUnits / moqPerFabric) * 100));

  // Sticky positioning: use CSS sticky on wide viewports (lg: ~1024px+).
  // On narrow/mobile viewports the grid collapses and sticky top-24 degrades
  // gracefully to normal flow since there is no scroll context.
  const stickyClass = "sticky top-24";

  return (
    <div className={`${stickyClass} bg-white border-2 border-[#2E5AAC]/40 rounded-lg p-6 flex flex-col h-auto shadow-sm`}>
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-4">
        <h2 className="text-base font-semibold text-[#1A2233]">
          Price Guidance & Ledger
        </h2>
        <span className="text-[11px] font-semibold text-[#185FA5] uppercase tracking-wider bg-[#E6F1FB] px-2 py-0.5 rounded">
          Review Required
        </span>
      </div>

      {/* MOQ Progress Indicator — Part B */}
      <div className="flex flex-col gap-3 mb-6 text-sm">
        <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
          <span className="text-[#5B6B85]">Fabric Range ({fabric.name})</span>
          <span className="font-semibold text-[#1A2233] tabular-nums text-xs">
            {formatCents(fabric.priceMinCents)} – {formatCents(fabric.priceMaxCents)} / unit
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
          <span className="text-[#5B6B85]">Setup & Branding Fee</span>
          <span className="font-semibold text-[#1A2233] tabular-nums">
            {formatCents(result.setupFeeCents)}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
          <span className="text-[#5B6B85]">Total Order Units</span>
          <span className="font-semibold text-[#1A2233] tabular-nums">
            {totalUnits}
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

      {/* Live MOQ Progress Bar */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
          <span className="text-[#5B6B85] font-semibold">Minimum Order Quantity Progress</span>
        </div>
        {/* Progress bar: amber/incomplete vs green/checkmark */}
        <div className="flex items-center gap-1 mb-2">
          {/* Bar fill */}
          <div
            className={`border border-[#D1D5DB] rounded px-3 py-0.5 text-xs font-mono tabular-nums ${meetsMoq
                ? "bg-[#E8F0FB] text-[#2E5AAC]"
                : "bg-[#FCEBEB] text-[#A32D2D]"
              }`}
          >
            <span className="text-xs font-semibold">
              {totalUnits} / {moqPerFabric} units
            </span>
            <span className="text-xs">
              {" "}
              ({progressPct}%)
            </span>
          </div>
          {/* Progress bar visual */}
          <div className="flex items-center gap-0.5 px-3 py-1 rounded border border-[#D1D5DB] bg-[#F5F7FA]">
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className={`px-2 py-1 rounded ${i < Math.ceil(progressPct / 10)
                    ? meetsMoq
                      ? "bg-[#E8F0FB] text-[#2E5AAC]"
                      : "bg-[#FCEBEB] text-[#A32D2D]"
                    : "text-[#5B6B85]"
                  }`}
              >
                {i < Math.ceil(progressPct / 10) ? (meetsMoq ? "\u2714" : "\u25CB") : "\u25CB"}
              </span>
            ))}
          </div>
        </div>
        {/* Status message */}
        <p className={`text-center text-xs ${meetsMoq
            ? "bg-[#E8F0FB] p-2 rounded mt-1 text-[#2E5AAC]"
            : "bg-[#FCEBEB] p-2 rounded mt-1 text-[#A32D2D]"
          }`}>
          {meetsMoq
            ? "\u2714 Minimum order quantity met — ready for feasibility review."
            : `${unitsRemaining} more unit${unitsRemaining !== 1 ? "s" : ""} needed to reach minimum order (${moqPerFabric} units per fabric).`}
        </p>
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

        {/* Submit button with MOQ gating */}
        <button
          type="button"
          disabled={!meetsMoq || totalUnits === 0 || submitting}
          onClick={onSubmit}
          aria-label="submit order for feasibility review"
          className={`w-full bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs uppercase font-semibold tracking-wider py-3.5 px-6 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${!meetsMoq ? "bg-[#FCEBEB] hover:bg-[#F7D9D9]" : ""
            }`}
        >
          {submitting ? "Submitting for Review..." : "Submit Order for Feasibility Review \u2192"}
        </button>

        {/* Inline gating message when below MOQ */}
        {!meetsMoq && (
          <p className={`text-center text-xs ${"bg-[#FCEBEB] p-2 rounded mt-3 text-[#A32D2D]"
            }`}>
            Submission disabled: total units ({totalUnits}) are below the minimum order quantity ({moqPerFabric} units per fabric). Please adjust your size quantities to meet the MOQ before submitting.
          </p>
        )}

        {errorMessage && (
          <p className={`text-center text-xs ${"bg-[#FCEBEB] p-2 rounded mt-3 text-[#A32D2D]"
            }`}>
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
