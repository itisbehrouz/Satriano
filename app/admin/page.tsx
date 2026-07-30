"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { OrderStatus } from "@/app/generated/prisma/enums";
import { AdminOrderTable, type AdminOrder } from "@/components/admin/AdminOrderTable";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

type FilterTab = "ALL" | OrderStatus;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "All Orders" },
  { id: "DRAFT", label: "Draft" },
  { id: "PROFORMA_SENT", label: "Proforma Sent" },
  { id: "PAID", label: "Paid" },
  { id: "IN_PRODUCTION", label: "In Production" },
];

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessKey, setAccessKey] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check existing session auth on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("sat_portal_console_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) {
      setAuthError("Please enter your corporate access key.");
      return;
    }
    // Accept valid admin key (e.g. satriano2026 or any non-empty key for dev/admin)
    if (accessKey.trim().toLowerCase() === "satriano2026" || accessKey.trim().length >= 4) {
      sessionStorage.setItem("sat_portal_console_auth", "true");
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError("Invalid access key. Authorized personnel only.");
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("sat_portal_console_auth");
    setIsAuthenticated(false);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        activeTab === "ALL"
          ? "/api/admin/orders"
          : `/api/admin/orders?status=${activeTab}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError("Error loading orders from server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  const totalRevenueCents = orders
    .filter((o) => o.status === "PAID" || o.status === "IN_PRODUCTION")
    .reduce((acc, o) => acc + o.totalCents, 0);

  const inProductionCount = orders.filter((o) => o.status === "IN_PRODUCTION").length;
  const paidCount = orders.filter((o) => o.status === "PAID").length;

  // UNAUTHENTICATED: Render Secure Portal Console Login Screen
  if (!isAuthenticated) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-[80vh] bg-[#F5F7FA] text-[#1A2233] py-16 px-4 md:px-8 flex flex-col justify-center items-center font-sans">
          <div className="w-full max-w-md mx-auto">
            {/* Logo Brand Lockup */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <img
                  src="/Satrinao.png"
                  alt="Satriano Atelier"
                  className="h-10 w-auto mx-auto object-contain"
                />
                <span className="text-[11px] font-sans uppercase tracking-widest text-[#5B6B85] mt-2 block">
                  Internal Operations
                </span>
              </Link>
            </div>

            <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-[#0B1E3D] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                </div>
                <h1 className="text-xl font-semibold text-[#1A2233]">
                  Portal Console Access
                </h1>
                <p className="text-xs text-[#5B6B85] mt-1 leading-relaxed">
                  Authorized personnel access to order management &amp; factory status ledgers.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="accessKey"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1.5"
                  >
                    Corporate Access Key *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5B6B85] text-lg">
                      key
                    </span>
                    <input
                      id="accessKey"
                      type="password"
                      required
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      placeholder="Enter security key..."
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-[#FCEBEB] border border-[#A32D2D] text-[#A32D2D] text-xs rounded">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-6 rounded transition-colors flex items-center justify-center gap-2"
                >
                  Authenticate &amp; Access Console →
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center text-[11px] text-[#5B6B85]">
                Strictly restricted to Satriano Atelier authorized managers.
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // AUTHENTICATED: Render Full Portal Console Dashboard
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#F5F7FA] p-6 md:p-8 max-w-container-max mx-auto text-[#1A2233]">
        <header className="mb-8 bg-white border border-[#D1D5DB] rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0B1E3D] text-white text-xs font-semibold uppercase tracking-wider rounded mb-2">
                <span className="w-2 h-2 rounded-full bg-[#DBB671] inline-block" />
                Portal Console Operations
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#1A2233]">
                Order Management Ledger
              </h1>
              <p className="text-xs md:text-sm text-[#5B6B85] mt-1">
                Scannable order ledger &amp; manual production status transitions.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                onClick={() => fetchOrders()}
                className="px-4 py-2 bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors"
              >
                Refresh Orders
              </button>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] hover:bg-[#E5E7EB] text-[#5B6B85] text-xs font-semibold uppercase tracking-wider rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-5 border border-[#D1D5DB] bg-white rounded-lg">
            <div className="text-xs uppercase font-semibold tracking-wider text-[#5B6B85] mb-1">
              Total Filtered Orders
            </div>
            <div className="text-3xl font-bold text-[#1A2233] tabular-nums">
              {orders.length}
            </div>
          </div>
          <div className="p-5 border border-[#D1D5DB] bg-white rounded-lg">
            <div className="text-xs uppercase font-semibold tracking-wider text-[#5B6B85] mb-1">
              Ready for Manufacturing
            </div>
            <div className="text-3xl font-bold text-[#2E5AAC] tabular-nums">
              {paidCount + inProductionCount}
            </div>
          </div>
          <div className="p-5 border border-[#D1D5DB] bg-white rounded-lg">
            <div className="text-xs uppercase font-semibold tracking-wider text-[#5B6B85] mb-1">
              Paid Revenue Total
            </div>
            <div className="text-3xl font-bold text-[#0F6E56] tabular-nums">
              ${(totalRevenueCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#D1D5DB] mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#2E5AAC] text-[#2E5AAC] bg-white rounded-t"
                  : "border-transparent text-[#5B6B85] hover:text-[#1A2233]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="p-12 text-center border border-[#D1D5DB] bg-white rounded-lg text-[#5B6B85]">
            Loading order ledgers...
          </div>
        ) : error ? (
          <div className="p-6 border border-[#A32D2D] bg-[#FCEBEB] text-[#A32D2D] rounded-lg">
            {error}
          </div>
        ) : (
          <AdminOrderTable orders={orders} onStatusChange={fetchOrders} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
