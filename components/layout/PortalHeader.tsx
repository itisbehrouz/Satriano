"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface PortalHeaderProps {
  sessionEmail?: string | null;
}

export function PortalHeader({ sessionEmail: initialEmail = null }: PortalHeaderProps) {
  const router = useRouter();
  const [sessionEmail, setSessionEmail] = useState<string | null>(initialEmail);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (sessionEmail !== null) return;
    async function checkSession() {
      try {
        const res = await fetch("/api/portal/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.email) {
            setSessionEmail(data.email);
          }
        }
      } catch {
        // Unauthenticated or login page
      }
    }
    checkSession();
  }, [sessionEmail]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/portal/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setSessionEmail(null);
      setIsDropdownOpen(false);
      router.push("/portal");
      router.refresh();
    }
  }

  return (
    <header className="bg-[#0B1E3D] border-b border-[#1E3A8A] text-white py-3.5 px-4 sm:px-6 lg:px-8 font-sans select-none rounded-none shadow-none">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Left: Brand Identity & Portal Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-lg font-extrabold tracking-wider text-white hover:text-[#93C5FD] transition-colors rounded-none"
          >
            SATRIANO
          </Link>
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-[#172A4D] text-[#93C5FD] px-2.5 py-0.5 border border-[#1E3A8A] rounded-none">
            B2B CLIENT PORTAL
          </span>
        </div>

        {/* Right: Session User Dropdown or Generic Portal Indicator */}
        <div className="flex items-center gap-4">
          {sessionEmail ? (
            <div className="relative" ref={dropdownRef}>
              {/* User Dropdown Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="bg-[#172A4D] hover:bg-[#1E3A6D] text-white border border-[#1E3A8A] text-xs font-semibold px-3 py-1.5 inline-flex items-center gap-2 transition-colors cursor-pointer rounded-none shadow-none"
              >
                <span className="w-2 h-2 rounded-none bg-[#10B981]" />
                <span className="font-mono text-xs max-w-[180px] sm:max-w-[240px] truncate">
                  {sessionEmail}
                </span>
                <span className="material-symbols-outlined text-sm">
                  {isDropdownOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-[#0B1E3D] border border-[#1E3A8A] rounded-none shadow-none z-50 py-1 font-sans text-xs">
                  <div className="px-3.5 py-2 border-b border-[#1E3A8A]">
                    <p className="text-[10px] uppercase font-mono text-[#93C5FD]">
                      Signed in as
                    </p>
                    <p className="font-mono font-semibold text-white truncate text-xs mt-0.5">
                      {sessionEmail}
                    </p>
                  </div>

                  <Link
                    href="/portal/orders"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[#E2E8F0] hover:bg-[#172A4D] hover:text-white transition-colors rounded-none"
                  >
                    <span className="material-symbols-outlined text-base">receipt_long</span>
                    <span>Orders &amp; History</span>
                  </Link>

                  <Link
                    href="/portal/orders#invoices"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[#E2E8F0] hover:bg-[#172A4D] hover:text-white transition-colors rounded-none"
                  >
                    <span className="material-symbols-outlined text-base">description</span>
                    <span>Invoices &amp; Proformas</span>
                  </Link>

                  <Link
                    href="/portal/account?tab=settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[#E2E8F0] hover:bg-[#172A4D] hover:text-white transition-colors rounded-none"
                  >
                    <span className="material-symbols-outlined text-base">settings</span>
                    <span>Company Settings</span>
                  </Link>

                  <div className="border-t border-[#1E3A8A] my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full px-3.5 py-2 text-left text-[#F87171] hover:bg-[#A32D2D]/20 hover:text-white font-semibold transition-colors rounded-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>Sign Out</span>
                    </div>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/portal"
              className="bg-[#172A4D] hover:bg-[#1E3A6D] text-[#93C5FD] border border-[#1E3A8A] text-xs font-bold px-3 py-1.5 uppercase tracking-wider transition-colors rounded-none shadow-none"
            >
              CLIENT PORTAL
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
