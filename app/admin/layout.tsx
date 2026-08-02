"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/AdminAuthContext";

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

function getPageName(pathname: string): string {
  if (pathname.startsWith("/admin/wholesale")) return "Wholesale Manager";
  if (pathname.startsWith("/admin/product-settings")) return "Product Settings";
  if (pathname.startsWith("/admin/applications")) return "B2B Applications";
  if (pathname.startsWith("/admin/architecture-viz")) return "3D Telemetry";
  return "Order Ledger";
}

function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const { isAuthenticated, signOut } = useAdminAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Login gate / session-loading states render full-bleed, no chrome.
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] font-sans">
      {/* Sidebar */}
      <nav
        aria-label="Admin navigation"
        className={`flex-shrink-0 bg-[#111318] flex flex-col justify-between p-3 transition-all duration-300 select-none overflow-y-auto ${
          isExpanded ? "w-64" : "w-16"
        }`}
      >
        <div className="space-y-4">
          {/* Header & Toggle Button */}
          <div
            className={`flex items-center min-h-[36px] px-1 ${
              isExpanded ? "justify-between" : "justify-center"
            }`}
          >
            {isExpanded && (
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Navigation Menu
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8B93A7] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <span className="material-symbols-outlined text-lg">
                {isExpanded ? "chevron_left" : "chevron_right"}
              </span>
            </button>
          </div>

          {/* Navigation Items with Accordion Sub-headings */}
          <div className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              const isOpen = isExpanded && (openSections[item.href] ?? active);

              return (
                <div key={item.href} className="space-y-1">
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      title={item.label}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        active
                          ? "bg-[#2E5AAC] text-white shadow-xs"
                          : "text-[#8B93A7] hover:text-white hover:bg-white/10"
                      } ${
                        isExpanded ? "px-3 w-full" : "justify-center px-0 w-10 h-10 mx-auto"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl flex-shrink-0">
                        {item.icon}
                      </span>
                      {isExpanded && <span className="truncate flex-1">{item.label}</span>}
                      {isExpanded && item.subItems.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenSections((prev) => ({
                              ...prev,
                              [item.href]: !(prev[item.href] ?? active),
                            }));
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">
                            {isOpen ? "expand_more" : "chevron_right"}
                          </span>
                        </button>
                      )}
                    </Link>
                  </div>

                  {/* Sub-headings under active/toggled section */}
                  {isOpen && item.subItems.length > 0 && (
                    <div className="pl-7 pr-2 space-y-1 py-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                            active
                              ? "text-[#BFDBFE] hover:text-white hover:bg-white/10"
                              : "text-[#64748B] hover:text-[#94A3B8] hover:bg-white/5"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm flex-shrink-0 text-white/40">
                            {sub.icon}
                          </span>
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: Search & Sign Out */}
        <div className="pt-4 border-t border-white/10 space-y-2 mt-4">
          {/* Quick Search trigger */}
          <div
            className={`flex items-center gap-2.5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-[#8B93A7] hover:bg-white/10 transition-all cursor-pointer select-none ${
              isExpanded ? "px-3 w-full justify-between" : "justify-center px-0 w-10 h-10 mx-auto"
            }`}
            title="Search... (⌘K)"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#8B93A7]">search</span>
              {isExpanded && <span>Search...</span>}
            </div>
            {isExpanded && (
              <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] font-mono text-[#8B93A7]">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={signOut}
            className={`flex items-center gap-2.5 py-2 rounded-lg text-xs font-semibold text-[#F87171] hover:bg-[#F87171]/15 hover:text-[#EF4444] transition-all cursor-pointer ${
              isExpanded ? "px-3 w-full" : "justify-center px-0 w-10 h-10 mx-auto"
            }`}
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            {isExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
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
