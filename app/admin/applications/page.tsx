"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function AdminApplicationsPage() {
  const { isAuthenticated, setAuthenticated } = useAdminAuth();
  const [applications, setApplications] = useState<B2bApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ALL");

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
      <main className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 max-w-md w-full text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#1A2233] mb-2">Admin Access Required</h1>
          <p className="text-sm text-[#5B6B85] mb-6">
            Please authenticate via the Corporate Access Gate at /admin to manage B2B partner applications.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center min-h-[44px] bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded transition-colors"
          >
            Go to Admin Login →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1A2233] py-10 px-4 md:px-8 font-sans">
        <div className="w-full max-w-container-max mx-auto space-y-6">
          {/* Top Bar Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D1D5DB]">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-semibold text-[#1A2233]">
                  Portal Console
                </h1>
                <span className="bg-[#E6F1FB] text-[#185FA5] text-[10px] uppercase font-semibold px-2.5 py-1 rounded border border-[#B3D6F6]">
                  B2B Applications Review
                </span>
              </div>
              <p className="text-xs text-[#5B6B85] mt-1">
                Evaluate corporate manufacturing partner applications, verify company credentials &amp; assign partnership status.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchApplications}
              aria-label="Refresh applications ledger"
              title="Refresh applications ledger"
              className="w-10 h-10 bg-white border border-[#D1D5DB] hover:bg-[#F5F7FA] text-[#1A2233] rounded flex items-center justify-center transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
            </button>
          </div>

          {/* Status Filter Tabs (44px min touch target) */}
          <div className="flex flex-wrap gap-2 border-b border-[#D1D5DB] pb-3">
            {APPLICATION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#2E5AAC] text-white font-semibold shadow-sm"
                    : "bg-white text-[#5B6B85] border border-[#D1D5DB] hover:bg-[#F5F7FA] hover:text-[#1A2233]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Table Content */}
          {loading ? (
            <div className="bg-white border border-[#D1D5DB] rounded-lg p-12 text-center text-sm text-[#5B6B85] shadow-sm">
              <span className="inline-block w-5 h-5 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading B2B partner applications...</p>
            </div>
          ) : error ? (
            <div className="bg-white border border-[#F8B4B4] rounded-lg p-6 text-center text-sm text-[#C5221F]">
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
