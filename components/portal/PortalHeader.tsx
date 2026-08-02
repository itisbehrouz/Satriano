"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AccountDropdown } from "@/components/portal/AccountDropdown";

export interface PortalHeaderProps {
  initialCompanyName?: string | null;
}

export function PortalHeader({ initialCompanyName = null }: PortalHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [companyName, setCompanyName] = useState<string | null>(initialCompanyName);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  async function fetchSession() {
    try {
      const res = await fetch("/api/customer/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setCompanyName(data.companyName || data.email);
        } else {
          setCompanyName(null);
        }
      } else {
        setCompanyName(null);
      }
    } catch (err) {
      console.error("Session fetch error:", err);
      setCompanyName(null);
    } finally {
      setLoadingSession(false);
    }
  }

  useEffect(() => {
    fetchSession();
  }, []);

  async function handleSignOut() {
    try {
      await fetch("/api/portal/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setCompanyName(null);
      setIsDropdownOpen(false);
      router.push("/portal");
      router.refresh();
    }
  }

  // Determine active nav link
  const isCatalogActive = pathname.startsWith("/konfigurator") || pathname.startsWith("/portal/catalog");
  const isOrdersActive = pathname.startsWith("/portal/orders");
  const isAccountActive = pathname.startsWith("/portal/account");

  return (
    <header className="sticky top-0 z-50 h-[64px] bg-[#0B1E3D] border-b border-[#1E3A8A] text-[#E8ECF3] px-4 sm:px-6 font-sans select-none rounded-none shadow-none flex items-center justify-between">
      <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between h-full">
        {/* Left: Brand Identity Logo Mark */}
        <div className="flex items-center gap-6">
          <Link
            href="/portal"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity rounded-none"
          >
            <div className="w-6 h-6 bg-[#D4AF37] text-[#0B1E3D] font-mono font-extrabold flex items-center justify-center text-xs rounded-none">
              S
            </div>
            <span className="text-base font-extrabold tracking-wider text-white">
              SATRIANO
            </span>
          </Link>

          {/* Center: Main Navigation (Catalog | Orders | Account) */}
          {companyName && (
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
              <Link
                href="/konfigurator"
                className={`transition-colors pb-1 rounded-none ${
                  isCatalogActive
                    ? "border-b-2 border-[#2E5AAC] text-[#E8ECF3]"
                    : "text-[#8DA0C4] hover:text-[#E8ECF3]"
                }`}
              >
                Catalog
              </Link>
              <Link
                href="/portal/orders"
                className={`transition-colors pb-1 rounded-none ${
                  isOrdersActive
                    ? "border-b-2 border-[#2E5AAC] text-[#E8ECF3]"
                    : "text-[#8DA0C4] hover:text-[#E8ECF3]"
                }`}
              >
                Orders
              </Link>
              <Link
                href="/portal/account?tab=company"
                className={`transition-colors pb-1 rounded-none ${
                  isAccountActive
                    ? "border-b-2 border-[#2E5AAC] text-[#E8ECF3]"
                    : "text-[#8DA0C4] hover:text-[#E8ECF3]"
                }`}
              >
                Account
              </Link>
            </nav>
          )}
        </div>

        {/* Right: Account Dropdown & Sign Out Action Button */}
        <div className="flex items-center gap-3">
          {companyName ? (
            <>
              {/* Account Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="bg-[#0B1E3D] hover:bg-[#132A52] text-[#E8ECF3] border border-[#1E3A8A] text-xs font-semibold px-3 py-1.5 inline-flex items-center gap-2 transition-colors cursor-pointer rounded-none shadow-none"
                >
                  <span className="material-symbols-outlined text-base text-[#8DA0C4]">
                    account_circle
                  </span>
                  <span className="font-mono text-xs max-w-[160px] sm:max-w-[200px] truncate">
                    {companyName}
                  </span>
                  <span className="material-symbols-outlined text-sm text-[#8DA0C4]">
                    {isDropdownOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {/* Account Dropdown Menu */}
                <AccountDropdown
                  companyName={companyName}
                  isOpen={isDropdownOpen}
                  onClose={() => setIsDropdownOpen(false)}
                  onLogout={handleSignOut}
                />
              </div>
            </>
          ) : !loadingSession ? (
            <Link
              href="/portal"
              className="bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-bold px-4 py-2 uppercase tracking-wider transition-colors rounded-none shadow-none"
            >
              Client Portal Login
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
