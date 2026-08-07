import { computeOrderPricing, type SizeQuantity } from "@/lib/pricing";
import { formatCents } from "@/lib/formatCurrency";

interface PriceSidebarProps {
  fabric: {
    name: string;
    priceMinCents: number;
    priceMaxCents: number;
    setupFeeCents?: number;
  };
  sizeQuantities: SizeQuantity[];
  customerTargetPrice?: string;
  onSubmit?: () => void;
  submitting?: boolean;
  errorMessage?: string | null;
  totalUnits?: number;
  moqPerFabric?: number;
  submitLabel?: string;
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
  submitLabel = "Submit Order for Feasibility Review →",
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
  const stickyClass = "sticky top-[148px]";

  return (
    <div className={`${stickyClass} bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 flex flex-col h-auto transition-colors`}>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          Price Guidance & Ledger
        </h2>
        <span className="text-[11px] font-semibold text-[var(--color-accent)] uppercase tracking-wider bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-none border border-[var(--color-accent)]/20">
          Review Required
        </span>
      </div>

      {/* MOQ Progress Indicator */}
      <div className="flex flex-col gap-3 mb-6 text-sm">
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2">
          <span className="text-[var(--color-text-secondary)]">Fabric Range ({fabric.name})</span>
          <span className="font-semibold text-[var(--color-text-primary)] tabular-nums text-xs">
            {formatCents(fabric.priceMinCents)} – {formatCents(fabric.priceMaxCents)} / unit
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2">
          <span className="text-[var(--color-text-secondary)]">Total Order Units</span>
          <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
            {totalUnits}
          </span>
        </div>
        {customerTargetPrice.trim() !== "" && (
          <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2 bg-[var(--color-bg)] p-2 rounded-none">
            <span className="text-[var(--color-text-secondary)] text-xs">Target Budget / Unit</span>
            <span className="font-bold text-[var(--color-accent)] tabular-nums">
              ${customerTargetPrice} / unit
            </span>
          </div>
        )}
      </div>

      {/* Live MOQ Progress Section */}
      <div className="mb-5 bg-[var(--color-bg)] border border-[var(--color-border)] p-4 rounded-none space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            MOQ Progress
          </span>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-none ${
            meetsMoq ? "bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/30" : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
          }`}>
            {totalUnits} / {moqPerFabric} units ({progressPct}%)
          </span>
        </div>

        {/* Clean Modern Progress Bar */}
        <div className="w-full bg-[var(--color-border)] h-2.5 rounded-none overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              meetsMoq ? "bg-[var(--color-status-success)]" : "bg-amber-500"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Clean Status Message */}
        <div className={`p-2.5 rounded-none text-xs flex items-center gap-2 ${
          meetsMoq
            ? "bg-[var(--color-status-success-bg)] border border-[var(--color-status-success)]/30 text-[var(--color-status-success)]"
            : "bg-amber-500/10 border border-amber-500/30 text-amber-500"
        }`}>
          <span className="material-symbols-outlined text-base shrink-0">
            {meetsMoq ? "check_circle" : "info"}
          </span>
          <span className="leading-tight">
            {meetsMoq
              ? "Minimum order quantity met — ready for feasibility review."
              : `${unitsRemaining} more unit${unitsRemaining !== 1 ? "s" : ""} needed to reach MOQ threshold (${moqPerFabric} units per fabric).`}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
        <div className="mb-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] block mb-1">
            Estimated Total Range
          </span>
          <span className="text-xl font-bold text-[var(--color-accent)] tabular-nums block">
            {formatCents(result.estimatedTotalMinCents)} – {formatCents(result.estimatedTotalMaxCents)}
          </span>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 leading-snug">
            Estimated range — final price confirmed after manual feasibility review.
          </p>
        </div>

        <button
          type="button"
          disabled={!meetsMoq || totalUnits === 0 || submitting}
          onClick={onSubmit}
          aria-label={submitLabel.toLowerCase()}
          className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs uppercase font-bold tracking-wider py-3.5 px-6 rounded-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Adding..." : submitLabel}
        </button>

        {/* Inline gating message when below MOQ */}
        {!meetsMoq && (
          <p className="text-center text-xs bg-red-500/10 p-2 rounded-none mt-3 text-red-500 border border-red-500/20">
            Submission disabled: total units ({totalUnits}) are below the minimum order quantity ({moqPerFabric} units per fabric). Please adjust your size quantities to meet the MOQ before submitting.
          </p>
        )}

        {errorMessage && (
          <p className="text-center text-xs bg-red-500/10 p-2 rounded-none mt-3 text-red-500 border border-red-500/20">
            {errorMessage}
          </p>
        )}
        <p className="text-center text-xs text-[var(--color-text-secondary)] mt-3">
          No instant charge. Our atelier team reviews your specs before final proforma delivery.
        </p>
      </div>
    </div>
  );
}
