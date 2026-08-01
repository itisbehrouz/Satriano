"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { StatusStepper } from "@/components/StatusStepper";

export interface CustomerOrderLine {
  id: string;
  quantity: number;
  size: string;
  selectedFit?: string | null;
  product?: { name: string; slug: string } | null;
  fabric?: { name: string; colorway?: string | null } | null;
}

export interface CustomerOrder {
  id: string;
  status:
    | "DRAFT"
    | "PENDING_REVIEW"
    | "PROFORMA_SENT"
    | "APPROVED"
    | "PAID"
    | "IN_PRODUCTION"
    | "SHIPPED"
    | "CANCELLED";
  setupFeeCents: number;
  totalCents: number;
  customerTargetPriceCents?: number | null;
  finalPriceCents?: number | null;
  createdAt: string;
  company: { name: string; email: string };
  lines: CustomerOrderLine[];
  proforma?: { refNo: string; pdfUrl?: string | null } | null;
}

export default function CustomerOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchCustomerOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/orders");
      if (res.status === 401) {
        window.location.href = "/portal?error=session_expired";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load portal order history.");
      }

      const data = await res.json();
      setOrders(data.orders || []);
      setCustomerEmail(data.email || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load order history.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#101828] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Top Header & Operational Actions */}
        <div className="bg-white border border-[#D0D5DD] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#101828]">
                B2B Production Orders &amp; Proformas
              </h1>
              <span className="bg-[#E6F1FB] text-[#185FA5] text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border border-[#B3D6F6]">
                Partnership Ledger
              </span>
            </div>
            <p className="text-xs text-[#475467] mt-1">
              Active manufacturing orders and proforma status for account{" "}
              <strong className="text-[#101828] font-mono">{customerEmail || "..."}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/konfigurator"
              className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Configure New Spec</span>
            </Link>

            <button
              type="button"
              onClick={fetchCustomerOrders}
              className="bg-white hover:bg-[#F2F4F7] text-[#344054] border border-[#D0D5DD] text-xs font-semibold px-3.5 py-2 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Orders State Content */}
        {loading ? (
          <div className="bg-white border border-[#D0D5DD] rounded-lg p-12 text-center text-xs text-[#475467] shadow-xs space-y-2">
            <span className="inline-block w-5 h-5 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin" />
            <p>Loading your client portal order history...</p>
          </div>
        ) : error ? (
          <div className="bg-[#FEF3F2] border border-[#FECDCA] rounded-lg p-6 text-center text-xs text-[#B42318] space-y-1">
            <p className="font-bold">Failed to load order history</p>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-[#D0D5DD] rounded-lg p-12 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-[#F9FAFB] text-[#667085] rounded-full flex items-center justify-center mx-auto border border-[#EAECF0]">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <h3 className="text-base font-bold text-[#101828]">No Production Orders Found</h3>
            <p className="text-xs text-[#475467] max-w-md mx-auto leading-relaxed">
              There are no active custom manufacturing orders associated with <strong>{customerEmail}</strong> yet.
            </p>
            <Link
              href="/konfigurator"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Configure Your First Order</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              const refNo = order.proforma?.refNo || `PRO-${order.id.slice(-8).toUpperCase()}`;
              const totalUnits = order.lines.reduce((acc, line) => acc + line.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#D0D5DD] rounded-lg p-5 sm:p-6 space-y-6 shadow-xs"
                >
                  {/* Card Header & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAECF0] pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-bold text-[#101828]">
                          #{refNo}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-[#475467] mt-1">
                        Submitted on {dateStr} • Account: <strong className="text-[#101828]">{order.company.name}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {["PROFORMA_SENT", "APPROVED", "PAID", "IN_PRODUCTION", "SHIPPED"].includes(
                        order.status
                      ) && (
                        <a
                          href={`/api/proforma/pdf/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold rounded-md inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                          <span>Download Proforma Invoice</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 6-Stage Lifecycle Stepper */}
                  <div className="p-4 bg-[#F9FAFB] border border-[#EAECF0] rounded-md">
                    <StatusStepper status={order.status} />
                  </div>

                  {/* Feasibility Notice Banner */}
                  {order.status === "PENDING_REVIEW" && (
                    <div className="p-4 bg-[#FEF0C7] border border-[#FDE272] rounded-md text-xs text-[#DC6803] flex items-start gap-3">
                      <span className="material-symbols-outlined text-lg mt-0.5 text-[#DC6803]">
                        engineering
                      </span>
                      <div>
                        <strong className="block font-bold mb-0.5">
                          Engineering Feasibility Review In Progress
                        </strong>
                        <span>
                          Our technical production engineers are evaluating fabric availability, CAD pattern grading, and factory floor schedules to confirm final unit pricing. Your official proforma invoice will be published here upon completion.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                    {/* Configured Line Items */}
                    <div className="space-y-2 lg:col-span-2">
                      <h4 className="font-bold text-[#344054] uppercase tracking-wider text-[11px] border-b border-[#EAECF0] pb-1.5">
                        Configured Garment Items ({totalUnits} Total Units)
                      </h4>
                      <div className="space-y-2 mt-2">
                        {order.lines.map((line) => (
                          <div
                            key={line.id}
                            className="p-3.5 bg-[#F9FAFB] border border-[#EAECF0] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <span className="font-bold text-[#101828] text-sm block">
                                {line.product?.name || "Garment Line Item"}
                              </span>
                              <span className="text-xs text-[#475467]">
                                Fabric: <strong className="text-[#101828]">{line.fabric?.name || "Standard"}</strong> • Fit:{" "}
                                <strong className="text-[#101828]">{line.selectedFit || "Regular"}</strong>
                              </span>
                            </div>
                            <div className="font-mono font-semibold text-[#101828] text-xs bg-white px-3 py-1 rounded border border-[#D0D5DD] self-start sm:self-auto shadow-2xs">
                              {line.quantity} units ({line.size})
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Specification Box */}
                    <div className="space-y-3 bg-[#F9FAFB] p-4.5 rounded-md border border-[#EAECF0] h-fit">
                      <h4 className="font-bold text-[#344054] uppercase tracking-wider text-[11px] border-b border-[#EAECF0] pb-1.5">
                        Financial Specification
                      </h4>
                      <div>
                        <span className="text-[#667085] block text-[11px]">Target Customer Price:</span>
                        <span className="font-semibold text-[#101828] font-mono">
                          {order.customerTargetPriceCents
                            ? `$${(order.customerTargetPriceCents / 100).toFixed(2)} / unit`
                            : "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#667085] block text-[11px]">Final Confirmed Unit Price:</span>
                        <span className="font-bold text-[#2E5AAC] font-mono text-sm block">
                          {order.finalPriceCents
                            ? `$${(order.finalPriceCents / 100).toFixed(2)} / unit`
                            : "Pending Feasibility Review"}
                        </span>
                      </div>
                      {order.totalCents > 0 && (
                        <div className="pt-2 border-t border-[#EAECF0] mt-2">
                          <span className="text-[#667085] block text-[11px]">Grand Total (Inc. Setup Fee):</span>
                          <span className="font-mono text-base font-bold text-[#101828]">
                            ${(order.totalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
