"use client";

import React from "react";
import Link from "next/link";
import type { CustomerOrder } from "@/app/portal/orders/page";

export interface OrderDetailModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const refNo = order.proforma?.refNo || (order.id.startsWith("#") ? order.id : `#${order.id.slice(-6).toUpperCase()}`);
  const firstLine = order.lines[0];
  const productName = firstLine?.product?.name || "Custom Garment";
  const fabricName = (firstLine as any)?.fabric?.name || (firstLine as any)?.fabricName || "Standard Premium Blend";
  const fitName = (firstLine as any)?.fit?.name || (firstLine as any)?.selectedFit || (firstLine as any)?.fitName || "Regular Fit";

  const totalUnits = order.totalUnits || order.lines.reduce((acc, line) => acc + line.quantity, 0);

  // Check if Wholesale order
  const isWholesaleOrder =
    order.orderType === "WHOLESALE" ||
    (order as any).notes?.includes("WHOLESALE") ||
    (order.lines[0] && "wholesalerUnitPriceCents" in order.lines[0]);

  // Size breakdown formatted string (e.g. "S: 50 | M: 100 | L: 100")
  const stockBreakdownStr = (() => {
    const rawDist = (firstLine as any)?.sizeDistribution;
    if (rawDist) {
      try {
        const dist = typeof rawDist === "string" ? JSON.parse(rawDist) : rawDist;
        if (typeof dist === "object" && dist !== null) {
          return Object.entries(dist)
            .map(([size, qty]) => `${size}: ${qty}`)
            .join(" | ");
        }
      } catch (e) {
        // Fallback
      }
    }
    return `Total Units: ${totalUnits}`;
  })();

  // Pricing details calculation
  const listUnitPriceCents = (firstLine as any)?.unitPriceCents || 0;
  const listUnitPrice = `$${(listUnitPriceCents / 100).toFixed(2)}`;

  const offeredUnitPriceCents = (firstLine as any)?.offeredUnitPriceCents || listUnitPriceCents;
  const offeredUnitPrice = `$${(offeredUnitPriceCents / 100).toFixed(2)}`;

  // Calculated bulk discount percentage
  const bulkDiscountText = (() => {
    if (listUnitPriceCents > 0 && offeredUnitPriceCents < listUnitPriceCents) {
      const discountPct = Math.round(
        ((listUnitPriceCents - offeredUnitPriceCents) / listUnitPriceCents) * 100
      );
      return `${discountPct}% OFF`;
    }
    return null;
  })();

  // Calculated total formatted string
  const totalFormatted =
    order.totalCents > 0
      ? `$${(order.totalCents / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "$0.00";

  // Production/Delivery estimate (e.g. "10-14 Business Days")
  const deliveryEstimateStr = "10–14 Business Days";

  // Timeline stage tracker
  const allStages = [
    { key: "PENDING", label: "Order Submitted", desc: "Order details received" },
    { key: "APPROVED", label: "Approved / Proforma Sent", desc: "Verified by atelier" },
    { key: "PAID", label: "Payment Verified", desc: "Payment processed" },
    { key: "SHIPPED", label: "Shipped", desc: "Dispatched to destination" },
  ];

  const currentStatusIndex = (() => {
    switch (String(order.status).toUpperCase()) {
      case "PENDING":
      case "PENDING_REVIEW":
        return 1;
      case "APPROVED":
      case "PROFORMA_SENT":
        return 2;
      case "PAID":
        return 3;
      case "SHIPPED":
      case "IN_PRODUCTION":
        return 4;
      case "CANCELLED":
        return -1;
      default:
        return 1;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-none w-full max-w-[640px] text-[var(--color-text-primary)] shadow-2xl relative my-8 transition-colors">
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
              ORDER {refNo}
            </h2>
            {isWholesaleOrder && (
              <span className="text-[10px] bg-[var(--color-accent)] text-white px-2 py-0.5 font-bold uppercase rounded-none">
                WHOLESALE
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] text-xl font-bold cursor-pointer min-h-[44px] min-w-[44px]"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Order Summary */}
          <div>
            <h3 className="font-mono font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px] pb-1 border-b border-[var(--color-border)] mb-3">
              ORDER SUMMARY
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Order ID:</span>
                <span className="font-mono font-bold text-[var(--color-text-primary)]">{refNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Date Created:</span>
                <span className="font-mono text-[var(--color-text-primary)]">{dateStr}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[var(--color-text-secondary)]">Status:</span>
                <span className="font-bold font-mono uppercase text-[var(--color-status-info)]">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Product & Stock Matrix Breakdown Details */}
          <div>
            <h3 className="font-mono font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px] pb-1 border-b border-[var(--color-border)] mb-3">
              PRODUCT &amp; STOCK BREAKDOWN
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Garment Item:</span>
                <span className="font-bold text-[var(--color-text-primary)]">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Fabric:</span>
                <span className="text-[var(--color-text-primary)]">{fabricName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Fit:</span>
                <span className="text-[var(--color-text-primary)]">{fitName}</span>
              </div>

              {/* Stock Breakdown by Size */}
              <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none space-y-1">
                <span className="text-[var(--color-text-secondary)] block font-bold text-[11px] uppercase">
                  Stock Breakdown by Size:
                </span>
                <div className="font-mono text-[var(--color-status-success)] font-bold text-sm tracking-wide">
                  {stockBreakdownStr}
                </div>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-[var(--color-text-secondary)]">Total Units Ordered:</span>
                <span className="font-mono font-bold text-[var(--color-text-primary)]">{totalUnits}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Delivery Estimate:</span>
                <span className="font-mono text-[var(--color-status-info)]">{deliveryEstimateStr}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Bulk Discount Details */}
          <div>
            <h3 className="font-mono font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px] pb-1 border-b border-[var(--color-border)] mb-3">
              PRICING &amp; NEGOTIATED OFFERS
            </h3>
            <div className="space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">List Unit Price:</span>
                <span className="text-[var(--color-text-primary)] tabular-nums">{listUnitPrice}</span>
              </div>

              {isWholesaleOrder && (
                <div className="flex justify-between text-[var(--color-status-success)]">
                  <span>Negotiated Offer Price:</span>
                  <span className="tabular-nums font-bold">✓ {offeredUnitPrice}</span>
                </div>
              )}

              {/* Bulk Discount Applied (%) */}
              {bulkDiscountText && (
                <div className="flex justify-between text-[var(--color-status-success)] bg-[var(--color-status-success-bg)] p-2 border border-[var(--color-status-success)]/30">
                  <span className="font-bold uppercase">Bulk Discount Applied:</span>
                  <span className="font-bold">{bulkDiscountText}</span>
                </div>
              )}

              <div className="flex justify-between text-sm pt-2 border-t border-[var(--color-border)]">
                <span className="font-bold text-[var(--color-text-primary)]">Total Order Cost:</span>
                <span className="font-bold text-[var(--color-accent)] tabular-nums">{totalFormatted}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Order Timeline */}
          <div>
            <h3 className="font-mono font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px] pb-1 border-b border-[var(--color-border)] mb-3">
              ORDER TIMELINE
            </h3>
            <div className="space-y-2.5 pl-2">
              {allStages.map((stage, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                let icon = isCompleted ? "✓" : "→";
                let textColor = "text-[var(--color-text-secondary)]";
                if (isCompleted) textColor = "text-[var(--color-status-success)]";
                if (isCurrent) textColor = "text-[var(--color-status-warning)] font-bold";

                return (
                  <div key={stage.key} className="flex items-start gap-2.5">
                    <span className={`font-mono text-xs font-bold ${textColor}`}>
                      {icon}
                    </span>
                    <div>
                      <span className={`text-xs font-semibold ${textColor}`}>
                        {stage.label}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-secondary)] block">
                        {stage.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col sm:flex-row gap-3">
          <a
            href={`/api/proforma/pdf/${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 bg-[var(--color-accent)] hover:bg-[#1E3F7F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>Download Proforma Invoice PDF</span>
          </a>
          <Link
            href="/portal/support"
            className="flex-1 h-12 bg-transparent hover:bg-[var(--color-surface)] text-[var(--color-accent)] border-2 border-[var(--color-accent)] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>Contact Wholesale Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
