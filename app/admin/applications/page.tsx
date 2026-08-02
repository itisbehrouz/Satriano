"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AdminApplicationsTable,
  B2bApplicationItem,
} from "@/components/admin/AdminApplicationsTable";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

const APPLICATION_TABS = [
  { id: "ALL", label: "All Applications" },
  { id: "SUBMITTED", label: "Submitted (New)" },
  { id: "UNDER_REVIEW", label: "Under Review" },
  { id: "APPROVED", label: "Approved Partners" },
  { id: "REJECTED", label: "Rejected" },
];

function ApplicationsContent() {
  const { isAuthenticated, setAuthenticated } = useAdminAuth();
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get("status") || "ALL";

  const [applications, setApplications] = useState<B2bApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(statusParam);

  useEffect(() => {
    if (statusParam) {
      setActiveTab(statusParam);
    }
  }, [statusParam]);

  async function fetchApplications() {
    setLoading(true);
    setError(null);
    try {
      const url =
        activeTab && activeTab !== "ALL"
          ? `/api/applications?status=${encodeURIComponent(activeTab)}`
          : "/api/applications";

      const res = await fetch(url);
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch B2B partner applications.");
      }

      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load B2B applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated, activeTab]);

  if (isAuthenticated === false) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex items-center justify-center p-4 font-sans transition-colors">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-8 max-w-md w-full text-center shadow-sm">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Admin Access Required</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Please authenticate via the Corporate Access Gate at /admin to manage B2B partner applications.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center min-h-[44px] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-none transition-colors"
          >
            Go to Admin Login →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] py-10 px-4 md:px-8 font-sans transition-colors">
        <div className="w-full max-w-container-max mx-auto space-y-6">
          {/* Status Filter Tabs & Action Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
            <div className="flex flex-wrap gap-2">
              {APPLICATION_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[38px] px-3.5 py-1.5 text-xs font-medium rounded-none transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[var(--color-accent)] text-white font-semibold"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchApplications}
              aria-label="Refresh applications ledger"
              title="Refresh applications ledger"
              className="min-h-[38px] px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-primary)] rounded-none flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>Refresh Applications</span>
            </button>
          </div>

          {/* Main Table Content */}
          {loading ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-12 text-center text-sm text-[var(--color-text-secondary)] shadow-sm">
              <span className="inline-block w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading B2B partner applications...</p>
            </div>
          ) : error ? (
            <div className="bg-[var(--color-surface)] border border-red-500/30 rounded-none p-6 text-center text-sm text-red-500">
              <p className="font-semibold mb-1">Applications Error</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : (
            <AdminApplicationsTable
              applications={applications}
              onStatusChange={fetchApplications}
            />
          )}
        </div>
      </main>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[var(--color-text-secondary)]">Loading applications...</div>}>
      <ApplicationsContent />
    </Suspense>
  );
}
