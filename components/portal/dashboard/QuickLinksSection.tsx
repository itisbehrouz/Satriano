"use client";

import React from "react";
import Link from "next/link";

export function QuickLinksSection() {
  return (
    <div className="font-sans select-none">
      <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-3">
        Helpful Resources
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Link
          href="/konfigurator"
          className="text-[var(--color-accent)] hover:underline flex items-center gap-1.5 font-medium"
        >
          <span>•</span>
          <span>How to Configure an Order</span>
        </Link>

        <Link
          href="/portal/support"
          className="text-[var(--color-accent)] hover:underline flex items-center gap-1.5 font-medium"
        >
          <span>•</span>
          <span>MOQ &amp; Lead Time FAQs</span>
        </Link>

        <Link
          href="/portal/orders"
          className="text-[var(--color-accent)] hover:underline flex items-center gap-1.5 font-medium"
        >
          <span>•</span>
          <span>Payment Methods &amp; Invoicing</span>
        </Link>

        <Link
          href="/portal/support"
          className="text-[var(--color-accent)] hover:underline flex items-center gap-1.5 font-medium"
        >
          <span>•</span>
          <span>Contact Support</span>
        </Link>
      </div>
    </div>
  );
}
