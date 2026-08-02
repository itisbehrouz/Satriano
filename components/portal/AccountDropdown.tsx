"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";

export interface AccountDropdownProps {
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function AccountDropdown({
  companyName,
  isOpen,
  onClose,
  onLogout,
}: AccountDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-full mt-2 w-60 bg-[#132A52] border border-[#2E5AAC] rounded-none shadow-none z-50 font-sans text-[13px] text-[#E8ECF3] py-1 select-none"
    >
      {/* Display Only Company Info Header */}
      <div className="px-4 py-2.5 border-b border-[#1E3A8A]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#8DA0C4] block">
          Company Account
        </span>
        <span className="font-mono font-bold text-[#E8ECF3] truncate block text-xs mt-0.5">
          {companyName}
        </span>
      </div>

      {/* Nav Links */}
      <div className="py-1">
        <Link
          href="/portal/account?tab=company"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 text-[#E8ECF3] hover:bg-[#2E5AAC]/20 hover:text-white transition-colors rounded-none"
        >
          <span className="material-symbols-outlined text-base text-[#8DA0C4]">corporate_fare</span>
          <span>Company Info</span>
        </Link>

        <Link
          href="/portal/orders"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 text-[#E8ECF3] hover:bg-[#2E5AAC]/20 hover:text-white transition-colors rounded-none"
        >
          <span className="material-symbols-outlined text-base text-[#8DA0C4]">receipt_long</span>
          <span>Order History</span>
        </Link>

        <Link
          href="/portal/account?tab=settings"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 text-[#E8ECF3] hover:bg-[#2E5AAC]/20 hover:text-white transition-colors rounded-none"
        >
          <span className="material-symbols-outlined text-base text-[#8DA0C4]">settings</span>
          <span>Settings</span>
        </Link>

        <Link
          href="/portal/account?tab=billing"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 text-[#E8ECF3] hover:bg-[#2E5AAC]/20 hover:text-white transition-colors rounded-none"
        >
          <span className="material-symbols-outlined text-base text-[#8DA0C4]">description</span>
          <span>Billing &amp; Invoices</span>
        </Link>
      </div>

      {/* Separator */}
      <div className="border-t border-[#1E3A8A] my-1" />

      {/* Support Link */}
      <div className="py-1">
        <Link
          href="/portal/support"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 text-[#E8ECF3] hover:bg-[#2E5AAC]/20 hover:text-white transition-colors rounded-none"
        >
          <span className="material-symbols-outlined text-base text-[#8DA0C4]">help</span>
          <span>Support</span>
        </Link>
      </div>

      {/* Separator */}
      <div className="border-t border-[#1E3A8A] my-1" />

      {/* Sign Out Warning Button */}
      <div className="py-1">
        <button
          type="button"
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="flex items-center justify-between w-full px-4 py-2 text-left text-[#F0B94A] hover:bg-[#F0B94A]/10 transition-colors rounded-none font-semibold cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Sign Out</span>
          </div>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
