"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { label: "MANUFACTURING", href: "/konfigurator" },
  { label: "COLLECTIONS", href: "/categories" },
  { label: "SOURCING", href: "/legal/supply-terms" },
  { label: "WHOLESALE", href: "/wholesale" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
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

  return (
    <header className="bg-[#0B1E3D] text-[#E8ECF3] border-b border-[#132A52] sticky top-0 z-50 w-full shadow-sm">
      <div className="flex justify-between items-center w-full px-3 md:px-8 py-3 max-w-container-max mx-auto">
        {/* Official Brand Logo Image */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-95 transition-opacity"
        >
          <img
            src="/Satrinao.png"
            alt="Satriano Atelier"
            className="h-9 md:h-[50px] w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation Items */}
        <nav className="hidden md:flex gap-8 items-center text-xs font-semibold tracking-wider uppercase">
          {MENU_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative py-1 transition-colors ${
                  isActive
                    ? "text-[#E8ECF3] border-b-2 border-[#DBB671]"
                    : "text-[#8DA0C4] hover:text-[#E8ECF3]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Primary Action & Mobile Menu Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Site-Wide Dark/Light Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#E8ECF3] bg-[#132A52] hover:bg-[#1A386D] border border-[#1F3A6B] rounded-none transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <Link
            href="/portal"
            className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-[11px] sm:text-xs uppercase font-semibold tracking-wider px-3 sm:px-5 py-2.5 rounded-none transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
          >
            <span className="material-symbols-outlined text-base">account_circle</span>
            <span>Client Portal</span>
          </Link>

          {/* Accessible Mobile Nav Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="md:hidden inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#E8ECF3] bg-[#132A52] hover:bg-[#1A386D] border border-[#1F3A6B] rounded-none transition-colors"
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
        <nav className="md:hidden bg-[#081733] border-t border-[#132A52] px-4 py-3 space-y-2">
          {MENU_ITEMS.map((item) => {
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
                    ? "bg-[#132A52] text-[#DBB671]"
                    : "text-[#8DA0C4] hover:text-[#E8ECF3] hover:bg-[#132A52]/50"
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
