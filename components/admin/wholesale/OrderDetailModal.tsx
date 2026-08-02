"use client";

export interface WholesaleOrderLineItem {
  productName: string;
  colorVariant: string;
  sizeBreakdown: Record<string, number>;
  unitPriceUSD: number;
  lineTotalUSD: number;
}

export interface WholesaleOrderFull {
  id: string;
  orderId: string;
  customerName: string;
  dateSubmitted: string;
  status: "PENDING_REVIEW" | "APPROVED" | "IN_FULFILLMENT" | "SHIPPED" | "ON_HOLD";
  totalUnits: number;
  totalPriceUSD: number;
  suggestedUnitPriceUSD?: number | null;
  listUnitPriceUSD?: number | null;
  savingsUSD?: number | null;
  savingsPercent?: number | null;
  items: WholesaleOrderLineItem[];
}

export interface OrderDetailModalProps {
  isOpen: boolean;
  order: WholesaleOrderFull | null;
  onClose: () => void;
}

export function OrderDetailModal({ isOpen, order, onClose }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const statusLabel =
    order.status === "PENDING_REVIEW"
      ? "⏳ Pending Review"
      : order.status === "APPROVED"
      ? "✓ Approved"
      : order.status === "IN_FULFILLMENT"
      ? "📦 In Fulfillment"
      : order.status === "SHIPPED"
      ? "✅ Shipped"
      : "⚠️ On Hold";

  // Fulfillment timeline stages
  const stages = [
    { key: "RECEIVED", label: "Order Received", date: order.dateSubmitted, completed: true },
    {
      key: "REVIEW",
      label: "Price & Spec Review",
      date: order.status === "PENDING_REVIEW" ? "Pending admin decision" : "Completed",
      completed: order.status !== "PENDING_REVIEW",
    },
    {
      key: "FULFILLMENT",
      label: "Ready to Ship / Fulfillment",
      date: order.status === "IN_FULFILLMENT" || order.status === "SHIPPED" ? "In Progress" : "Pending",
      completed: order.status === "IN_FULFILLMENT" || order.status === "SHIPPED",
    },
    {
      key: "SHIPPED",
      label: "Dispatched & Shipped",
      date: order.status === "SHIPPED" ? "Completed" : "Pending",
      completed: order.status === "SHIPPED",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[620px] text-[var(--color-text-primary)] shadow-2xl relative p-6 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <h2 className="text-base font-bold font-mono text-[var(--color-text-primary)]">
            ORDER {order.orderId}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-lg font-bold cursor-pointer"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 text-xs max-h-[70vh] overflow-y-auto pr-1">
          {/* Section 1: Order Summary */}
          <div>
            <h3 className="font-mono font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px] pb-1.5 border-b border-[var(--color-border)] mb-3">
              ORDER SUMMARY
            </h3>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Order ID:</span>
                <span className="font-bold text-[var(--color-text-primary)]">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Customer:</span>
                <span className="font-bold text-[var(--color-text-primary)]">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Date Submitted:</span>
                <span className="text-[var(--color-text-primary)]">{order.dateSubmitted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Status:</span>
                <span className="font-bold text-[var(--color-accent)]">{statusLabel}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[var(--color-border)]">
                <span className="text-[var(--color-text-secondary)]">Total Units:</span>
                <span className="font-bold text-[var(--color-text-primary)]">{order.totalUnits}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[var(--color-text-primary)] pt-1">
                <span>Total Price:</span>
                <span className="tabular-nums text-[var(--color-accent)]">
                  ${order.totalPriceUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Items Breakdown */}
          <div>
            <h3 className="font-mono font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px] pb-1.5 border-b border-[var(--color-border)] mb-3">
              ITEMS BREAKDOWN
            </h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--color-bg)] border border-[var(--color-border)] p-3.5 rounded-none space-y-2"
                >
                  <div className="font-bold text-[var(--color-text-primary)]">
                    {item.productName} — <span className="text-[var(--color-accent)]">{item.colorVariant}</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-[var(--color-text-secondary)] pl-2 border-l-2 border-[var(--color-border)]">
                    {Object.entries(item.sizeBreakdown).map(([sz, qty]) => (
                      <div key={sz} className="flex justify-between">
                        <span>
                          Size {sz}: {qty} units @ ${item.unitPriceUSD.toFixed(2)}
                        </span>
                        <span className="font-bold text-[var(--color-text-primary)]">
                          ${(qty * item.unitPriceUSD).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-mono font-bold text-xs text-[var(--color-text-primary)] pt-1 border-t border-[var(--color-border)]">
                    <span>Item Total:</span>
                    <span>${item.lineTotalUSD.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Customer Price Offer */}
          {order.suggestedUnitPriceUSD && (
            <div>
              <h3 className="font-mono font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px] pb-1.5 border-b border-[var(--color-border)] mb-3">
                CUSTOMER PRICE OFFER
              </h3>
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-none space-y-1.5 font-mono text-xs text-emerald-500">
                <div className="flex justify-between">
                  <span>Suggested Price:</span>
                  <span className="font-bold">
                    ${order.suggestedUnitPriceUSD.toFixed(2)}/unit (vs ${order.listUnitPriceUSD?.toFixed(2)} list)
                  </span>
                </div>
                {order.savingsUSD && (
                  <div className="flex justify-between">
                    <span>Total Savings:</span>
                    <span className="font-bold">
                      ${order.savingsUSD.toFixed(2)} ({order.savingsPercent}% discount)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Fulfillment Timeline */}
          <div>
            <h3 className="font-mono font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px] pb-1.5 border-b border-[var(--color-border)] mb-3">
              FULFILLMENT TIMELINE
            </h3>
            <div className="space-y-3 pl-2">
              {stages.map((stg) => (
                <div key={stg.key} className="flex items-start gap-3">
                  <span
                    className={`font-mono text-xs font-bold ${
                      stg.completed ? "text-emerald-500" : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {stg.completed ? "✓" : "→"}
                  </span>
                  <div>
                    <span
                      className={`text-xs font-semibold ${
                        stg.completed ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {stg.label}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-secondary)] block font-mono">
                      {stg.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] rounded-none font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
