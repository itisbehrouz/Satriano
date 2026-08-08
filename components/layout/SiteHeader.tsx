"use client";

import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { AccountDropdown } from "@/components/portal/AccountDropdown";
import { getM2OCart, type M2OCartItem } from "@/lib/m2oCart";
import { AtelierLogo } from "@/components/layout/AtelierLogo";

const ANONYMOUS_NAV_ITEMS = [
  { label: "COLLECTIONS", href: "/categories" },
  { label: "SOURCING", href: "/legal/supply-terms" },
  { label: "WHOLESALE", href: "/wholesale" },
];

const AUTHENTICATED_NAV_ITEMS = [
  { label: "Catalog", href: "/categories" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Orders", href: "/portal/orders" },
  { label: "Account", href: "/portal/account" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, refetch } = useCustomerSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const current =
        (document.documentElement.getAttribute("data-theme") as "light" | "dark") ||
        "light";
      setTheme(current);
    }
  }, []);

  useEffect(() => {
    function updateCartCount() {
      const cart = getM2OCart();
      setCartCount(cart.length);
    }
    updateCartCount();
    
    window.addEventListener("m2o-cart-updated", updateCartCount);
    return () => window.removeEventListener("m2o-cart-updated", updateCartCount);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("satriano-theme", next);
    } catch (e) {}
  };

  async function handleSignOut() {
    try {
      await fetch("/api/portal/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsDropdownOpen(false);
      await refetch();
      router.push("/portal");
      router.refresh();
    }
  }

  const isAuthenticated = session?.authenticated === true;
  const displayName = session?.companyName || session?.email || "CLIENT ACCOUNT";
  const navItems = isAuthenticated ? AUTHENTICATED_NAV_ITEMS : ANONYMOUS_NAV_ITEMS;

  return (
    <header className="bg-[var(--color-bg)] text-[var(--color-text-primary)] sticky top-0 z-50 w-full transition-colors border-b border-[var(--color-border)]">
      <div className="flex justify-between items-center w-full px-3 md:px-8 py-3 max-w-container-max mx-auto">
        {/* Official Brand Logo Image */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-95 transition-opacity"
        >
          <AtelierLogo />
        </Link>

        {/* Desktop Navigation Items */}
        <nav className="hidden md:flex gap-8 items-center text-xs font-semibold tracking-wider uppercase">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative py-1 transition-colors ${
                  isActive
                    ? "text-[var(--color-text-primary)] border-b-2 border-[var(--color-gold)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Primary Action & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Site-Wide Dark/Light Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            title={
              theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"
            }
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:opacity-80 border border-[var(--color-border)] rounded-none transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* M2O Cart Icon */}
          <Link
            href="/configure/checkout"
            className="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:opacity-80 border border-[var(--color-border)] rounded-none transition-colors"
            title="View Order Spec"
          >
            <span className="material-symbols-outlined text-lg">
              shopping_cart
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Identity Chip (Authenticated) OR Client Portal Login Button (Anonymous) */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="bg-[var(--color-surface)] hover:bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs font-semibold px-3 py-2.5 inline-flex items-center gap-2 transition-colors cursor-pointer rounded-none min-h-[44px]"
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="font-mono text-xs max-w-[140px] sm:max-w-[180px] truncate uppercase">
                  {displayName}
                </span>
                <span className="material-symbols-outlined text-sm text-[var(--color-text-secondary)]">
                  {isDropdownOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              <AccountDropdown
                companyName={displayName}
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                onLogout={handleSignOut}
              />
            </div>
          ) : (
            <Link
              href="/portal"
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[11px] sm:text-xs uppercase font-semibold tracking-wider px-3 sm:px-5 py-2.5 rounded-none transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
            >
              <span className="material-symbols-outlined text-base">
                account_circle
              </span>
              <span>Client Portal</span>
            </Link>
          )}

          {/* Accessible Mobile Nav Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="md:hidden inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
            <span>{mobileMenuOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-xs font-semibold tracking-wider uppercase py-2.5 px-3 rounded transition-colors ${
                  isActive
                    ? "bg-[var(--color-bg)] text-[var(--color-gold)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)]/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
