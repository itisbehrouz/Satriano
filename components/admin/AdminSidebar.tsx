"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import dynamic from "next/dynamic";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

const GlobalCommandPalette = dynamic(
  () => import("@/components/admin/GlobalCommandPalette").then((mod) => mod.GlobalCommandPalette),
  { ssr: false }
);

interface AdminSidebarProps {
  onSearchClick?: () => void;
}

export function AdminSidebar({ onSearchClick }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useAdminLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const handleOpenSearch = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      setIsPaletteOpen(true);
    }
  };

  // Global Cmd+K / Ctrl+K keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleOpenSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearchClick]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = [
    {
      label: t.orderLedger,
      href: "/admin",
      icon: "receipt_long",
      badge: "M2O",
    },
    {
      label: t.wholesale,
      href: "/admin/wholesale",
      icon: "storefront",
      badge: "B2B",
    },
    {
      label: t.b2bPartners,
      href: "/admin/applications",
      icon: "assignment_ind",
      badge: null,
    },
    {
      label: t.catalogFits,
      href: "/admin/product-settings",
      icon: "inventory_2",
      badge: null,
    },
    {
      label: t.telemetry,
      href: "/admin/architecture-viz",
      icon: "view_in_ar",
      badge: "LIVE",
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#0B1E3D] text-white border-r border-[#1E3A8A] transition-all duration-300 flex flex-col justify-between z-40 select-none ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Header Section */}
      <div className="space-y-4 p-3">
        {/* Brand Header & Collapse Toggle */}
        <div className={`flex items-center min-h-[40px] px-1 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <div className="leading-tight">
              <span className="text-xs font-bold uppercase tracking-wider block text-white">
                {t.consoleTitle}
              </span>
              <span className="text-[10px] text-[#93C5FD] font-mono block">
                {t.m2oSubTitle}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[#94A3B8] hover:text-white p-1 rounded hover:bg-[#1E3A8A]/50 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="material-symbols-outlined text-lg">
              {isCollapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        {/* Command Palette Trigger (Cmd+K) */}
        {!isCollapsed ? (
          <button
            type="button"
            onClick={handleOpenSearch}
            className="w-full bg-[#172A4D] hover:bg-[#1E3A8A] text-[#94A3B8] hover:text-white border border-[#1E3A8A] rounded px-3 py-2 text-xs flex items-center justify-between transition-colors group cursor-pointer"
            title={t.searchTooltip}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#60A5FA]">
                search
              </span>
              <span className="text-xs">{t.searchPlaceholder}</span>
            </div>
            <kbd className="bg-[#0B1E3D] text-[#93C5FD] border border-[#1E3A8A] px-1.5 py-0.5 rounded text-[10px] font-mono group-hover:border-[#60A5FA]/50">
              ⌘K
            </kbd>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenSearch}
            className="w-10 h-10 mx-auto bg-[#172A4D] hover:bg-[#1E3A8A] text-[#60A5FA] border border-[#1E3A8A] rounded flex items-center justify-center transition-colors cursor-pointer"
            title="Quick Search (Cmd+K)"
            aria-label="Quick Search (Cmd+K)"
          >
            <span className="material-symbols-outlined text-lg">search</span>
          </button>
        )}

        {/* Navigation Toolbar */}
        <nav className="space-y-1 pt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#2E5AAC] text-white shadow-xs"
                    : "text-[#94A3B8] hover:bg-[#172A4D] hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-lg ${isActive ? "text-white" : "text-[#60A5FA]"}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="bg-[#172A4D] text-[#93C5FD] text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border border-[#1E3A8A]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section — Collapsed Icon-Only Sign-Out Action */}
      <div className="p-3 border-t border-[#1E3A8A] bg-[#071326]/60">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#172A4D] text-[#60A5FA] border border-[#1E3A8A] flex items-center justify-center text-xs font-bold">
                A
              </div>
              <div className="truncate leading-tight">
                <span className="text-xs font-semibold text-white block truncate">
                  Admin User
                </span>
                <span className="text-[10px] text-[#94A3B8] block truncate">
                  admin@satriano.com
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Sign out of Admin Console"
              title="Sign out of Admin Console"
              className="w-8 h-8 flex items-center justify-center text-[#F87171] hover:bg-[#A32D2D]/20 hover:text-white rounded border border-transparent hover:border-[#F87171]/30 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Sign out of Admin Console"
            title="Sign out of Admin Console"
            className="w-10 h-10 mx-auto flex items-center justify-center text-[#F87171] hover:bg-[#A32D2D]/20 hover:text-white rounded border border-[#1E3A8A] hover:border-[#F87171]/40 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        )}
      </div>

      <GlobalCommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
    </aside>
  );
}
