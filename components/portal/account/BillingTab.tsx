"use client";

import React, { useState } from "react";
import { formatCents } from "@/lib/formatCurrency";
import { InvoicePreviewModal, type InvoiceItem } from "./InvoicePreviewModal";

export function BillingTab() {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState(
    "Satriano Garment Trading LLC\nTax Registration (TRN): 100485930200003\nBuilding 4, Design District (d3)\nDubai, United Arab Emirates"
  );
  const [tempAddress, setTempAddress] = useState(address);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceItem | null>(null);

  // Mock invoice entries
  const invoices = [
    {
      id: "inv-1",
      invoiceNo: "INV-2026-001",
      orderId: "ord-901",
      date: "2026-08-01",
      amountCents: 1250000,
      status: "PAID",
    },
    {
      id: "inv-2",
      invoiceNo: "INV-2026-002",
      orderId: "ord-902",
      date: "2026-07-28",
      amountCents: 480000,
      status: "PAID",
    },
    {
      id: "inv-3",
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
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 md:p-8 text-[var(--color-text-primary)] shadow-none space-y-8 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-none" />
            Billing &amp; Tax Documents
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Corporate Invoicing Details &amp; Tax Compliance Statements
          </p>
        </div>
      </div>

      {/* 1. Billing Address Box */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-accent)] flex items-center gap-2">
          <span className="material-symbols-outlined text-base">location_city</span>
          <span>Corporate Billing Address</span>
        </h3>

        {!isEditingAddress ? (
          <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none text-xs font-mono flex items-start justify-between gap-4">
            <pre className="font-mono text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
              {address}
            </pre>
            <button
              type="button"
              onClick={() => {
                setTempAddress(address);
                setIsEditingAddress(true);
              }}
              className="px-3.5 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-bg)] text-[var(--color-accent)] border border-[var(--color-border)] text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer shrink-0"
            >
              Edit Address
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveAddress} className="space-y-3 bg-[var(--color-bg)] border border-[var(--color-border)] p-4 rounded-none">
            <textarea
              rows={3}
              required
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] p-3 text-xs font-mono rounded-none focus:outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditingAddress(false)}
                className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-bold uppercase rounded-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[var(--color-accent)] hover:bg-[#1E3F7A] text-white text-xs font-bold uppercase rounded-none"
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
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-accent)] flex items-center gap-2">
            <span className="material-symbols-outlined text-base">receipt_long</span>
            <span>Recent Invoices &amp; Tax Documents</span>
          </h3>

          <button
            type="button"
            onClick={() => alert("Downloading bulk archive of all corporate invoices...")}
            className="px-3.5 py-1.5 bg-[var(--color-accent)] hover:bg-[#1E3F7A] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download_for_offline</span>
            <span>Download All Invoices</span>
          </button>
        </div>

        <div className="border border-[var(--color-border)] overflow-hidden rounded-none">
          <table className="w-full text-left text-xs font-mono select-none">
            <thead className="bg-[var(--color-bg)] text-[var(--color-text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--color-border)]">
              <tr>
                <th className="p-3">Invoice No</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3 text-right">Amount ($)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[var(--color-surface)]/60 transition-colors">
                  <td className="p-3 font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewInvoice(inv)}
                      className="text-[var(--color-accent)] hover:underline font-bold text-left cursor-pointer inline-flex items-center gap-1"
                      title="Click to preview invoice"
                    >
                      <span className="material-symbols-outlined text-xs">visibility</span>
                      <span>{inv.invoiceNo}</span>
                    </button>
                  </td>
                  <td className="p-3 text-[var(--color-text-secondary)]">{inv.date}</td>
                  <td className="p-3 text-right text-[var(--color-text-primary)] font-bold tabular-nums">
                    {formatCents(inv.amountCents)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-none border ${
                        inv.status === "PAID"
                          ? "bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border-[var(--color-status-success)]/40"
                          : "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning)]/40"
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
                      className="px-2.5 py-1 bg-[var(--color-bg)] hover:bg-[var(--color-surface)] text-[var(--color-accent)] border border-[var(--color-border)] text-[11px] font-semibold uppercase rounded-none transition-colors cursor-pointer"
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

      <InvoicePreviewModal
        invoice={previewInvoice}
        billingAddress={address}
        isOpen={Boolean(previewInvoice)}
        onClose={() => setPreviewInvoice(null)}
      />
    </div>
  );
}
