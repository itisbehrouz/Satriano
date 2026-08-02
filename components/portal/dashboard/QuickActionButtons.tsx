"use client";

import React from "react";
import Link from "next/link";

export function QuickActionButtons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans select-none">
      {/* 1. Primary Button: CREATE NEW ORDER */}
      <Link
        href="/configure"
        className="h-12 bg-[var(--color-accent)] hover:bg-[#1E3F7F] text-white text-sm font-bold uppercase tracking-wider px-4 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
      >
        <span className="text-xl">➕</span>
        <span>CREATE NEW ORDER</span>
      </Link>

      {/* 2. Secondary Outline: VIEW ALL ORDERS */}
      <Link
        href="/portal/orders"
        className="h-12 bg-[var(--color-surface)] hover:bg-[var(--color-bg)] text-[var(--color-accent)] border-2 border-[var(--color-accent)] text-sm font-bold uppercase tracking-wider px-4 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
      >
        <span className="text-xl">📋</span>
        <span>VIEW ALL ORDERS</span>
      </Link>

      {/* 3. Secondary Outline: ACCOUNT SETTINGS */}
      <Link
        href="/portal/account"
        className="h-12 bg-[var(--color-surface)] hover:bg-[var(--color-bg)] text-[var(--color-accent)] border-2 border-[var(--color-accent)] text-sm font-bold uppercase tracking-wider px-4 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
      >
        <span className="text-xl">⚙️</span>
        <span>ACCOUNT SETTINGS</span>
      </Link>

      {/* 4. Secondary Outline: CONTACT SUPPORT */}
      <Link
        href="/portal/support"
        className="h-12 bg-[var(--color-surface)] hover:bg-[var(--color-bg)] text-[var(--color-accent)] border-2 border-[var(--color-accent)] text-sm font-bold uppercase tracking-wider px-4 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
      >
        <span className="text-xl">📞</span>
        <span>CONTACT SUPPORT</span>
      </Link>
    </div>
  );
}
