"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function PortalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Authenticated session check via GET /api/portal/orders
    fetch("/api/portal/orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) setCustomerEmail(data.email);
      })
      .catch(() => null);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/portal/logout", { method: "POST" });
      router.push("/portal");
      router.refresh();
    } catch (err) {
      console.error("Portal logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="w-full bg-[#0B1E3D] text-white border-b border-[#1E3A8A] sticky top-0 z-50 select-none font-sans">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand & Portal Badge */}
        <div className="flex items-center gap-4">
          <Link href="/portal/orders" className="flex items-center gap-2.5">
            <span className="font-bold text-sm tracking-wider uppercase text-white">Satriano</span>
            <span className="text-[10px] font-mono bg-[#2E5AAC]/40 text-[#93C5FD] border border-[#2E5AAC]/60 px-2 py-0.5 rounded uppercase">
              B2B Client Portal
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <Link
            href="/portal/orders"
            className={`transition-colors ${
              pathname === "/portal/orders" ? "text-[#60A5FA]" : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Orders &amp; History
          </Link>
          <Link
            href="/portal/orders#invoices"
            className="text-[#94A3B8] hover:text-white transition-colors"
          >
            Invoices &amp; Proformas
          </Link>
          <Link
            href="/portal/settings"
            className={`transition-colors ${
              pathname === "/portal/settings" ? "text-[#60A5FA]" : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Company Settings
          </Link>
        </nav>

        {/* User Session & Logout Action */}
        <div className="flex items-center gap-3">
          {customerEmail && (
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#94A3B8] bg-[#172A4D] px-2.5 py-1 rounded border border-[#1E3A8A]">
              {customerEmail}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-3.5 py-1.5 bg-[#172A4D] hover:bg-[#A32D2D]/30 text-[#F87171] hover:text-white border border-[#1E3A8A] hover:border-[#F87171]/40 rounded text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </header>
  );
}
