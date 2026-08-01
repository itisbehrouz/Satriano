"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";

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
  status: "DRAFT" | "PENDING_REVIEW" | "PROFORMA_SENT" | "APPROVED" | "PAID" | "IN_PRODUCTION" | "SHIPPED" | "CANCELLED";
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
    } catch (err: any) {
      setError(err.message || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/portal/logout", { method: "POST" });
    } catch {
      // Logout fetch failed
    }
    window.location.href = "/portal";
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1A2233] py-10 px-4 md:px-8 font-sans">
        <div className="w-full max-w-container-max mx-auto space-y-6">
          {/* Top Bar Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D1D5DB]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-semibold text-[#1A2233]">
                  Client Portal Orders
                </h1>
                <span className="bg-[#E6F1FB] text-[#185FA5] text-[10px] uppercase font-semibold px-2.5 py-1 rounded border border-[#B3D6F6]">
                  Active Partnership Ledger
                </span>
              </div>
              <p className="text-xs text-[#5B6B85] mt-1">
                Viewing production orders and proforma status for corporate account{" "}
                <strong className="text-[#1A2233]">{customerEmail || "..."}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/konfigurator"
                className="min-h-[44px] px-4 py-2 bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Configure New Order</span>
              </Link>
              <button
                type="button"
                onClick={fetchCustomerOrders}
                className="min-h-[44px] px-4 py-2 bg-white border border-[#D1D5DB] hover:bg-[#F5F7FA] text-xs font-semibold text-[#1A2233] rounded flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="min-h-[44px] px-4 py-2 bg-white border border-[#D1D5DB] hover:bg-[#FCE8E6] hover:text-[#C5221F] text-xs font-semibold text-[#5B6B85] rounded flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="bg-white border border-[#D1D5DB] rounded-lg p-12 text-center text-sm text-[#5B6B85] shadow-sm">
              <span className="inline-block w-5 h-5 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading your client portal order history...</p>
            </div>
          ) : error ? (
            <div className="bg-white border border-[#F8B4B4] rounded-lg p-6 text-center text-sm text-[#C5221F]">
              <p className="font-semibold mb-1">Order History Error</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-[#D1D5DB] rounded-lg p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-[#F5F7FA] text-[#5B6B85] rounded-full flex items-center justify-center mx-auto border border-[#E5E7EB]">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <h3 className="text-base font-semibold text-[#1A2233]">No Custom Production Orders Found</h3>
              <p className="text-xs text-[#5B6B85] max-w-md mx-auto leading-relaxed">
                There are no custom manufacturing orders associated with <strong>{customerEmail}</strong> yet.
              </p>
              <Link
                href="/konfigurator"
                className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider rounded shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-base">tune</span>
                <span>Configure Your First Order</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
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
                    className="bg-white border border-[#D1D5DB] rounded-lg p-6 space-y-4 shadow-sm"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-[#1A2233]">
                            #{refNo}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="text-xs text-[#5B6B85] mt-1">
                          Submitted on {dateStr} • {order.company.name}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Proforma PDF Link for PROFORMA_SENT or later */}
                        {["PROFORMA_SENT", "APPROVED", "PAID", "IN_PRODUCTION", "SHIPPED"].includes(
                          order.status
                        ) && (
                          <a
                            href={`/api/proforma/pdf/${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] px-4 py-2 bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 shadow-sm transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                            <span>Download Proforma Invoice</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Pending Review Feasibility Notice */}
                    {order.status === "PENDING_REVIEW" && (
                      <div className="p-4 bg-[#FAEEDA] border border-[#F5D8A0] rounded text-xs text-[#854F0B] flex items-start gap-3">
                        <span className="material-symbols-outlined text-lg mt-0.5 text-[#854F0B]">
                          engineering
                        </span>
                        <div>
                          <strong className="block font-semibold mb-0.5">
                            Feasibility Review In Progress
                          </strong>
                          <span>
                            Our manufacturing engineers are evaluating fabric availability, CAD pattern grading, and factory floor schedules to confirm final unit pricing for your order. Your official proforma invoice will be published here upon completion.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      {/* Product & Lines */}
                      <div className="space-y-1 md:col-span-2">
                        <h4 className="font-bold text-[#5B6B85] uppercase tracking-wider text-[11px]">
                          Configured Items ({totalUnits} Total Units)
                        </h4>
                        <div className="space-y-2 mt-2">
                          {order.lines.map((line) => (
                            <div
                              key={line.id}
                              className="p-3 bg-[#F5F7FA] border border-[#E5E7EB] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-semibold text-[#1A2233] text-sm block">
                                  {line.product?.name || "Garment Line Item"}
                                </span>
                                <span className="text-xs text-[#5B6B85]">
                                  Fabric: {line.fabric?.name || "Standard"} • Fit:{" "}
                                  {line.selectedFit || "Regular"}
                                </span>
                              </div>
                              <div className="font-semibold text-[#1A2233] text-xs bg-white px-2.5 py-1 rounded border border-[#D1D5DB] self-start sm:self-auto">
                                Quantity: {line.quantity} units ({line.size})
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="space-y-2 bg-[#F5F7FA] p-4 rounded border border-[#E5E7EB] h-fit">
                        <h4 className="font-bold text-[#5B6B85] uppercase tracking-wider text-[11px] border-b border-[#E5E7EB] pb-1.5">
                          Financial Specification
                        </h4>
                        <div>
                          <span className="text-[#5B6B85] block text-[11px]">Target Customer Price:</span>
                          <span className="font-semibold text-[#1A2233]">
                            {order.customerTargetPriceCents
                              ? `$${(order.customerTargetPriceCents / 100).toFixed(2)} / unit`
                              : "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#5B6B85] block text-[11px]">Final Confirmed Unit Price:</span>
                          <span className="font-bold text-[#2E5AAC]">
                            {order.finalPriceCents
                              ? `$${(order.finalPriceCents / 100).toFixed(2)} / unit`
                              : "Pending Feasibility Review"}
                          </span>
                        </div>
                        {order.totalCents > 0 && (
                          <div className="pt-2 border-t border-[#E5E7EB] mt-2">
                            <span className="text-[#5B6B85] block text-[11px]">Grand Total (Inc. Setup Fee):</span>
                            <span className="font-mono text-base font-bold text-[#1A2233]">
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
