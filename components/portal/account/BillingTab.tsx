"use client";

import React, { useState } from "react";
import { formatCents } from "@/lib/formatCurrency";

export interface InvoiceItem {
  id: string;
  invoiceNo: string;
  orderId: string;
  date: string;
  amountCents: number;
  status: "PAID" | "PENDING" | "PROFORMA";
}

export function BillingTab() {
  const [address, setAddress] = useState(
    "100 Atelier Boulevard, Suite 400\nNew York, NY 10001\nUnited States"
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  // Mock / Initial Invoices
  const invoices: InvoiceItem[] = [
    {
      id: "inv-101",
      invoiceNo: "INV-2026-001",
      orderId: "ord-901",
      date: "2026-08-01",
      amountCents: 450000,
      status: "PAID",
    },
    {
      id: "inv-102",
      invoiceNo: "INV-2026-002",
      orderId: "ord-902",
      date: "2026-07-28",
      amountCents: 1280000,
      status: "PAID",
    },
    {
      id: "inv-103",
      invoiceNo: "PRO-2026-003",
      orderId: "ord-903",
      date: "2026-07-15",
      amountCents: 640000,
      status: "PROFORMA",
    },
  ];

  function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddress(tempAddress);
    setIsEditingAddress(false);
  }

  return (
    <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-6 md:p-8 text-[#E8ECF3] shadow-none space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2E5AAC]/40 pb-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#2E5AAC] rounded-none" />
            Billing &amp; Tax Documents
          </h2>
          <p className="text-xs text-[#8DA0C4] mt-1">
            Corporate Invoicing Details &amp; Tax Compliance Statements
          </p>
        </div>
      </div>

      {/* 1. Billing Address Box */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#85B7EB] flex items-center gap-2">
          <span className="material-symbols-outlined text-base">location_city</span>
          <span>Corporate Billing Address</span>
        </h3>

        {!isEditingAddress ? (
          <div className="p-4 bg-[#0B1E3D] border border-[#1E3A8A] rounded-none text-xs font-mono flex items-start justify-between gap-4">
            <pre className="font-mono text-white leading-relaxed whitespace-pre-wrap">
              {address}
            </pre>
            <button
              type="button"
              onClick={() => {
                setTempAddress(address);
                setIsEditingAddress(true);
              }}
              className="px-3.5 py-1.5 bg-[#132A52] hover:bg-[#1E3A6D] text-[#85B7EB] border border-[#2E5AAC] text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer shrink-0"
            >
              Edit Billing Address
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveAddress} className="space-y-3 bg-[#0B1E3D] border border-[#2E5AAC] p-4 rounded-none">
            <textarea
              rows={3}
              required
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              className="w-full bg-[#132A52] border border-[#2E5AAC] text-white p-3 text-xs font-mono rounded-none focus:outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditingAddress(false)}
                className="px-3 py-1.5 bg-[#0B1E3D] border border-[#8DA0C4] text-[#8DA0C4] hover:text-white text-xs font-bold uppercase rounded-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-bold uppercase rounded-none"
              >
                Save Address
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Recent Invoices Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#85B7EB] flex items-center gap-2">
            <span className="material-symbols-outlined text-base">receipt_long</span>
            <span>Recent Invoices &amp; Tax Documents</span>
          </h3>

          <button
            type="button"
            onClick={() => alert("Downloading bulk archive of all corporate invoices...")}
            className="px-3.5 py-1.5 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download_for_offline</span>
            <span>Download All Invoices</span>
          </button>
        </div>

        <div className="border border-[#1E3A8A] overflow-hidden rounded-none">
          <table className="w-full text-left text-xs font-mono select-none">
            <thead className="bg-[#0B1E3D] text-[#8DA0C4] uppercase text-[10px] tracking-wider border-b border-[#1E3A8A]">
              <tr>
                <th className="p-3">Invoice No</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3 text-right">Amount ($)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A8A]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#152D57] transition-colors">
                  <td className="p-3 font-bold text-white">{inv.invoiceNo}</td>
                  <td className="p-3 text-[#8DA0C4]">{inv.date}</td>
                  <td className="p-3 text-right text-white font-bold tabular-nums">
                    {formatCents(inv.amountCents)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-none border ${
                        inv.status === "PAID"
                          ? "bg-[#14301F] text-[#5DCAA5] border-[#5DCAA5]/40"
                          : "bg-[#3A2E14] text-[#F0B94A] border-[#F0B94A]/40"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        alert(`Downloading PDF for invoice ${inv.invoiceNo}...`)
                      }
                      className="px-2.5 py-1 bg-[#0B1E3D] hover:bg-[#1E3A6D] text-[#85B7EB] border border-[#2E5AAC] text-[11px] font-semibold uppercase rounded-none transition-colors cursor-pointer"
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
