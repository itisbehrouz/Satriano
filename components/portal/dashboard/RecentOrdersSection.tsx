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
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-8 text-center text-xs text-[var(--color-text-secondary)] shadow-none font-sans transition-colors">
        <span className="inline-block w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-2" />
        <p>Loading recent manufacturing orders...</p>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="font-sans select-none">
      {/* Title & Subtext */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
          Recent Orders (Last 5)
        </h3>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
          Your 5 most recent manufacturing orders at a glance
        </p>
      </div>

      {/* Empty State */}
      {recentOrders.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-10 text-center space-y-3 transition-colors">
          <div className="text-5xl text-[var(--color-text-secondary)] mx-auto flex items-center justify-center">
            📦
          </div>
          <h4 className="text-base font-bold text-[var(--color-text-primary)]">No Orders Yet</h4>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Start by configuring your first order
          </p>
          <div className="pt-2">
            <Link
              href="/configure"
              className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-accent)] hover:bg-[#1E3F7F] text-white text-sm font-bold uppercase tracking-wider rounded-none transition-colors"
            >
              CREATE FIRST ORDER
            </Link>
          </div>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] rounded-none overflow-x-auto bg-[var(--color-bg)] transition-colors">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-wider h-12">
                <th className="p-3 px-4">Order ID</th>
                <th className="p-3 px-4">Date</th>
                <th className="p-3 px-4">Product</th>
                <th className="p-3 px-4">Status</th>
                <th className="p-3 px-4 text-right">Total</th>
                <th className="p-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {recentOrders.map((order) => {
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

                // Status Badge Styling based on generalized theme tokens
                let badgeBg = "bg-[var(--color-status-info-bg)]";
                let badgeTextColor = "text-[var(--color-status-info)]";
                let badgeLabel: string = order.status;

                if (isPendingReview) {
                  badgeBg = "bg-[var(--color-status-warning-bg)]";
                  badgeTextColor = "text-[var(--color-status-warning)]";
                  badgeLabel = "⏳ Pending Review";
                } else if (isProformaSent || order.status === "APPROVED" || order.status === "PAID" || order.status === "IN_PRODUCTION") {
                  badgeBg = "bg-[var(--color-status-info-bg)]";
                  badgeTextColor = "text-[var(--color-status-info)]";
                  badgeLabel = isProformaSent
                    ? "📄 Proforma Sent"
                    : order.status === "APPROVED"
                    ? "✓ Approved"
                    : order.status === "PAID"
                    ? "✓ Paid"
                    : "⚙️ In Production";
                } else if (isShipped) {
                  badgeBg = "bg-[var(--color-status-success-bg)]";
                  badgeTextColor = "text-[var(--color-status-success)]";
                  badgeLabel = "📦 Shipped";
                } else if (isCancelled) {
                  badgeBg = "bg-[var(--color-surface)]";
                  badgeTextColor = "text-[var(--color-text-secondary)]";
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
                    className="h-12 bg-[var(--color-bg)] hover:bg-[var(--color-surface)]/60 transition-colors text-[var(--color-text-primary)]"
                  >
                    <td className="p-3 px-4 font-mono font-bold">
                      <Link
                        href={`/portal/orders`}
                        className="text-[var(--color-accent)] hover:underline cursor-pointer"
                      >
                        {refNo}
                      </Link>
                    </td>
                    <td className="p-3 px-4 font-mono text-[var(--color-text-secondary)] text-xs tabular-nums">
                      {dateStr}
                    </td>
                    <td className="p-3 px-4 font-medium text-[var(--color-text-primary)]">
                      {productName}
                    </td>
                    <td className="p-3 px-4">
                      <span
                        className={`inline-block px-3 py-1.5 text-xs font-bold uppercase rounded-none ${badgeBg} ${badgeTextColor}`}
                      >
                        {badgeLabel}
                      </span>
                    </td>
                    <td className="p-3 px-4 text-right font-mono font-bold text-[var(--color-text-primary)] tabular-nums">
                      {totalFormatted}
                    </td>
                    <td className="p-3 px-4 text-right font-mono text-xs">
                      {isReviewAction ? (
                        <Link
                          href={`/portal/orders`}
                          className="text-[var(--color-accent)] hover:underline font-bold"
                        >
                          Review →
                        </Link>
                      ) : (
                        <a
                          href={`/api/proforma/pdf/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-accent)] hover:underline font-bold"
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
