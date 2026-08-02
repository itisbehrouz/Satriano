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
    <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-6 md:p-8 text-[#E8ECF3] shadow-none space-y-6">
      <div className="border-b border-[#2E5AAC]/40 pb-4">
        <h2 className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#2E5AAC] rounded-none" />
          FAQ Quick Links &amp; Knowledge Base
        </h2>
        <p className="text-xs text-[#8DA0C4] mt-1">
          Frequently Asked Questions &amp; Manufacturing Guidelines
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
        {links.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            className="p-4 bg-[#0B1E3D] border border-[#1E3A8A] hover:border-[#2E5AAC] text-[#85B7EB] hover:text-white transition-colors rounded-none flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-base text-[#8DA0C4] group-hover:text-[#85B7EB]">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </div>
            <span className="text-[#8DA0C4] group-hover:text-white">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
