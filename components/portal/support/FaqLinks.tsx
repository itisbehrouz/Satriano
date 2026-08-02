"use client";

import React from "react";
import Link from "next/link";

export function FaqLinks() {
  const links = [
    { label: "How to configure a custom order", href: "/konfigurator", icon: "tune" },
    { label: "MOQ & Lead Time FAQs", href: "/portal/faq#moq", icon: "schedule" },
    { label: "Payment methods & proforma invoicing", href: "/portal/account?tab=billing", icon: "payments" },
    { label: "International shipping & delivery SLAs", href: "/portal/faq#shipping", icon: "local_shipping" },
    { label: "Quality guarantee, returns & replacements", href: "/portal/faq#returns", icon: "verified" },
  ];

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 md:p-8 text-[var(--color-text-primary)] shadow-none space-y-6 transition-colors">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h2 className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-none" />
          FAQ Quick Links &amp; Knowledge Base
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Frequently Asked Questions &amp; Manufacturing Guidelines
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
        {links.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-accent)] hover:text-[var(--color-text-primary)] transition-colors rounded-none flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-base text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </div>
            <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
