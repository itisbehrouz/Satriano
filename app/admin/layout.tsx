"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/AdminAuthContext";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Order Ledger",
    icon: "orders",
    isActive: (pathname: string) => pathname === "/admin",
  },
  {
    href: "/admin/applications",
    label: "B2B Applications",
    icon: "assignment_ind",
    isActive: (pathname: string) => pathname.startsWith("/admin/applications"),
  },
  {
    href: "/admin/product-settings",
    label: "Product Settings",
    icon: "inventory_2",
    isActive: (pathname: string) => pathname.startsWith("/admin/product-settings"),
  },
];

function getPageName(pathname: string): string {
  if (pathname.startsWith("/admin/product-settings")) return "Product Settings";
  if (pathname.startsWith("/admin/applications")) return "B2B Applications";
  return "Order Ledger";
}

function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const { isAuthenticated, signOut } = useAdminAuth();

  // Login gate / session-loading states render full-bleed, no chrome.
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] font-sans">
      {/* Sidebar */}
      <nav
        aria-label="Admin navigation"
        className="w-16 flex-shrink-0 bg-[#111318] flex flex-col items-center py-4 gap-2"
      >
        <Link href="/" title="Return to Homepage" className="mb-4 opacity-90 hover:opacity-100">
          <img src="/Satrinao.png" alt="Satriano Atelier" className="h-6 w-auto object-contain" />
        </Link>

        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`w-11 h-11 rounded flex items-center justify-center transition-colors ${
                active
                  ? "bg-[#2E5AAC] text-white"
                  : "text-[#8B93A7] hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-[#E4E7EC] bg-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#5B6B85]">
            Admin Console
            <span className="text-[#D1D5DB] mx-1.5">/</span>
            <span className="text-[#1A2233]">{getPageName(pathname)}</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded text-xs text-[#8B93A7] select-none"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span>Search...</span>
              <span className="font-mono text-[10px] border border-[#D1D5DB] rounded px-1 py-0.5">
                &#8984;K
              </span>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="min-h-[36px] px-3 py-1.5 bg-white border border-[#D1D5DB] hover:bg-[#FCE8E6] hover:text-[#C5221F] text-xs font-semibold text-[#5B6B85] rounded flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
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
