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

  const isWholesaleOrder =
    (order as any).orderType === "WHOLESALE" ||
    order.id.startsWith("#WH") ||
    !!(order as any).stockBreakdown ||
    !!(order as any).offeredUnitPriceUSD;

  const dateStr = new Date(order.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const refNo = order.proforma?.refNo || (order.id.startsWith("#") ? order.id : `#${order.id.slice(-6).toUpperCase()}`);

  const firstLine = order.lines[0];
  const productName = firstLine?.product?.name || (order as any).items?.[0]?.name || "Shawl Lapel Slim Fit Blazer";
  const fabricName = firstLine?.fabric?.name || "Ready-Made Stock Garment";
  const fitName = firstLine?.selectedFit || "Slim Fit";

  // Build size breakdown string: "36(3) 38(5) 40(1) 44(3)"
  const sizeMap: Record<string, number> = {};
  let totalUnits = order.totalUnits || 0;

  if (order.lines && order.lines.length > 0) {
    order.lines.forEach((l) => {
      sizeMap[l.size] = (sizeMap[l.size] || 0) + l.quantity;
      if (!order.totalUnits) totalUnits += l.quantity;
    });
  }

  const stockBreakdownStr = (order as any).stockBreakdown
    ? typeof (order as any).stockBreakdown === "string"
      ? (order as any).stockBreakdown
      : Object.entries((order as any).stockBreakdown)
          .map(([sz, qty]) => `${sz}(${qty})`)
          .join(" ")
    : Object.keys(sizeMap).length > 0
    ? Object.entries(sizeMap)
        .map(([sz, qty]) => `${sz}(${qty})`)
        .join(" ")
    : "36(3) 38(5) 40(1) 44(3)";

  const unitPriceFormatted =
    order.finalPriceCents && totalUnits > 0
      ? `$${(order.finalPriceCents / 100).toFixed(2)}`
      : order.customerTargetPriceCents
      ? `$${(order.customerTargetPriceCents / 100).toFixed(2)} target`
      : "$125.00/unit";

  const offeredUnitPrice = (order as any).offeredUnitPriceUSD
    ? `$${(order as any).offeredUnitPriceUSD.toFixed(2)}/unit (Offered)`
    : isWholesaleOrder
    ? "$100.00/unit (Offered)"
    : null;

  const listUnitPrice = (order as any).listUnitPriceUSD
    ? `$${(order as any).listUnitPriceUSD.toFixed(2)}/unit (List)`
    : "$125.00/unit (List)";

  const bulkDiscountText = (order as any).bulkDiscountPercent
    ? `${(order as any).bulkDiscountPercent}% Bulk Discount Applied (-$300.00)`
    : isWholesaleOrder
    ? "20% Bulk Discount Applied (-$300.00)"
    : null;

  const deliveryEstimateStr =
    (order as any).deliveryEstimate || "Immediate Dispatch (3–5 Business Days)";

  const totalFormatted =
    order.totalCents > 0
      ? `$${(order.totalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : (order as any).totalUSD
      ? `$${(order as any).totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : order.customerTargetPriceCents
      ? `$${(order.customerTargetPriceCents / 100).toFixed(2)}`
      : "$1,200.00";

  // Define vertical timeline steps
  const allStages = [
    { key: "CREATED", label: "Order Placed", desc: dateStr },
    { key: "PENDING_REVIEW", label: "Pending Review", desc: "Awaiting spec / bulk offer verification" },
    { key: "APPROVED", label: "Approved & Invoiced", desc: "Order approved for dispatch" },
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
      <div className="bg-[#132A52] border-2 border-[#2E5AAC] rounded-none w-full max-w-[640px] text-[#E8ECF3] shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2E5AAC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono text-[#E8ECF3]">
              ORDER {refNo}
            </h2>
            {isWholesaleOrder && (
              <span className="text-[10px] bg-[#2E5AAC] text-white px-2 py-0.5 font-bold uppercase rounded-none">
                WHOLESALE
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8DA0C4] hover:text-[#2E5AAC] text-xl font-bold cursor-pointer min-h-[44px] min-w-[44px]"
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

          {/* Section 2: Product & Stock Matrix Breakdown Details */}
          <div>
            <h3 className="font-mono font-bold text-[#8DA0C4] uppercase tracking-wider text-[11px] pb-1 border-b border-[#2E5AAC]/40 mb-3">
              PRODUCT &amp; STOCK BREAKDOWN
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">Garment Item:</span>
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

              {/* Stock Breakdown by Size */}
              <div className="p-3 bg-[#0B1E3D] border border-[#2E5AAC]/40 rounded-none space-y-1">
                <span className="text-[#8DA0C4] block font-bold text-[11px] uppercase">
                  Stock Breakdown by Size:
                </span>
                <div className="font-mono text-[#5DCAA5] font-bold text-sm tracking-wide">
                  {stockBreakdownStr}
                </div>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-[#8DA0C4]">Total Units Ordered:</span>
                <span className="font-mono font-bold text-[#E8ECF3]">{totalUnits}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">Delivery Estimate:</span>
                <span className="font-mono text-[#85B7EB]">{deliveryEstimateStr}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Bulk Discount Details */}
          <div>
            <h3 className="font-mono font-bold text-[#8DA0C4] uppercase tracking-wider text-[11px] pb-1 border-b border-[#2E5AAC]/40 mb-3">
              PRICING &amp; NEGOTIATED OFFERS
            </h3>
            <div className="space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-[#8DA0C4]">List Unit Price:</span>
                <span className="text-[#E8ECF3] tabular-nums">{listUnitPrice}</span>
              </div>

              {isWholesaleOrder && (
                <div className="flex justify-between text-[#5DCAA5]">
                  <span>Negotiated Offer Price:</span>
                  <span className="tabular-nums font-bold">✓ {offeredUnitPrice}</span>
                </div>
              )}

              {/* Bulk Discount Applied (%) */}
              {bulkDiscountText && (
                <div className="flex justify-between text-[#5DCAA5] bg-[#5DCAA5]/10 p-2 border border-[#5DCAA5]/30">
                  <span className="font-bold uppercase">Bulk Discount Applied:</span>
                  <span className="font-bold">{bulkDiscountText}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-sm text-[#E8ECF3] pt-2 border-t border-[#2E5AAC]/30">
                <span>Total Amount:</span>
                <span className="tabular-nums text-[#2E5AAC]">{totalFormatted}</span>
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
            <span>Download Proforma Invoice PDF</span>
          </a>
          <Link
            href="/portal/support"
            className="flex-1 h-12 bg-transparent hover:bg-[#1A3A5C] text-[#2E5AAC] border-2 border-[#2E5AAC] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>Contact Wholesale Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
