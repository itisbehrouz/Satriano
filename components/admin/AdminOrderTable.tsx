"use client";

import { useState } from "react";
import type { OrderStatus } from "@/app/generated/prisma/enums";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  totalCents: number;
  setupFeeCents: number;
  customerTargetPriceCents?: number | null;
  finalPriceCents?: number | null;
  createdAt: string;
  company: {
    name: string;
    email: string;
  };
  lines: Array<{
    size: string;
    quantity: number;
    selectedFit?: string | null;
    fabric: { name: string };
  }>;
  logoAssets: Array<{
    storageUrl: string;
    placement: string;
  }>;
  proforma?: { refNo: string; pdfUrl?: string } | null;
  payment?: { status: string } | null;
}

interface AdminOrderTableProps {
  orders: AdminOrder[];
  onStatusChange?: () => void;
}

const ALL_STATUSES: OrderStatus[] = [
  "DRAFT",
  "PENDING_REVIEW",
  "PROFORMA_SENT",
  "APPROVED",
  "PAID",
  "IN_PRODUCTION",
  "SHIPPED",
  "CANCELLED",
];

export function AdminOrderTable({ orders, onStatusChange }: AdminOrderTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeModalOrderId, setActiveModalOrderId] = useState<string | null>(null);
  const [inputFinalPricePerUnit, setInputFinalPricePerUnit] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleStatusUpdate(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok && onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleApproveAndSendProforma(order: AdminOrder) {
    const val = parseFloat(inputFinalPricePerUnit);
    if (isNaN(val) || val <= 0) {
      setActionError("Please enter a valid final unit price ($)");
      return;
    }

    const finalPriceCents = Math.round(val * 100);
    setUpdatingId(order.id);
    setActionError(null);

    try {
      const res = await fetch("/api/proforma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, finalPriceCents }),
      });
      if (res.ok) {
        setActiveModalOrderId(null);
        setInputFinalPricePerUnit("");
        if (onStatusChange) onStatusChange();
      } else {
        const json = await res.json();
        setActionError(json.error || "Failed to generate proforma");
      }
    } catch {
      setActionError("Network error while sending proforma.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center border border-[#D1D5DB] bg-white rounded-lg text-[#5B6B85]">
        No orders found for the selected status filter.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#D1D5DB] rounded-lg bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F5F7FA] text-xs uppercase font-semibold text-[#5B6B85]">
            <th className="p-4">Order Ref / Date</th>
            <th className="p-4">Corporate Client</th>
            <th className="p-4">Target Budget &amp; Spec</th>
            <th className="p-4">Status &amp; Final Price</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#1A2233]">
          {orders.map((order) => {
            const totalUnits = order.lines.reduce((acc, l) => acc + l.quantity, 0);
            const targetBudgetStr = order.customerTargetPriceCents
              ? `$${(order.customerTargetPriceCents / 100).toFixed(2)}/unit`
              : "Not Specified";
            const finalPriceStr = order.finalPriceCents
              ? `$${(order.finalPriceCents / 100).toFixed(2)}/unit`
              : "Pending Review";
            const formattedTotal = order.totalCents > 0
              ? `$${(order.totalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : "Pending Review";
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-US");

            return (
              <tr key={order.id} className="hover:bg-[#F5F7FA]/60 transition-colors">
                <td className="p-4 font-mono text-xs">
                  <div className="font-bold text-[#1A2233]">
                    #{order.id.slice(-8).toUpperCase()}
                  </div>
                  <div className="text-[#5B6B85] text-[11px] mt-0.5">{dateStr}</div>
                  {order.proforma?.refNo && (
                    <div className="text-[#2E5AAC] font-medium text-[11px] mt-1 font-sans">
                      {order.proforma.refNo}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-semibold text-[#1A2233]">{order.company.name}</div>
                  <div className="text-[#5B6B85] text-xs mt-0.5">{order.company.email}</div>
                </td>
                <td className="p-4">
                  <div className="text-xs font-semibold text-[#2E5AAC]">
                    Target: {targetBudgetStr}
                  </div>
                  <div className="text-[#5B6B85] text-xs tabular-nums mt-0.5">
                    {totalUnits} pcs ({order.lines[0]?.fabric?.name || "Standard Fabric"}
                    {order.lines[0]?.selectedFit ? ` • ${order.lines[0].selectedFit}` : ""})
                  </div>
                  {order.logoAssets && order.logoAssets.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {order.logoAssets.map((logo, idx) => (
                        <a
                          key={idx}
                          href={logo.storageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-[#E6F1FB] hover:bg-[#B3D6F6] text-[#185FA5] text-[11px] font-semibold px-2 py-1 rounded border border-[#B3D6F6] transition-colors"
                          title={`Open vector logo (${logo.placement})`}
                        >
                          <span className="material-symbols-outlined text-[13px]">attachment</span>
                          <span>Logo ({logo.placement})</span>
                          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                        </a>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="mb-1">
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="text-xs font-semibold text-[#1A2233]">
                    Total: {formattedTotal}
                  </div>
                  <div className="text-[11px] text-[#5B6B85]">
                    Unit: {finalPriceStr}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value as OrderStatus)
                        }
                        className="bg-[#F5F7FA] border border-[#D1D5DB] text-xs px-2.5 py-1.5 rounded focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            Set: {st}
                          </option>
                        ))}
                      </select>

                      {order.proforma?.pdfUrl && (
                        <a
                          href={order.proforma.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Download Proforma Invoice PDF"
                          title="Download Proforma Invoice PDF"
                          className="w-8 h-8 flex items-center justify-center text-[#2E5AAC] border border-[#2E5AAC]/40 hover:bg-[#E6F1FB] rounded transition-colors shadow-xs"
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        </a>
                      )}
                    </div>

                    {order.status === "PENDING_REVIEW" && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalOrderId(order.id);
                          setInputFinalPricePerUnit(
                            order.customerTargetPriceCents
                              ? (order.customerTargetPriceCents / 100).toFixed(2)
                              : "18.50"
                          );
                          setActionError(null);
                        }}
                        className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                      >
                        Set Price &amp; Send Proforma
                      </button>
                    )}

                    {activeModalOrderId === order.id && (
                      <div className="bg-[#E6F1FB] border border-[#B3D6F6] p-3 rounded text-left mt-2 w-full max-w-xs">
                        <label className="block text-[11px] font-semibold text-[#185FA5] mb-1">
                          Set Final Price / Unit ($ USD):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.25"
                            value={inputFinalPricePerUnit}
                            onChange={(e) => setInputFinalPricePerUnit(e.target.value)}
                            className="w-full text-xs px-2 py-1 border border-[#D1D5DB] rounded"
                            placeholder="18.50"
                          />
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleApproveAndSendProforma(order)}
                            className="bg-[#0F6E56] hover:bg-[#0B5240] text-white text-xs font-semibold px-2.5 py-1 rounded whitespace-nowrap"
                          >
                            Approve
                          </button>
                        </div>
                        {actionError && (
                          <div className="text-[11px] text-[#A32D2D] mt-1">{actionError}</div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
