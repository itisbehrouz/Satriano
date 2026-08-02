"use client";

import React from "react";
import Link from "next/link";
import type { CustomerOrder } from "@/app/portal/orders/page";

export interface OrderDetailModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const dateStr = new Date(order.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const refNo = order.proforma?.refNo || `#${order.id.slice(-6).toUpperCase()}`;

  const firstLine = order.lines[0];
  const productName = firstLine?.product?.name || "Custom Garment";
  const fabricName = firstLine?.fabric?.name || "Premium Garment Fabric";
  const fitName = firstLine?.selectedFit || "Regular Fit";

  // Build size breakdown string: "M (50) | L (75) | XL (25)"
  const sizeMap: Record<string, number> = {};
  let totalUnits = 0;
  order.lines.forEach((l) => {
    sizeMap[l.size] = (sizeMap[l.size] || 0) + l.quantity;
    totalUnits += l.quantity;
  });
  const sizeBreakdown = Object.entries(sizeMap)
    .map(([sz, qty]) => `${sz} (${qty})`)
    .join(" | ");

  const unitPriceFormatted =
    order.finalPriceCents && totalUnits > 0
      ? `$${(order.finalPriceCents / 100).toFixed(2)}`
      : order.customerTargetPriceCents
      ? `$${(order.customerTargetPriceCents / 100).toFixed(2)} target`
      : "Quote Pending";

  const totalFormatted =
    order.totalCents > 0
      ? `$${(order.totalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : order.customerTargetPriceCents
      ? `$${(order.customerTargetPriceCents / 100).toFixed(2)}`
      : "$0.00";

  // Define vertical timeline steps
  const allStages = [
    { key: "CREATED", label: "Order Created", desc: dateStr },
    { key: "PENDING_REVIEW", label: "Pending Review", desc: "Awaiting spec verification" },
    { key: "PROFORMA_SENT", label: "Proforma Sent", desc: "Official proforma quote" },
    { key: "PAID", label: "Payment & Approval", desc: "Payment verified" },
    { key: "IN_PRODUCTION", label: "In Production", desc: "Garment manufacturing" },
    { key: "SHIPPED", label: "Shipped", desc: "Dispatched to destination" },
  ];

  const currentStatusIndex = (() => {
    switch (order.status) {
      case "PENDING_REVIEW":
        return 1;
      case "PROFORMA_SENT":
        return 2;
      case "APPROVED":
      case "PAID":
        return 3;
      case "IN_PRODUCTION":
        return 4;
      case "SHIPPED":
        return 5;
      case "CANCELLED":
        return -1;
      default:
        return 0;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-[#132A52] border-2 border-[#2E5AAC] rounded-none w-full max-w-[600px] text-[#E8ECF3] shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2E5AAC] flex items-center justify-between">
          <h2 className="text-xl font-bold font-mono text-[#E8ECF3]">
            ORDER {refNo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8DA0C4] hover:text-[#2E5AAC] text-xl font-bold cursor-pointer"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Order Summary */}
          <div>
            <h3 className="font-mono font-bold text-[#8DA0C4] uppercase tracking-wider text-[11px] pb-1 border-b border-[#2E5AAC]/40 mb-3">
              ORDER SUMMARY
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">Order ID:</span>
                <span className="font-mono font-bold text-[#E8ECF3]">{refNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">Date Created:</span>
                <span className="font-mono text-[#E8ECF3]">{dateStr}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[#8DA0C4]">Status:</span>
                <span className="font-bold font-mono uppercase text-[#85B7EB]">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Product Details */}
          <div>
            <h3 className="font-mono font-bold text-[#8DA0C4] uppercase tracking-wider text-[11px] pb-1 border-b border-[#2E5AAC]/40 mb-3">
              PRODUCT DETAILS
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">Product:</span>
                <span className="font-bold text-[#E8ECF3]">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">Fabric:</span>
                <span className="text-[#E8ECF3]">{fabricName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">Fit:</span>
                <span className="text-[#E8ECF3]">{fitName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">Sizes:</span>
                <span className="font-mono text-[#E8ECF3]">{sizeBreakdown || "Standard"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">Total Units:</span>
                <span className="font-mono font-bold text-[#E8ECF3]">{totalUnits}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing */}
          <div>
            <h3 className="font-mono font-bold text-[#8DA0C4] uppercase tracking-wider text-[11px] pb-1 border-b border-[#2E5AAC]/40 mb-3">
              PRICING
            </h3>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">Unit Price:</span>
                <span className="text-[#E8ECF3] tabular-nums">{unitPriceFormatted}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#E8ECF3] pt-1 border-t border-[#2E5AAC]/30">
                <span>Total:</span>
                <span className="tabular-nums">{totalFormatted}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Order Timeline */}
          <div>
            <h3 className="font-mono font-bold text-[#8DA0C4] uppercase tracking-wider text-[11px] pb-1 border-b border-[#2E5AAC]/40 mb-3">
              ORDER TIMELINE
            </h3>
            <div className="space-y-2.5 pl-2">
              {allStages.map((stage, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                let icon = isCompleted ? "✓" : "→";
                let textColor = "text-[#8DA0C4]";
                if (isCompleted) textColor = "text-[#5DCAA5]";
                if (isCurrent) textColor = "text-[#F0B94A] font-bold";

                return (
                  <div key={stage.key} className="flex items-start gap-2.5">
                    <span className={`font-mono text-xs font-bold ${textColor}`}>
                      {icon}
                    </span>
                    <div>
                      <span className={`text-xs font-semibold ${textColor}`}>
                        {stage.label}
                      </span>
                      <span className="text-[11px] text-[#8DA0C4] block">
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
        <div className="p-6 border-t border-[#2E5AAC] bg-[#0B1E3D] flex flex-col sm:flex-row gap-3">
          <a
            href={`/api/proforma/pdf/${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 bg-[#2E5AAC] hover:bg-[#1E3F7F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>Download Proforma PDF</span>
          </a>
          <Link
            href="/portal/support"
            className="flex-1 h-12 bg-transparent hover:bg-[#1A3A5C] text-[#2E5AAC] border-2 border-[#2E5AAC] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>Contact Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
