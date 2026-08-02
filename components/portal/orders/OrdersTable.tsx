"use client";

import React from "react";
import type { CustomerOrder } from "@/app/portal/orders/page";

export interface OrdersTableProps {
  orders: CustomerOrder[];
  isWholesaleView?: boolean;
  sortColumn: string;
  sortOrder: "asc" | "desc";
  onSortChange: (column: string) => void;
  onSelectOrder: (order: CustomerOrder) => void;
}

export function OrdersTable({
  orders,
  isWholesaleView = false,
  sortColumn,
  sortOrder,
  onSortChange,
  onSelectOrder,
}: OrdersTableProps) {
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <span className="text-[#8DA0C4] ml-1">↑↓</span>;
    return sortOrder === "asc" ? (
      <span className="text-[#2E5AAC] font-bold ml-1">↑</span>
    ) : (
      <span className="text-[#2E5AAC] font-bold ml-1">↓</span>
    );
  };

  return (
    <div className="border border-[#2E5AAC] rounded-none overflow-x-auto font-sans select-none">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-[#132A52] border-b border-[#2E5AAC] text-[#E8ECF3] font-bold text-xs uppercase tracking-wider h-14">
            <th
              className="py-3 px-4 cursor-pointer hover:text-[#2E5AAC]"
              onClick={() => onSortChange("id")}
            >
              <div className="flex items-center">
                <span>Order ID</span>
                {getSortIcon("id")}
              </div>
            </th>
            <th
              className="py-3 px-4 cursor-pointer hover:text-[#2E5AAC]"
              onClick={() => onSortChange("createdAt")}
            >
              <div className="flex items-center">
                <span>Date</span>
                {getSortIcon("createdAt")}
              </div>
            </th>
            
            {/* If Wholesale View: Show Units column */}
            {isWholesaleView ? (
              <th
                className="py-3 px-4 text-center cursor-pointer hover:text-[#2E5AAC]"
                onClick={() => onSortChange("quantity")}
              >
                <div className="flex items-center justify-center">
                  <span>Units</span>
                  {getSortIcon("quantity")}
                </div>
              </th>
            ) : (
              <th className="py-3 px-4">Product</th>
            )}

            {!isWholesaleView && (
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-[#2E5AAC]"
                onClick={() => onSortChange("quantity")}
              >
                <div className="flex items-center justify-end">
                  <span>Quantity</span>
                  {getSortIcon("quantity")}
                </div>
              </th>
            )}

            <th
              className="py-3 px-4 text-right cursor-pointer hover:text-[#2E5AAC]"
              onClick={() => onSortChange("totalCents")}
            >
              <div className="flex items-center justify-end">
                <span>Total</span>
                {getSortIcon("totalCents")}
              </div>
            </th>

            <th
              className="py-3 px-4 cursor-pointer hover:text-[#2E5AAC]"
              onClick={() => onSortChange("status")}
            >
              <div className="flex items-center">
                <span>Status</span>
                {getSortIcon("status")}
              </div>
            </th>

            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2E5AAC]">
          {orders.map((order, idx) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            const refNo = order.proforma?.refNo || (order.id.startsWith("#") ? order.id : `#${order.id.slice(-6).toUpperCase()}`);

            const firstLine = order.lines[0];
            const extraCount = order.lines.length - 1;
            const productName = firstLine?.product?.name || "Custom Garment";
            const productDisplay =
              extraCount > 0 ? `${productName} (+${extraCount})` : productName;

            const totalUnits = order.totalUnits || order.lines.reduce((acc, line) => acc + line.quantity, 0);

            const isPending = order.status === "PENDING_REVIEW" || order.status === "Pending";
            const isApproved = order.status === "APPROVED" || order.status === "Approved";
            const isPaid = order.status === "PAID" || order.status === "Paid";
            const isShipped = order.status === "SHIPPED" || order.status === "Shipped";
            const isCancelled = order.status === "CANCELLED" || order.status === "Cancelled";

            // Status Badge Styling based on prompt specifications
            let badgeBg = "bg-[#132A52]";
            let badgeTextColor = "text-[#85B7EB]";
            let badgeLabel: string = String(order.status);

            if (isPending) {
              badgeBg = "bg-[#3A2E14]";
              badgeTextColor = "text-[#F0B94A]";
              badgeLabel = "⏳ Pending";
            } else if (isApproved) {
              badgeBg = "bg-[#132A52]";
              badgeTextColor = "text-[#85B7EB]";
              badgeLabel = "✓ Approved";
            } else if (isPaid) {
              badgeBg = "bg-[#132A52]";
              badgeTextColor = "text-[#85B7EB]";
              badgeLabel = "✓ Paid";
            } else if (isShipped) {
              badgeBg = "bg-[#14301F]";
              badgeTextColor = "text-[#5DCAA5]";
              badgeLabel = "📦 Shipped";
            } else if (isCancelled) {
              badgeBg = "bg-[#1A2332]";
              badgeTextColor = "text-[#8DA0C4]";
              badgeLabel = "✗ Cancelled";
            }

            const totalFormatted =
              order.totalCents > 0
                ? `$${(order.totalCents / 100).toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}`
                : order.customerTargetPriceCents
                ? `$${(order.customerTargetPriceCents / 100).toFixed(0)}`
                : "$0.00";

            return (
              <tr
                key={order.id}
                className={`h-14 ${
                  idx % 2 === 0 ? "bg-[#0B1E3D]" : "bg-[#1A3A5C]"
                } hover:bg-[#2A4A6C] transition-colors text-[#E8ECF3]`}
              >
                <td className="py-3 px-4 font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => onSelectOrder(order)}
                    className="text-[#2E5AAC] hover:underline cursor-pointer font-bold text-left"
                  >
                    {refNo}
                  </button>
                </td>
                <td className="py-3 px-4 font-mono text-[#8DA0C4] text-xs tabular-nums">
                  {dateStr}
                </td>

                {isWholesaleView ? (
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#E8ECF3] tabular-nums">
                    {totalUnits}
                  </td>
                ) : (
                  <td className="py-3 px-4 font-medium text-[#E8ECF3]">
                    {productDisplay}
                  </td>
                )}

                {!isWholesaleView && (
                  <td className="py-3 px-4 text-right font-mono text-[#E8ECF3] tabular-nums font-semibold">
                    {totalUnits}
                  </td>
                )}

                <td className="py-3 px-4 text-right font-mono font-bold text-[#E8ECF3] tabular-nums">
                  {totalFormatted}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1.5 text-xs font-bold uppercase rounded-none ${badgeBg} ${badgeTextColor}`}
                  >
                    {badgeLabel}
                  </span>
                </td>
                
                <td className="py-3 px-4 text-right font-mono text-xs space-x-2">
                  <button
                    type="button"
                    onClick={() => onSelectOrder(order)}
                    className="text-[#2E5AAC] hover:underline font-bold cursor-pointer"
                  >
                    View Details →
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
