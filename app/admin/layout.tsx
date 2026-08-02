"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/AdminAuthContext";
import { GlobalCommandPalette } from "@/components/admin/GlobalCommandPalette";

interface SubItem {
  label: string;
  icon: string;
  href: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  subItems: SubItem[];
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    label: "Order Ledger",
    icon: "receipt_long",
    isActive: (pathname: string) => pathname === "/admin",
    subItems: [
      { label: "All Orders", icon: "table_rows", href: "/admin?status=ALL" },
      { label: "Pending Review", icon: "pending_actions", href: "/admin?status=PENDING_REVIEW" },
      { label: "Proforma Sent", icon: "description", href: "/admin?status=PROFORMA_SENT" },
      { label: "In Production", icon: "precision_manufacturing", href: "/admin?status=IN_PRODUCTION" },
      { label: "Shipped Orders", icon: "local_shipping", href: "/admin?status=SHIPPED" },
    ],
  },
  {
    href: "/admin/wholesale",
    label: "Wholesale Manager",
    icon: "storefront",
    isActive: (pathname: string) => pathname.startsWith("/admin/wholesale"),
    subItems: [
      { label: "Supplier Management", icon: "store", href: "/admin/wholesale/suppliers" },
      { label: "Inventory by Category", icon: "category", href: "/admin/wholesale/inventory" },
      { label: "Pricing Manager", icon: "sell", href: "/admin/wholesale?tab=pricing" },
      { label: "Inventory by Size", icon: "grid_on", href: "/admin/wholesale?tab=inventory" },
      { label: "Price Offer Inbox", icon: "mark_email_unread", href: "/admin/wholesale?tab=offers" },
      { label: "Wholesale Orders", icon: "local_shipping", href: "/admin/wholesale?tab=orders" },
    ],
  },
  {
    href: "/admin/applications",
    label: "B2B Applications",
    icon: "assignment_ind",
    isActive: (pathname: string) => pathname.startsWith("/admin/applications"),
    subItems: [
      { label: "All Applications", icon: "assignment", href: "/admin/applications?status=ALL" },
      { label: "Submitted (New)", icon: "mark_unread_chat_alt", href: "/admin/applications?status=SUBMITTED" },
      { label: "Under Review", icon: "rule", href: "/admin/applications?status=UNDER_REVIEW" },
      { label: "Approved Partners", icon: "verified", href: "/admin/applications?status=APPROVED" },
      { label: "Rejected", icon: "cancel", href: "/admin/applications?status=REJECTED" },
    ],
  },
  {
    href: "/admin/product-settings",
    label: "Product Settings",
    icon: "inventory_2",
    isActive: (pathname: string) => pathname.startsWith("/admin/product-settings"),
    subItems: [
      { label: "Garment Catalog", icon: "account_tree", href: "/admin/product-settings?tab=catalog" },
      { label: "Garment Fits", icon: "straighten", href: "/admin/product-settings?tab=fits" },
      { label: "Regional Sizing", icon: "aspect_ratio", href: "/admin/product-settings?tab=sizing" },
      { label: "Fabric Pricing", icon: "texture", href: "/admin/product-settings?tab=fabrics" },
    ],
  },
  {
    href: "/admin/architecture-viz",
    label: "3D Telemetry",
    icon: "view_in_ar",
    isActive: (pathname: string) => pathname.startsWith("/admin/architecture-viz"),
    subItems: [
      { label: "3D Zero-G Canvas", icon: "view_in_ar", href: "/admin/architecture-viz" },
      { label: "Node Telemetry", icon: "hub", href: "/admin/architecture-viz" },
    ],
  },
];

function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const { isAuthenticated, signOut } = useAdminAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const navRef = useRef<HTMLDivElement>(null);

  // Initialize theme from DOM / LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentTheme =
        (document.documentElement.getAttribute("data-theme") as "light" | "dark") ||
        (localStorage.getItem("satriano-theme") as "light" | "dark") ||
        "light";
      setTheme(currentTheme);
      document.documentElement.setAttribute("data-theme", currentTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("satriano-theme", nextTheme);
    } catch (e) {
      console.error("Theme storage error:", e);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Login gate / session-loading states render full-bleed without menu chrome
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans transition-colors">
      {/* SAP Fiori Style Top Header / Navigation Menu Bar */}
      <header
        ref={navRef}
        aria-label="Admin Navigation Header"
        className="sticky top-0 z-40 w-full bg-[#0B1E3D] text-white border-b border-[#1E3A8A] shadow-md select-none transition-colors"
      >
        <div className="max-w-container-max mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Portal Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <img
                src="/Satrinao.png"
                alt="Satriano Atelier"
                className="h-8 w-auto object-contain brightness-200"
              />
              <div className="hidden sm:flex flex-col border-l border-white/20 pl-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white leading-none">
                  Portal Console
                </span>
                <span className="text-[10px] text-[#93C5FD] font-mono tracking-tight mt-0.5">
                  SAP Enterprise ERP
                </span>
              </div>
            </Link>

            {/* Desktop Horizontal Navigation Items (SAP Style Dropdown Menu) */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main Menu">
              {NAV_ITEMS.map((item) => {
                const isActive = item.isActive(pathname);
                const isOpen = activeDropdown === item.href;

                return (
                  <div key={item.href} className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(isOpen ? null : item.href)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#2E5AAC] text-white shadow-xs"
                          : isOpen
                          ? "bg-white/10 text-white"
                          : "text-[#93C5FD] hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg flex-shrink-0">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      <span className="material-symbols-outlined text-sm text-white/60">
                        {isOpen ? "expand_less" : "expand_more"}
                      </span>
                    </button>

                    {/* SAP Sub-Menu Dropdown Panel */}
                    {isOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl py-2 z-50 animate-fadeIn">
                        <div className="px-3 py-1.5 border-b border-[var(--color-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                          {item.label} Navigation
                        </div>
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] transition-colors"
                          >
                            <span className="material-symbols-outlined text-base text-[var(--color-accent)]">
                              {sub.icon}
                            </span>
                            <span>{sub.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right Action Utilities: Search, Theme Toggle & Sign Out */}
          <div className="flex items-center gap-2">
            {/* Quick Command Palette Search Button */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-[#93C5FD] hover:text-white transition-all cursor-pointer"
              title="Search orders, catalog or B2B partners (⌘K)"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span className="hidden md:inline text-xs font-medium">Search...</span>
              <kbd className="px-1.5 py-0.5 bg-black/20 border border-white/20 rounded text-[10px] font-mono text-white/80">
                ⌘K
              </kbd>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-md flex items-center justify-center bg-white/10 hover:bg-white/20 text-[#DBB671] border border-white/15 transition-all cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className="material-symbols-outlined text-xl">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {/* Admin User Badge & Sign Out Button */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="w-8 h-8 rounded-full bg-[#2E5AAC] text-white border border-white/20 flex items-center justify-center text-xs font-bold">
                A
              </div>
              <button
                type="button"
                onClick={signOut}
                className="w-9 h-9 rounded-md flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                title="Sign Out of Console"
                aria-label="Sign Out of Console"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-md flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#1E3A8A] bg-[#0B1E3D] px-4 py-4 space-y-4 animate-fadeIn">
            {/* Command Palette Trigger Mobile */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsPaletteOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-white/10 text-xs text-white"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">search</span>
                <span>Search console...</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-mono">⌘K</kbd>
            </button>

            {/* Mobile Menu Links */}
            <div className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <div key={item.href} className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#93C5FD] flex items-center gap-2 py-1">
                    <span className="material-symbols-outlined text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-1.5 px-2 rounded text-xs font-medium text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <span className="material-symbols-outlined text-sm">{sub.icon}</span>
                        <span>{sub.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Sign Out */}
            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs font-semibold text-white/80">Authorized Admin</span>
              <button
                type="button"
                onClick={signOut}
                className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <div className="flex-1 min-w-0">{children}</div>
      </div>

      {/* Command Palette Modal */}
      <GlobalCommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminChrome>{children}</AdminChrome>
    </AdminAuthProvider>
  );
}
