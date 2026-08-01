"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { StatusStepper } from "@/components/StatusStepper";
import type { OrderStatus } from "@/app/generated/prisma/enums";

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
  status: OrderStatus;
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
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatusFilter === "ALL" || order.status === selectedStatusFilter;
      const refNo = order.proforma?.refNo || order.id;
      const matchesQuery =
        !searchQuery.trim() ||
        refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.company.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [orders, selectedStatusFilter, searchQuery]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#101828] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans select-none rounded-none">
      <div className="max-w-[1440px] mx-auto space-y-6 rounded-none">
        {/* Top Header & Operational Actions */}
        <div className="bg-white border border-[#EAECF0] rounded-none p-5 sm:p-6 shadow-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#111318]">
                B2B Production Orders &amp; Proformas
              </h1>
              <span className="bg-[#E6F1FB] text-[#185FA5] text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 border border-[#B3D6F6] rounded-none">
                PARTNERSHIP LEDGER
              </span>
            </div>
            <p className="text-xs text-[#475467] mt-1">
              Active manufacturing orders and proforma invoices for corporate account{" "}
              <strong className="text-[#111318] font-mono">{customerEmail || "..."}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/konfigurator"
              className="bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 inline-flex items-center gap-1.5 transition-colors rounded-none shadow-none"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Configure New Spec</span>
            </Link>

            <button
              type="button"
              onClick={fetchCustomerOrders}
              className="bg-white hover:bg-[#F8FAFC] text-[#344054] border border-[#EAECF0] text-xs font-semibold px-3.5 py-2 inline-flex items-center gap-1.5 transition-colors cursor-pointer rounded-none shadow-none"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-[#EAECF0] rounded-none p-4 shadow-none flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "All Orders" },
              { id: "PENDING_REVIEW", label: "Pending Review" },
              { id: "PROFORMA_SENT", label: "Proforma Sent" },
              { id: "PAID", label: "Paid" },
              { id: "IN_PRODUCTION", label: "In Production" },
              { id: "SHIPPED", label: "Shipped" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap rounded-none cursor-pointer border ${
                  selectedStatusFilter === tab.id
                    ? "bg-[#2E5AAC] text-white border-[#2E5AAC]"
                    : "bg-[#F8FAFC] text-[#475467] border-[#EAECF0] hover:bg-[#F2F4F7]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#667085]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID or Company..."
              className="w-full bg-[#F8FAFC] border border-[#EAECF0] pl-9 pr-3 py-1.5 text-xs text-[#111318] placeholder-[#667085] focus:outline-none focus:border-[#2E5AAC] rounded-none"
            />
          </div>
        </div>

        {/* Orders State Content */}
        {loading ? (
          <div className="bg-white border border-[#EAECF0] rounded-none p-12 text-center text-xs text-[#475467] shadow-none space-y-2">
            <span className="inline-block w-5 h-5 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin" />
            <p>Loading client portal manufacturing orders...</p>
          </div>
        ) : error ? (
          <div className="bg-[#FEF3F2] border border-[#FECDCA] rounded-none p-6 text-center text-xs text-[#B42318] space-y-1">
            <p className="font-bold">Failed to load order history</p>
            <p>{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-[#EAECF0] rounded-none p-12 text-center space-y-4 shadow-none">
            <div className="w-12 h-12 bg-[#F9FAFB] text-[#667085] rounded-none flex items-center justify-center mx-auto border border-[#EAECF0]">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <h3 className="text-base font-bold text-[#111318]">No Orders Match Filter Criteria</h3>
            <p className="text-xs text-[#475467] max-w-md mx-auto leading-relaxed">
              No manufacturing orders found for account <strong>{customerEmail}</strong> matching your selected filter.
            </p>
            <Link
              href="/konfigurator"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold uppercase tracking-wider rounded-none shadow-none transition-colors"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Configure First Order</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 rounded-none">
            {filteredOrders.map((order) => {
              const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              const refNo = order.proforma?.refNo || `ORD-${order.id.slice(-8).toUpperCase()}`;
              const totalUnits = order.lines.reduce((acc, line) => acc + line.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#EAECF0] rounded-none p-5 sm:p-6 space-y-6 shadow-none"
                >
                  {/* Card Header & Primary PDF Download Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAECF0] pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-bold text-[#111318] tabular-nums">
                          #{refNo}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-[#475467] mt-1 font-mono tabular-nums">
                        Submitted on {dateStr} • Corporate Client:{" "}
                        <strong className="text-[#111318] font-sans">{order.company.name}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={`/api/proforma/pdf/${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 rounded-none transition-colors shadow-none"
                      >
                        <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        <span>Download Proforma PDF</span>
                      </a>
                    </div>
                  </div>

                  {/* 6-Stage Lifecycle Stepper */}
                  <div className="p-4 bg-[#F9FAFB] border border-[#EAECF0] rounded-none">
                    <StatusStepper status={order.status} />
                  </div>

                  {/* Engineering Feasibility Notice Banner */}
                  {order.status === "PENDING_REVIEW" && (
                    <div className="p-4 bg-[#FEF0C7] border border-[#FDE272] rounded-none text-xs text-[#DC6803] flex items-start gap-3">
                      <span className="material-symbols-outlined text-lg mt-0.5 text-[#DC6803]">
                        engineering
                      </span>
                      <div>
                        <strong className="block font-bold mb-0.5 uppercase tracking-wide text-[11px]">
                          Engineering Feasibility Review In Progress
                        </strong>
                        <span>
                          Our factory production engineers are verifying pattern grading, fabric rolls, and loom allocations. Official unit pricing and proforma invoice will be finalized shortly.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* High-Density Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                    {/* Configured Line Items Breakdown */}
                    <div className="space-y-2 lg:col-span-2">
                      <h4 className="font-bold text-[#344054] uppercase tracking-wider text-[11px] border-b border-[#EAECF0] pb-1.5">
                        Configured Line Items ({totalUnits} Total Units)
                      </h4>
                      <div className="space-y-2 mt-2">
                        {order.lines.map((line) => (
                          <div
                            key={line.id}
                            className="p-3.5 bg-[#F9FAFB] border border-[#EAECF0] rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <span className="font-bold text-[#111318] text-sm block">
                                {line.product?.name || "Garment Spec Line"}
                              </span>
                              <span className="text-xs text-[#475467]">
                                Fabric: <strong className="text-[#111318]">{line.fabric?.name || "Standard"}</strong> • Fit:{" "}
                                <strong className="text-[#111318]">{line.selectedFit || "Regular"}</strong>
                              </span>
                            </div>
                            <div className="font-mono font-semibold text-[#111318] text-xs bg-white px-3 py-1 border border-[#EAECF0] self-start sm:self-auto rounded-none tabular-nums">
                              {line.quantity} units ({line.size})
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Specification Summary Box */}
                    <div className="space-y-3 bg-[#F9FAFB] p-4.5 border border-[#EAECF0] h-fit rounded-none">
                      <h4 className="font-bold text-[#344054] uppercase tracking-wider text-[11px] border-b border-[#EAECF0] pb-1.5">
                        Financial Specification
                      </h4>
                      <div>
                        <span className="text-[#667085] block text-[11px]">Target Unit Budget:</span>
                        <span className="font-semibold text-[#111318] font-mono tabular-nums">
                          {order.customerTargetPriceCents
                            ? `$${(order.customerTargetPriceCents / 100).toFixed(2)} / unit`
                            : "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#667085] block text-[11px]">Confirmed Final Unit Price:</span>
                        <span className="font-bold text-[#2E5AAC] font-mono text-sm block tabular-nums">
                          {order.finalPriceCents
                            ? `$${(order.finalPriceCents / 100).toFixed(2)} / unit`
                            : "Pending Feasibility Review"}
                        </span>
                      </div>
                      {order.totalCents > 0 && (
                        <div className="pt-2 border-t border-[#EAECF0] mt-2">
                          <span className="text-[#667085] block text-[11px]">Grand Total (Inc. Setup Fee):</span>
                          <span className="font-mono text-base font-bold text-[#111318] tabular-nums">
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
