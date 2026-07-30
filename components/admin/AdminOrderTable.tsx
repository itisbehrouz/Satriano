"use client";

import { useState } from "react";
import type { OrderStatus } from "@/app/generated/prisma/enums";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  totalCents: number;
  setupFeeCents: number;
  createdAt: string;
  company: {
    name: string;
    email: string;
  };
  lines: Array<{
    size: string;
    quantity: number;
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
  "PROFORMA_SENT",
  "APPROVED",
  "PAID",
  "IN_PRODUCTION",
];

export function AdminOrderTable({ orders, onStatusChange }: AdminOrderTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
            <th className="p-4">Units &amp; Total</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#1A2233]">
          {orders.map((order) => {
            const totalUnits = order.lines.reduce((acc, l) => acc + l.quantity, 0);
            const formattedTotal = `$${(order.totalCents / 100).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}`;
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
                  <div className="font-bold text-[#1A2233] tabular-nums">{formattedTotal}</div>
                  <div className="text-[#5B6B85] text-xs tabular-nums mt-0.5">
                    {totalUnits} pcs ({order.lines[0]?.fabric?.name || "Polo"})
                  </div>
                </td>
                <td className="p-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
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
                        className="text-[#2E5AAC] border border-[#2E5AAC]/40 hover:bg-[#E6F1FB] text-xs font-semibold px-2.5 py-1 rounded transition-colors"
                      >
                        PDF
                      </a>
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
