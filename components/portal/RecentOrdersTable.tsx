"use client";

import React from "react";
import Link from "next/link";
import type { CustomerOrder } from "@/app/portal/orders/page";

export interface RecentOrdersTableProps {
  orders: CustomerOrder[];
  loading?: boolean;
}

export function RecentOrdersTable({ orders, loading = false }: RecentOrdersTableProps) {
  if (loading) {
    return (
      <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-8 text-center text-xs text-[#8DA0C4] shadow-none font-sans">
        <span className="inline-block w-5 h-5 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
        <p>Loading recent manufacturing orders...</p>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none shadow-none font-sans select-none overflow-hidden">
      {/* Section Header */}
      <div className="p-5 border-b border-[#2E5AAC] bg-[#0B1E3D] flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#E8ECF3] flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#2E5AAC] rounded-none" />
            Recent Orders (Last 5)
          </h3>
          <p className="text-xs text-[#8DA0C4] mt-0.5">
            Your 5 most recent custom orders and proforma status.
          </p>
        </div>
        <Link
          href="/portal/orders"
          className="text-xs font-semibold text-[#85B7EB] hover:text-white inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View All ({orders.length})</span>
          <span>→</span>
        </Link>
      </div>

      {/* Empty State */}
      {recentOrders.length === 0 ? (
        <div className="p-10 text-center space-y-3 bg-[#0B1E3D]">
          <div className="w-10 h-10 bg-[#132A52] text-[#8DA0C4] rounded-none flex items-center justify-center mx-auto border border-[#2E5AAC]">
            <span className="material-symbols-outlined text-xl">receipt_long</span>
          </div>
          <h4 className="text-sm font-bold text-[#E8ECF3]">No Recent Orders Found</h4>
          <p className="text-xs text-[#8DA0C4] max-w-sm mx-auto">
            You haven't submitted any custom manufacturing orders yet. Start by configuring your first spec.
          </p>
          <Link
            href="/konfigurator"
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors"
          >
            <span>➕ Configure First Order</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#132A52] border-b border-[#2E5AAC] text-[11px] font-mono font-semibold text-[#8DA0C4] uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Product / Line</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A8A]">
              {recentOrders.map((order, idx) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                const refNo = order.proforma?.refNo || `#${order.id.slice(-6).toUpperCase()}`;
                const productName =
                  order.lines[0]?.product?.name || `Custom Garment (${order.lines.length} items)`;

                const isPending = order.status === "PENDING_REVIEW";
                const isShipped = order.status === "SHIPPED";
                const isPaid = order.status === "PAID" || order.status === "IN_PRODUCTION";
                const isProformaSent = order.status === "PROFORMA_SENT" || order.status === "APPROVED";

                // Status Badge Color Selection
                let badgeStyle = "bg-[#132A52] text-[#85B7EB] border-[#2E5AAC]";
                let badgeLabel: string = order.status;

                if (isPending) {
                  badgeStyle = "bg-[#3A2E14] text-[#F0B94A] border-[#F0B94A]/40";
                  badgeLabel = "⏳ Pending Review";
                } else if (isShipped) {
                  badgeStyle = "bg-[#14301F] text-[#5DCAA5] border-[#5DCAA5]/40";
                  badgeLabel = "📦 Shipped";
                } else if (isPaid) {
                  badgeStyle = "bg-[#132A52] text-[#85B7EB] border-[#2E5AAC]";
                  badgeLabel = "✓ Paid";
                } else if (isProformaSent) {
                  badgeStyle = "bg-[#132A52] text-[#85B7EB] border-[#2E5AAC]";
                  badgeLabel = "📄 Proforma Sent";
                } else if (order.status === "CANCELLED") {
                  badgeStyle = "bg-[#1F2937] text-[#8DA0C4] border-[#8DA0C4]/40";
                  badgeLabel = "✕ Cancelled";
                }

                const totalFormatted =
                  order.totalCents > 0
                    ? `$${(order.totalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : order.customerTargetPriceCents
                    ? `$${(order.customerTargetPriceCents / 100).toFixed(2)} target`
                    : "Quote Pending";

                return (
                  <tr
                    key={order.id}
                    className={`${
                      idx % 2 === 0 ? "bg-[#0B1E3D]" : "bg-[#132A52]"
                    } hover:bg-[#1E3A6D]/40 transition-colors text-[#E8ECF3]`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#E8ECF3]">
                      {refNo}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#8DA0C4] text-[11px] tabular-nums">
                      {dateStr}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#E8ECF3]">
                      {productName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border rounded-none ${badgeStyle}`}
                      >
                        {badgeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#E8ECF3] tabular-nums">
                      {totalFormatted}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isPending ? (
                        <Link
                          href="/portal/orders"
                          className="text-[#F0B94A] hover:underline font-mono text-xs font-semibold"
                        >
                          Review →
                        </Link>
                      ) : (
                        <a
                          href={`/api/proforma/pdf/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#85B7EB] hover:underline font-mono text-xs font-semibold"
                        >
                          Download →
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
