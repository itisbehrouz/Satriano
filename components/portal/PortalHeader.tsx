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
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "dark";
      setTheme(current);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("satriano-theme", next);
    } catch (e) {}
  };

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
    <header className="sticky top-0 z-50 h-[64px] bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[var(--color-text-primary)] px-4 sm:px-6 font-sans select-none rounded-none shadow-none flex items-center justify-between transition-colors">
      <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between h-full">
        {/* Left: Brand Identity Logo Mark */}
        <div className="flex items-center gap-6">
          <Link
            href="/portal"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity rounded-none"
          >
            <div className="w-6 h-6 bg-[var(--color-gold)] text-[var(--color-bg)] font-mono font-extrabold flex items-center justify-center text-xs rounded-none">
              S
            </div>
            <span className="text-base font-extrabold tracking-wider text-[var(--color-text-primary)]">
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
                    ? "border-b-2 border-[var(--color-accent)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                Catalog
              </Link>
              <Link
                href="/portal/orders"
                className={`transition-colors pb-1 rounded-none ${
                  isOrdersActive
                    ? "border-b-2 border-[var(--color-accent)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                Orders
              </Link>
              <Link
                href="/portal/account?tab=company"
                className={`transition-colors pb-1 rounded-none ${
                  isAccountActive
                    ? "border-b-2 border-[var(--color-accent)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                Account
              </Link>
            </nav>
          )}
        </div>

        {/* Right: Theme Toggle, Account Dropdown & Sign Out Action Button */}
        <div className="flex items-center gap-3">
          {/* Site-Wide Dark/Light Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            className="bg-[var(--color-bg)] hover:bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs font-semibold px-2.5 py-1.5 inline-flex items-center justify-center transition-colors cursor-pointer rounded-none min-h-[32px] min-w-[32px]"
          >
            <span className="material-symbols-outlined text-base">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {companyName ? (
            <>
              {/* Account Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="bg-[var(--color-bg)] hover:bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs font-semibold px-3 py-1.5 inline-flex items-center gap-2 transition-colors cursor-pointer rounded-none shadow-none"
                >
                  <span className="material-symbols-outlined text-base text-[var(--color-text-secondary)]">
                    account_circle
                  </span>
                  <span className="font-mono text-xs max-w-[160px] sm:max-w-[200px] truncate">
                    {companyName}
                  </span>
                  <span className="material-symbols-outlined text-sm text-[var(--color-text-secondary)]">
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
              className="bg-[var(--color-accent)] hover:bg-[#1E3F7A] text-white text-xs font-bold px-4 py-2 uppercase tracking-wider transition-colors rounded-none shadow-none"
            >
              Client Portal Login
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
