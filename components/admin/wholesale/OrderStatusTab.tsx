"use client";

import { useState } from "react";
import { OrderDetailModal, WholesaleOrderFull } from "./OrderDetailModal";

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
    <section className="bg-white border border-[#EAECF0] rounded-md p-6 space-y-6 select-none font-sans">
      <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
            WHOLESALE ORDER STATUS
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Track ready-made stock orders and update fulfillment stages
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F7F8FA] border-b border-[#EAECF0] text-[#111318] font-bold uppercase tracking-wider h-11">
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4 text-center">Units</th>
              <th className="py-3 px-4 text-right">Total $</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0]">
            {orders.map((order, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <tr
                  key={order.id}
                  className={`h-14 transition-colors ${
                    isEven ? "bg-white" : "bg-[#F9FAFB]"
                  } hover:bg-[#F2F4F7]`}
                >
                  {/* Order ID Link */}
                  <td className="py-3 px-4 font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#2E5AAC] hover:underline cursor-pointer text-left"
                    >
                      {order.orderId}
                    </button>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4 font-bold text-[#111318]">
                    {order.customerName}
                  </td>

                  {/* Total Units */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#111318]">
                    {order.totalUnits}
                  </td>

                  {/* Total $ */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#111318] tabular-nums">
                    ${order.totalPriceUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 font-bold text-xs uppercase font-mono">
                    {order.status === "PENDING_REVIEW" && (
                      <span className="bg-[#FDF6E7] text-[#854F0B] px-2.5 py-1 rounded-none border border-[#F0B94A]/40 inline-flex items-center gap-1">
                        ⏳ PENDING REVIEW
                      </span>
                    )}
                    {order.status === "APPROVED" && (
                      <span className="bg-[#E6F1FB] text-[#185FA5] px-2.5 py-1 rounded-none border border-[#2E5AAC]/40 inline-flex items-center gap-1">
                        ✓ APPROVED
                      </span>
                    )}
                    {order.status === "IN_FULFILLMENT" && (
                      <span className="bg-[#E6F1FB] text-[#185FA5] px-2.5 py-1 rounded-none border border-[#2E5AAC]/40 inline-flex items-center gap-1">
                        📦 IN FULFILLMENT
                      </span>
                    )}
                    {order.status === "SHIPPED" && (
                      <span className="bg-[#ECFDF3] text-[#067647] px-2.5 py-1 rounded-none border border-[#5DCAA5]/40 inline-flex items-center gap-1">
                        ✅ SHIPPED
                      </span>
                    )}
                    {order.status === "ON_HOLD" && (
                      <span className="bg-[#FDF6E7] text-[#854F0B] px-2.5 py-1 rounded-none border border-[#F0B94A]/40 inline-flex items-center gap-1">
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
                      className="bg-white border border-[#D0D5DD] rounded-md px-3 py-1.5 text-xs text-[#111318] font-semibold focus:outline-none focus:border-[#2E5AAC] cursor-pointer"
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
