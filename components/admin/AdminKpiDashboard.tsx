"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardMetrics } from "@/components/admin/DashboardMetrics";
import type { DashboardMetricsData } from "@/lib/adminMetrics";

export function AdminKpiDashboard({ isAuthenticated = true }: { isAuthenticated?: boolean }) {
  const [metrics, setMetrics] = useState<DashboardMetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchMetrics() {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.status === 401) {
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load operational metrics.");
      }
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (err) {
      console.error(err);
      setError("Could not load real-time analytics summary.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white border border-[#EAECF0] rounded-md p-6 mb-6 font-sans shadow-none">
        <div className="flex items-center gap-3 text-xs text-[#475467]">
          <span className="w-4 h-4 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin" />
          <span>Calculating operational telemetry and pending actions...</span>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-white border border-[#FDA29B] rounded-md p-4 mb-6 font-sans flex items-center justify-between text-xs text-[#F04438] shadow-none">
        <span>{error || "Failed to load dashboard metrics."}</span>
        <button
          type="button"
          onClick={fetchMetrics}
          className="underline font-semibold hover:text-[#B42318] cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans mb-6 select-none">
      {/* Top 4-KPI Grid Cards & Recharts Bar Chart Widget */}
      <DashboardMetrics data={metrics} onRefresh={fetchMetrics} />

      {/* Dense Scannable Table: 5 Most Recent Pending Actions */}
      <div className="bg-white border border-[#EAECF0] rounded-md shadow-none overflow-hidden">
        <div className="p-4 border-b border-[#EAECF0] flex items-center justify-between bg-[#F9FAFB]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111318] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F04438] animate-pulse" />
              Recent Pending Actions
            </h3>
            <p className="text-[11px] text-[#475467] mt-0.5">
              5 most recent items requiring executive admin review and approval.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchMetrics}
            className="text-xs font-semibold text-[#2E5AAC] hover:text-[#1E3F7A] inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh</span>
          </button>
        </div>

        {metrics.pendingActions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#667085]">
            <span className="material-symbols-outlined text-2xl text-[#12B76A] mb-1 block">
              task_alt
            </span>
            <span>No pending admin actions. All specs and applications are up to date.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#EAECF0] text-[11px] font-semibold text-[#475467] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Item &amp; Type</th>
                  <th className="py-2.5 px-4">Corporate Client</th>
                  <th className="py-2.5 px-4">Action Needed</th>
                  <th className="py-2.5 px-4 text-right">Value</th>
                  <th className="py-2.5 px-4">Submitted Date</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0] text-[#111318]">
                {metrics.pendingActions.map((action) => (
                  <tr key={action.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${
                            action.type === "ORDER"
                              ? "bg-[#FEF0C7] text-[#DC6803] border-[#FDE272]"
                              : "bg-[#E6F1FB] text-[#185FA5] border-[#B3D6F6]"
                          }`}
                        >
                          {action.type}
                        </span>
                        <span className="font-semibold text-[#111318]">{action.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-[#111318]">{action.client}</div>
                        <div className="text-[11px] text-[#667085] font-mono">{action.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#344054] font-medium">{action.actionNeeded}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#111318] tabular-nums">
                      {action.amountCents !== null
                        ? (action.amountCents / 100).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-[#667085] font-mono text-[11px] tabular-nums">
                      {new Date(action.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={action.link}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E5AAC] hover:text-[#1E3F7A] hover:underline"
                      >
                        <span>Review</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

