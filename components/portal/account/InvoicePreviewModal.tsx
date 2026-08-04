"use client";

import React from "react";
import { formatCents } from "@/lib/formatCurrency";

export interface InvoiceItem {
  id: string;
  invoiceNo: string;
  orderId: string;
  date: string;
  amountCents: number;
  status: string;
}

export interface InvoicePreviewModalProps {
  invoice: InvoiceItem | null;
  billingAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoicePreviewModal({
  invoice,
  billingAddress,
  isOpen,
  onClose,
}: InvoicePreviewModalProps) {
  if (!isOpen || !invoice) return null;

  const isProforma = invoice.status === "PROFORMA";
  const docTitle = isProforma ? "PROFORMA INVOICE" : "TAX INVOICE";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-none w-full max-w-[680px] text-[var(--color-text-primary)] shadow-2xl relative my-8 transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--color-accent)] uppercase block mb-1">
              SATRIANO ATELIER OFFICIAL DOCUMENT
            </span>
            <h2 className="text-xl font-bold font-mono text-[var(--color-text-primary)] flex items-center gap-3">
              {docTitle} #{invoice.invoiceNo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Preview"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] text-xl font-bold cursor-pointer p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs font-mono">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--color-bg)] border border-[var(--color-border)]">
            <div>
              <span className="text-[var(--color-text-secondary)] text-[10px] uppercase block mb-1">
                Issuer Details
              </span>
              <p className="font-bold text-[var(--color-text-primary)]">Satriano Garment Trading LLC</p>
              <p className="text-[var(--color-text-secondary)]">TRN: 100485930200003</p>
              <p className="text-[var(--color-text-secondary)]">Building 4, Design District (d3), Dubai, UAE</p>
            </div>
            <div className="text-right">
              <span className="text-[var(--color-text-secondary)] text-[10px] uppercase block mb-1">
                Document Details
              </span>
              <p className="font-bold text-[var(--color-text-primary)]">Date: {invoice.date}</p>
              <p className="text-[var(--color-text-secondary)]">Ref Order: #{invoice.orderId}</p>
              <div className="mt-2">
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 border ${
                    invoice.status === "PAID"
                      ? "bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border-[var(--color-status-success)]/40"
                      : "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning)]/40"
                  }`}
                >
                  STATUS: {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To Address */}
          <div>
            <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider block mb-2">
              Billed Corporate Entity:
            </span>
            <pre className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono text-xs whitespace-pre-wrap">
              {billingAddress}
            </pre>
          </div>

          {/* Mock Items Specification Ledger */}
          <div>
            <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider block mb-2">
              Itemized Line Ledger:
            </span>
            <table className="w-full text-left border border-[var(--color-border)]">
              <thead className="bg-[var(--color-bg)] text-[var(--color-text-secondary)] text-[10px] uppercase">
                <tr>
                  <th className="p-2.5 border-b border-[var(--color-border)]">Description</th>
                  <th className="p-2.5 border-b border-[var(--color-border)] text-center">Qty</th>
                  <th className="p-2.5 border-b border-[var(--color-border)] text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                <tr>
                  <td className="p-2.5 font-bold">
                    Custom Apparel Spec ({invoice.invoiceNo})
                    <span className="block text-[10px] font-normal text-[var(--color-text-secondary)]">
                      Production & Fabric Sourcing Run
                    </span>
                  </td>
                  <td className="p-2.5 text-center font-bold">1 Lot</td>
                  <td className="p-2.5 text-right font-bold tabular-nums">
                    {formatCents(invoice.amountCents)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Breakdown */}
          <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2">
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Subtotal:</span>
              <span className="tabular-nums font-bold text-[var(--color-text-primary)]">
                {formatCents(invoice.amountCents)}
              </span>
            </div>
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Tax / VAT (0% Export / Corporate):</span>
              <span className="tabular-nums font-bold text-[var(--color-text-primary)]">$0.00</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[var(--color-text-primary)] pt-2 border-t border-[var(--color-border)]">
              <span>Total Payable Amount:</span>
              <span className="text-[var(--color-accent)] tabular-nums">
                {formatCents(invoice.amountCents)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => alert(`Downloading PDF for invoice ${invoice.invoiceNo}...`)}
            className="flex-1 h-11 bg-[var(--color-accent)] hover:bg-[#1E3F7F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Download Official PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 bg-transparent hover:bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors cursor-pointer"
          >
            <span>Close Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
}
