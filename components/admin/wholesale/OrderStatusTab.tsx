"use client";

import { useState } from "react";
import { OrderDetailModal, WholesaleOrderFull } from "./OrderDetailModal";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

export interface OrderStatusTabProps {
  orders: WholesaleOrderFull[];
  onUpdateStatus: (orderId: string, newStatus: WholesaleOrderFull["status"]) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function OrderStatusTab({
  orders,
  onUpdateStatus,
  showToast,
}: OrderStatusTabProps) {
  const { t } = useAdminLanguage();
  const [selectedOrder, setSelectedOrder] = useState<WholesaleOrderFull | null>(null);

  const handleStatusSelect = (orderId: string, newStatus: WholesaleOrderFull["status"]) => {
    onUpdateStatus(orderId, newStatus);
    const readableStatus =
      newStatus === "PENDING_REVIEW"
        ? "Pending Review"
        : newStatus === "APPROVED"
        ? "Approved"
        : newStatus === "IN_FULFILLMENT"
        ? "In Fulfillment"
        : newStatus === "SHIPPED"
        ? "Shipped"
        : "On Hold";

    showToast(`Order ${orderId} status updated to ${readableStatus}`, "success");
  };

  return (
    <section className="bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none p-6 space-y-6 select-none font-sans transition-colors">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            {t.wholesaleTitle}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {t.wholesaleSubtitle}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[var(--color-text-primary)] font-bold uppercase tracking-wider h-11">
              <th className="py-3 px-4">{t.orderId}</th>
              <th className="py-3 px-4">{t.clientCompany}</th>
              <th className="py-3 px-4 text-center">{t.units}</th>
              <th className="py-3 px-4 text-right">{t.totalOrderPrice}</th>
              <th className="py-3 px-4">{t.status}</th>
              <th className="py-3 px-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {orders.map((order) => {
              return (
                <tr
                  key={order.id}
                  className="h-14 transition-colors bg-[var(--color-surface)] hover:bg-[var(--color-bg)]/50"
                >
                  {/* Order ID Link */}
                  <td className="py-3 px-4 font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="text-[var(--color-accent)] hover:underline cursor-pointer text-left"
                    >
                      {order.orderId}
                    </button>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4 font-bold text-[var(--color-text-primary)]">
                    {order.customerName}
                  </td>

                  {/* Total Units */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-[var(--color-text-primary)]">
                    {order.totalUnits}
                  </td>

                  {/* Total $ */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-[var(--color-text-primary)] tabular-nums">
                    ${order.totalPriceUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 font-bold text-xs uppercase font-mono">
                    {order.status === "PENDING_REVIEW" && (
                      <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-none border border-amber-500/30 inline-flex items-center gap-1">
                        ⏳ PENDING REVIEW
                      </span>
                    )}
                    {order.status === "APPROVED" && (
                      <span className="bg-sky-500/10 text-sky-500 px-2.5 py-1 rounded-none border border-sky-500/30 inline-flex items-center gap-1">
                        ✓ APPROVED
                      </span>
                    )}
                    {order.status === "IN_FULFILLMENT" && (
                      <span className="bg-sky-500/10 text-sky-500 px-2.5 py-1 rounded-none border border-sky-500/30 inline-flex items-center gap-1">
                        📦 IN FULFILLMENT
                      </span>
                    )}
                    {order.status === "SHIPPED" && (
                      <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-none border border-emerald-500/30 inline-flex items-center gap-1">
                        ✅ SHIPPED
                      </span>
                    )}
                    {order.status === "ON_HOLD" && (
                      <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-none border border-amber-500/30 inline-flex items-center gap-1">
                        ⚠️ ON HOLD
                      </span>
                    )}
                  </td>

                  {/* Fulfillment Action Dropdown */}
                  <td className="py-3 px-4 text-right">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusSelect(order.id, e.target.value as WholesaleOrderFull["status"])
                      }
                      className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none px-3 py-1.5 text-xs text-[var(--color-text-primary)] font-semibold focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
                    >
                      <option value="PENDING_REVIEW">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="IN_FULFILLMENT">In Fulfillment</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="ON_HOLD">On Hold</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </section>
  );
}
