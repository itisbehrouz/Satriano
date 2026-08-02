"use client";

import React from "react";
import Link from "next/link";

export function QuickActionButtons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans select-none">
      {/* Primary Action Button: Create New Order */}
      <Link
        href="/konfigurator"
        className="h-12 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-bold uppercase tracking-wider px-4 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
      >
        <span className="text-base">➕</span>
        <span>Create New Order</span>
      </Link>

      {/* Secondary Action 1: View All Orders */}
      <Link
        href="/portal/orders"
        className="h-12 bg-[#132A52] hover:bg-[#1E3A6D] text-[#E8ECF3] border border-[#2E5AAC] text-xs font-semibold px-4 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
      >
        <span className="text-base">📋</span>
        <span>View All Orders</span>
      </Link>

      {/* Secondary Action 2: Account Settings */}
      <Link
        href="/portal/account?tab=settings"
        className="h-12 bg-[#132A52] hover:bg-[#1E3A6D] text-[#E8ECF3] border border-[#2E5AAC] text-xs font-semibold px-4 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
      >
        <span className="text-base">⚙️</span>
        <span>Account Settings</span>
      </Link>

      {/* Secondary Action 3: Contact Support */}
      <Link
        href="/portal/support"
        className="h-12 bg-[#132A52] hover:bg-[#1E3A6D] text-[#E8ECF3] border border-[#2E5AAC] text-xs font-semibold px-4 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
      >
        <span className="text-base">📞</span>
        <span>Contact Support</span>
      </Link>
    </div>
  );
}
