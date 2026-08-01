"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminOrderTable, AdminOrder } from "@/components/admin/AdminOrderTable";
import { AdminKpiDashboard } from "@/components/admin/AdminKpiDashboard";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

const TABS = [
  { id: "ALL", label: "All Orders" },
  { id: "PENDING_REVIEW", label: "Pending Review" },
  { id: "PROFORMA_SENT", label: "Proforma Sent" },
  { id: "PAID", label: "Paid / Confirmed" },
  { id: "IN_PRODUCTION", label: "In Production" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "CANCELLED", label: "Cancelled" },
];

function AdminOrderContent() {
  const { isAuthenticated, setAuthenticated } = useAdminAuth();
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get("status") || "ALL";

  const [accessKey, setAccessKey] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(statusParam);

  useEffect(() => {
    if (statusParam) {
      setActiveTab(statusParam);
    }
  }, [statusParam]);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const url =
        activeTab && activeTab !== "ALL"
          ? `/api/admin/orders?status=${encodeURIComponent(activeTab)}`
          : "/api/admin/orders";
      const res = await fetch(url);

      if (res.status === 401) {
        setAuthenticated(false);
        setAuthError("Session expired. Please authenticate with your Corporate Access Key.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch production orders.");
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load production orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch orders when authenticated or active tab changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, activeTab]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Authentication failed.");
      }

      setAuthenticated(true);
      setAccessKey("");
    } catch (err: any) {
      setAuthError(err.message || "Invalid Corporate Access Key.");
    }
  }

  // Loading state while checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-sans">
        <div className="text-center text-xs text-[#5B6B85]">
          <span className="inline-block w-5 h-5 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
          <p>Verifying Portal Console session...</p>
        </div>
      </div>
    );
  }

  // Render Minimal Focused Login Gate if unauthenticated (No SiteHeader/SiteFooter, Fixed Return Icon, Centered Logo)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#F5F7FA] text-[#1A2233] py-12 px-4 md:px-8 flex flex-col justify-center items-center font-sans relative">
        {/* Fixed Top-Left Return Link */}
        <Link
          href="/"
          className="fixed top-6 left-6 inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#5B6B85] hover:text-[#1A2233] bg-white border border-[#D1D5DB] rounded shadow-sm transition-colors z-50"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Return to Homepage</span>
        </Link>

        <div className="w-full max-w-md mx-auto my-auto">
          {/* Centered Brand Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <img
                src="/Satrinao.png"
                alt="Satriano Atelier"
                className="h-10 w-auto mx-auto object-contain"
              />
            </Link>
          </div>

          <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#0B1E3D] text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
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
                <div className="p-3 bg-[#FCE8E6] border border-[#F8B4B4] rounded text-xs text-[#C5221F]">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm"
              >
                Authenticate &amp; Unlock Console
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center text-[11px] text-[#5B6B85]">
              Internal security audit logged. Unauthorized access attempts are monitored.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Render Full Admin Operations Console
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] py-8 px-4 md:px-8 font-sans">
      <div className="w-full max-w-container-max mx-auto space-y-6">
        {/* Admin KPI Overview & Analytics Widget */}
        <AdminKpiDashboard />

        {/* Filter Tabs & Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAECF0] pb-4">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer select-none ${
                  activeTab === tab.id
                    ? "bg-[#2E5AAC] text-white font-semibold shadow-none"
                    : "bg-white text-[#475467] border border-[#EAECF0] hover:bg-[#F9FAFB] hover:text-[#111318]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/admin/architecture-viz"
              className="min-h-[36px] px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all shadow-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">view_in_ar</span>
              <span>3D Telemetry</span>
            </Link>
            <button
              type="button"
              onClick={fetchOrders}
              className="min-h-[36px] px-3.5 py-1.5 bg-white border border-[#EAECF0] hover:bg-[#F9FAFB] text-xs font-semibold text-[#111318] rounded-md flex items-center gap-1.5 transition-all shadow-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Main Table Content */}
        {loading ? (
          <div className="bg-white border border-[#EAECF0] rounded-md p-12 text-center text-xs text-[#475467] shadow-none">
            <span className="inline-block w-5 h-5 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading production orders ledger...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-[#FDA29B] rounded-md p-6 text-center text-xs text-[#F04438] shadow-none">
            <p className="font-semibold mb-1">Ledger Error</p>
            <p className="text-xs">{error}</p>
          </div>
        ) : (
          <div className="bg-white border border-[#EAECF0] rounded-md shadow-none overflow-hidden">
            <AdminOrderTable
              orders={orders}
              onStatusChange={fetchOrders}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#5B6B85]">Loading order ledger...</div>}>
      <AdminOrderContent />
    </Suspense>
  );
}
