"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { AdminKpiDashboard } from "@/components/admin/AdminKpiDashboard";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

function AdminDashboardContent() {
  const { isAuthenticated, setAuthenticated } = useAdminAuth();
  const { t } = useAdminLanguage();
  const [accessKey, setAccessKey] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

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
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 font-sans text-xs text-[var(--color-text-secondary)]">
        <span className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mr-2" />
        <span>Authenticating corporate session...</span>
      </div>
    );
  }

  // Unauthenticated Corporate Login Guard
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex items-center justify-center p-4 font-sans transition-colors">
        <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none shadow-xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-accent)]/10 text-[var(--color-accent)] mb-2">
                <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                {t.executiveConsoleTitle}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {t.executiveConsoleSub}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="accessKey"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5"
                >
                  {t.corporateAccessKey} *
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
                    placeholder={t.enterSecurityKey}
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
                className="w-full py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-colors shadow-sm cursor-pointer"
              >
                {t.authenticateBtn}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[var(--color-border)] text-center text-[11px] text-[var(--color-text-secondary)]">
              {t.secNotice}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Dedicated Executive Operations Dashboard Page
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] py-8 px-4 md:px-8 font-sans transition-colors">
      <div className="w-full max-w-container-max mx-auto space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {t.dashboardTitle}
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {t.dashboardSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="min-h-[36px] px-3.5 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white border border-[var(--color-accent)] text-xs font-semibold rounded-none flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>{t.openOrderLedger} →</span>
            </Link>
          </div>
        </div>

        {/* Admin KPI Overview & Analytics Widget */}
        <AdminKpiDashboard isAuthenticated={isAuthenticated} />

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <Link
            href="/admin/orders"
            className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group rounded-none"
          >
            <div className="w-10 h-10 bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
              Order Ledger
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              View and manage all active B2B orders, issue proformas, and set statuses.
            </p>
          </Link>

          <Link
            href="/admin/wholesale"
            className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group rounded-none"
          >
            <div className="w-10 h-10 bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-xl">storefront</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
              Wholesale Management
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Suppliers, category inventory, wholesale price matrix, and offer inbox.
            </p>
          </Link>

          <Link
            href="/admin/applications"
            className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group rounded-none"
          >
            <div className="w-10 h-10 bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-xl">assignment_ind</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
              B2B Applications
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Review company verification requests and issue magic link authorizations.
            </p>
          </Link>

          <Link
            href="/admin/product-settings"
            className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group rounded-none"
          >
            <div className="w-10 h-10 bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
              Garment &amp; Fabric Settings
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Configure categories, subcategories, size matrices, and fabric price tiers.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[var(--color-text-secondary)]">Loading executive dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
