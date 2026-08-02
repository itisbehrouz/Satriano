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
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex items-center justify-center font-sans transition-colors">
        <div className="text-center text-xs text-[var(--color-text-secondary)]">
          <span className="inline-block w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-2" />
          <p>Verifying Portal Console session...</p>
        </div>
      </div>
    );
  }

  // Render Minimal Focused Login Gate if unauthenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] py-12 px-4 md:px-8 flex flex-col justify-center items-center font-sans relative transition-colors">
        {/* Fixed Top-Left Return Link */}
        <Link
          href="/"
          className="fixed top-6 left-6 inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none shadow-sm transition-colors z-50"
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

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-8 shadow-sm transition-colors">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[var(--color-accent)] text-white rounded-none flex items-center justify-center mx-auto mb-3 shadow-sm">
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              </div>
              <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
                Portal Console Access
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                Authorized personnel access to order management &amp; factory status ledgers.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="accessKey"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5"
                >
                  Corporate Access Key *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[var(--color-text-secondary)] text-lg">
                    key
                  </span>
                  <input
                    id="accessKey"
                    type="password"
                    required
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="Enter security key..."
                    className="w-full pl-10 pr-3 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-none text-xs text-red-500">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-colors shadow-sm"
              >
                Authenticate &amp; Unlock Console
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[var(--color-border)] text-center text-[11px] text-[var(--color-text-secondary)]">
              Internal security audit logged. Unauthorized access attempts are monitored.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Render Full Admin Operations Console
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] py-8 px-4 md:px-8 font-sans transition-colors">
      <div className="w-full max-w-container-max mx-auto space-y-6">
        {/* Admin KPI Overview & Analytics Widget */}
        <AdminKpiDashboard isAuthenticated={isAuthenticated} />

        {/* Filter Tabs & Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-none transition-all cursor-pointer select-none ${
                  activeTab === tab.id
                    ? "bg-[var(--color-accent)] text-white font-semibold"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/admin/architecture-viz"
              className="min-h-[36px] px-3.5 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-bg)] text-[var(--color-accent)] border border-[var(--color-border)] text-xs font-semibold rounded-none flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">view_in_ar</span>
              <span>3D Telemetry</span>
            </Link>
            <button
              type="button"
              onClick={fetchOrders}
              className="min-h-[36px] px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-primary)] rounded-none flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Main Table Content */}
        {loading ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-12 text-center text-xs text-[var(--color-text-secondary)]">
            <span className="inline-block w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading production orders ledger...</p>
          </div>
        ) : error ? (
          <div className="bg-[var(--color-surface)] border border-red-500/30 rounded-none p-6 text-center text-xs text-red-500">
            <p className="font-semibold mb-1">Ledger Error</p>
            <p className="text-xs">{error}</p>
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none overflow-hidden transition-colors">
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
    <Suspense fallback={<div className="p-8 text-xs text-[var(--color-text-secondary)]">Loading order ledger...</div>}>
      <AdminOrderContent />
    </Suspense>
  );
}
