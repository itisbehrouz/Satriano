"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/AdminAuthContext";
import { AdminLanguageProvider, useAdminLanguage } from "@/components/admin/AdminLanguageContext";

const GlobalCommandPalette = dynamic(
  () => import("@/components/admin/GlobalCommandPalette").then((mod) => mod.GlobalCommandPalette),
  { ssr: false }
);

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

function getNavItems(t: import("@/lib/i18n/admin-dictionary").AdminDictionary): NavItem[] {
  return [
    {
      href: "/admin",
      label: t.orderLedger,
      icon: "receipt_long",
      isActive: (pathname: string) => pathname === "/admin" || pathname.startsWith("/admin/orders"),
      subItems: [
        { label: t.executiveDashboard, icon: "dashboard", href: "/admin" },
        { label: t.allOrdersLedger, icon: "table_rows", href: "/admin/orders?status=ALL" },
        { label: t.pendingReview, icon: "pending_actions", href: "/admin/orders?status=PENDING_REVIEW" },
        { label: t.proformaSent, icon: "description", href: "/admin/orders?status=PROFORMA_SENT" },
        { label: t.inProduction, icon: "precision_manufacturing", href: "/admin/orders?status=IN_PRODUCTION" },
        { label: t.shippedOrders, icon: "local_shipping", href: "/admin/orders?status=SHIPPED" },
      ],
    },
    {
      href: "/admin/wholesale",
      label: t.wholesale,
      icon: "storefront",
      isActive: (pathname: string) => pathname.startsWith("/admin/wholesale"),
      subItems: [
        { label: t.supplierManagement, icon: "store", href: "/admin/wholesale/suppliers" },
        { label: t.inventoryByCategory, icon: "category", href: "/admin/wholesale/inventory" },
        { label: t.pricingManager, icon: "sell", href: "/admin/wholesale?tab=pricing" },
        { label: t.inventoryBySize, icon: "grid_on", href: "/admin/wholesale?tab=inventory" },
        { label: t.priceOfferInbox, icon: "mark_email_unread", href: "/admin/wholesale?tab=offers" },
        { label: t.wholesaleOrders, icon: "local_shipping", href: "/admin/wholesale?tab=orders" },
      ],
    },
    {
      href: "/admin/applications",
      label: t.b2bPartners,
      icon: "assignment_ind",
      isActive: (pathname: string) => pathname.startsWith("/admin/applications"),
      subItems: [
        { label: t.allApplications, icon: "assignment", href: "/admin/applications?status=ALL" },
        { label: t.submittedNew, icon: "mark_unread_chat_alt", href: "/admin/applications?status=SUBMITTED" },
        { label: t.underReview, icon: "rule", href: "/admin/applications?status=UNDER_REVIEW" },
        { label: t.approvedPartners, icon: "verified", href: "/admin/applications?status=APPROVED" },
        { label: t.rejected, icon: "cancel", href: "/admin/applications?status=REJECTED" },
      ],
    },
    {
      href: "/admin/product-settings",
      label: t.catalogFits,
      icon: "inventory_2",
      isActive: (pathname: string) => pathname.startsWith("/admin/product-settings"),
      subItems: [
        { label: t.garmentCatalog, icon: "account_tree", href: "/admin/product-settings?tab=catalog" },
        { label: t.garmentFits, icon: "straighten", href: "/admin/product-settings?tab=fits" },
        { label: t.regionalSizing, icon: "aspect_ratio", href: "/admin/product-settings?tab=sizing" },
        { label: t.fabricPricing, icon: "texture", href: "/admin/product-settings?tab=fabrics" },
      ],
    },
    {
      href: "/admin/architecture-viz",
      label: t.telemetry,
      icon: "view_in_ar",
      isActive: (pathname: string) => pathname.startsWith("/admin/architecture-viz"),
      subItems: [
        { label: t.telemetryCanvas, icon: "view_in_ar", href: "/admin/architecture-viz" },
        { label: t.nodeTelemetry, icon: "hub", href: "/admin/architecture-viz" },
      ],
    },
  ];
}

function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const { isAuthenticated, signOut } = useAdminAuth();
  const { language, setLanguage, t } = useAdminLanguage();
  const navItems = getNavItems(t);
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

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans transition-colors">
      {/* Streamlined Dynamic Light/Dark Mode Header Navigation */}
      <header
        ref={navRef}
        aria-label="Admin Navigation Header"
        className="sticky top-0 z-40 w-full bg-[var(--color-surface)] text-[var(--color-text-primary)] border-b border-[var(--color-border)] select-none transition-colors shadow-xs"
      >
        <div className="max-w-container-max mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-6">
          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Menu">
            {navItems.map((item) => {
              const isActive = item.isActive(pathname);
              const isOpen = activeDropdown === item.href;

              return (
                <div key={item.href} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : item.href)}
                    className={`h-14 px-3.5 text-xs font-semibold tracking-wide flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-[var(--color-accent)] text-[var(--color-accent)] font-bold"
                        : isOpen
                        ? "border-transparent text-[var(--color-text-primary)] bg-[var(--color-bg)]"
                        : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)]/60"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base flex-shrink-0 opacity-80">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    <span className="material-symbols-outlined text-xs text-[var(--color-text-secondary)]">
                      {isOpen ? "expand_less" : "expand_more"}
                    </span>
                  </button>

                  {/* Sub-Menu Dropdown Panel */}
                  {isOpen && (
                    <div className="absolute left-0 top-full mt-1 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg py-1.5 z-50 animate-fadeIn">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm text-[var(--color-text-secondary)]">
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

          {/* Right Action Utilities: Search, Theme Toggle & Sign Out */}
          <div className="flex items-center gap-2">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs transition-all cursor-pointer"
              title="Search orders, catalog or B2B partners (⌘K)"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              <span className="hidden md:inline text-[11px]">Search</span>
              <kbd className="px-1 py-0.2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[9px] font-mono text-[var(--color-text-secondary)]">
                ⌘K
              </kbd>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded flex items-center justify-center text-[var(--color-brand-mark)] hover:bg-[var(--color-bg)] border border-[var(--color-border)] transition-all cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className="material-symbols-outlined text-lg">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {/* EN / TR Language Switcher Button with Flags */}
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "tr" : "en")}
              className="px-2.5 py-1 h-8 rounded text-xs font-mono font-bold uppercase tracking-wider bg-[var(--color-bg)] text-[var(--color-accent)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              title={language === "en" ? "Türkçe diline geç" : "Switch to English"}
              aria-label="Toggle UI Language"
            >
              {language === "tr" ? (
                <>
                  <span>EN</span>
                  <span className="text-base leading-none">🇺🇸</span>
                </>
              ) : (
                <>
                  <span>TR</span>
                  <span className="text-base leading-none">🇹🇷</span>
                </>
              )}
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={signOut}
              className="w-8 h-8 rounded flex items-center justify-center text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
              title="Sign Out of Console"
              aria-label="Sign Out of Console"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-8 h-8 rounded flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-lg">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 space-y-3 animate-fadeIn">
            {/* Command Palette Trigger Mobile */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsPaletteOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[var(--color-text-secondary)]">search</span>
                <span>Search console...</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[10px] font-mono text-[var(--color-text-secondary)]">⌘K</kbd>
            </button>

            {/* Mobile Links */}
            <div className="space-y-2">
              {navItems.map((item) => (
                <div key={item.href} className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] flex items-center gap-2 py-1">
                    <span className="material-symbols-outlined text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <div className="pl-5 space-y-1">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-1 px-2 rounded text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)]"
                      >
                        <span className="material-symbols-outlined text-xs">{sub.icon}</span>
                        <span>{sub.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
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
        onOpen={() => setIsPaletteOpen(true)}
        onOpenChange={setIsPaletteOpen}
      />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLanguageProvider>
        <AdminChrome>{children}</AdminChrome>
      </AdminLanguageProvider>
    </AdminAuthProvider>
  );
}
