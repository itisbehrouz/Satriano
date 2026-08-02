"use client";

import React from "react";
import Link from "next/link";
import type { CustomerOrder } from "@/app/portal/orders/page";

export interface RecentOrdersSectionProps {
  orders: CustomerOrder[];
  loading?: boolean;
}

export function RecentOrdersSection({ orders, loading = false }: RecentOrdersSectionProps) {
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
    <div className="font-sans select-none">
      {/* Title & Subtext */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#E8ECF3]">
          Recent Orders (Last 5)
        </h3>
        <p className="text-[13px] text-[#8DA0C4] mt-0.5">
          Your 5 most recent manufacturing orders at a glance
        </p>
      </div>

      {/* Empty State */}
      {recentOrders.length === 0 ? (
        <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-10 text-center space-y-3">
          <div className="text-5xl text-[#8DA0C4] mx-auto flex items-center justify-center">
            📦
          </div>
          <h4 className="text-base font-bold text-[#E8ECF3]">No Orders Yet</h4>
          <p className="text-sm text-[#8DA0C4]">
            Start by configuring your first order
          </p>
          <div className="pt-2">
            <Link
              href="/configure"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#2E5AAC] hover:bg-[#1E3F7F] text-white text-sm font-bold uppercase tracking-wider rounded-none transition-colors"
            >
              CREATE FIRST ORDER
            </Link>
          </div>
        </div>
      ) : (
        <div className="border border-[#2E5AAC] rounded-none overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#132A52] border-b border-[#2E5AAC] text-[#E8ECF3] font-bold text-xs uppercase tracking-wider">
                <th className="p-3 px-4">Order ID</th>
                <th className="p-3 px-4">Date</th>
                <th className="p-3 px-4">Product</th>
                <th className="p-3 px-4">Status</th>
                <th className="p-3 px-4 text-right">Total</th>
                <th className="p-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E5AAC]">
              {recentOrders.map((order, idx) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                const refNo = order.proforma?.refNo || `#${order.id.slice(-6).toUpperCase()}`;
                const productName =
                  order.lines[0]?.product?.name ||
                  (order.lines.length > 0 ? "Custom Garment" : "Custom Production Order");

                const isPendingReview = order.status === "PENDING_REVIEW";
                const isProformaSent = order.status === "PROFORMA_SENT";
                const isShipped = order.status === "SHIPPED";
                const isCancelled = order.status === "CANCELLED";

                // Status Badge Styling based on prompt specifications
                let badgeBg = "bg-[#132A52]";
                let badgeTextColor = "text-[#85B7EB]";
                let badgeLabel: string = order.status;

                if (isPendingReview) {
                  badgeBg = "bg-[#3A2E14]";
                  badgeTextColor = "text-[#F0B94A]";
                  badgeLabel = "⏳ Pending Review";
                } else if (isProformaSent) {
                  badgeBg = "bg-[#132A52]";
                  badgeTextColor = "text-[#85B7EB]";
                  badgeLabel = "📄 Proforma Sent";
                } else if (order.status === "APPROVED") {
                  badgeBg = "bg-[#132A52]";
                  badgeTextColor = "text-[#85B7EB]";
                  badgeLabel = "✓ Approved";
                } else if (order.status === "PAID") {
                  badgeBg = "bg-[#132A52]";
                  badgeTextColor = "text-[#85B7EB]";
                  badgeLabel = "✓ Paid";
                } else if (order.status === "IN_PRODUCTION") {
                  badgeBg = "bg-[#132A52]";
                  badgeTextColor = "text-[#85B7EB]";
                  badgeLabel = "⚙️ In Production";
                } else if (isShipped) {
                  badgeBg = "bg-[#14301F]";
                  badgeTextColor = "text-[#5DCAA5]";
                  badgeLabel = "📦 Shipped";
                } else if (isCancelled) {
                  badgeBg = "bg-[#1A2332]";
                  badgeTextColor = "text-[#8DA0C4]";
                  badgeLabel = "✕ Cancelled";
                }

                const totalFormatted =
                  order.totalCents > 0
                    ? `$${(order.totalCents / 100).toFixed(2)}`
                    : order.customerTargetPriceCents
                    ? `$${(order.customerTargetPriceCents / 100).toFixed(2)}`
                    : "$0.00";

                const isReviewAction = isPendingReview || isProformaSent;

                return (
                  <tr
                    key={order.id}
                    className={`${
                      idx % 2 === 0 ? "bg-[#0B1E3D]" : "bg-[#1A3A5C]"
                    } hover:bg-[#1E3A6D]/60 transition-colors text-[#E8ECF3]`}
                  >
                    <td className="p-3 px-4 font-mono font-bold">
                      <Link
                        href={`/portal/orders`}
                        className="text-[#2E5AAC] hover:underline cursor-pointer"
                      >
                        {refNo}
                      </Link>
                    </td>
                    <td className="p-3 px-4 font-mono text-[#8DA0C4] text-xs tabular-nums">
                      {dateStr}
                    </td>
                    <td className="p-3 px-4 font-medium text-[#E8ECF3]">
                      {productName}
                    </td>
                    <td className="p-3 px-4">
                      <span
                        className={`inline-block px-3 py-1.5 text-xs font-bold uppercase rounded-none ${badgeBg} ${badgeTextColor}`}
                      >
                        {badgeLabel}
                      </span>
                    </td>
                    <td className="p-3 px-4 text-right font-mono font-bold text-[#E8ECF3] tabular-nums">
                      {totalFormatted}
                    </td>
                    <td className="p-3 px-4 text-right font-mono text-xs">
                      {isReviewAction ? (
                        <Link
                          href={`/portal/orders`}
                          className="text-[#2E5AAC] hover:underline font-bold"
                        >
                          Review →
                        </Link>
                      ) : (
                        <a
                          href={`/api/proforma/pdf/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2E5AAC] hover:underline font-bold"
                        >
                          Download ↓
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
