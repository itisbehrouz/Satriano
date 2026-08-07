"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { DashboardMetricsData } from "@/lib/adminMetrics";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

const DashboardMetrics = dynamic(
  () => import("@/components/admin/DashboardMetrics").then((mod) => mod.DashboardMetrics),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none" />
    ),
  }
);

export function AdminKpiDashboard({ isAuthenticated = true }: { isAuthenticated?: boolean }) {
  const { t } = useAdminLanguage();
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
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 mb-6 font-sans transition-colors">
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
          <span className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <span>Calculating operational telemetry and pending actions...</span>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-[var(--color-surface)] border border-red-500/30 rounded-none p-4 mb-6 font-sans flex items-center justify-between text-xs text-red-500 transition-colors">
        <span>{error || "Failed to load dashboard metrics."}</span>
        <button
          type="button"
          onClick={fetchMetrics}
          className="underline font-semibold hover:opacity-80 cursor-pointer"
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
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none overflow-hidden transition-colors">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {t.recentPendingActions}
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              {t.recentPendingActionsSub}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchMetrics}
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>{t.refresh}</span>
          </button>
        </div>

        {metrics.pendingActions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
            <span className="material-symbols-outlined text-2xl text-[var(--color-status-success)] mb-1 block">
              task_alt
            </span>
            <span>{t.noPendingActions}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  <th className="py-2.5 px-4">{t.itemType}</th>
                  <th className="py-2.5 px-4">{t.corporateClient}</th>
                  <th className="py-2.5 px-4">{t.actionNeeded}</th>
                  <th className="py-2.5 px-4 text-right">{t.value}</th>
                  <th className="py-2.5 px-4">{t.submittedDate}</th>
                  <th className="py-2.5 px-4 text-right">{t.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-primary)]">
                {metrics.pendingActions.map((action) => (
                  <tr key={action.id} className="hover:bg-[var(--color-bg)]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-none border uppercase ${
                            action.type === "ORDER"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                              : "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30"
                          }`}
                        >
                          {action.type === "ORDER" ? t.orderLabel : t.applicationLabel}
                        </span>
                        <span className="font-semibold text-[var(--color-text-primary)]">{action.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-[var(--color-text-primary)]">{action.client}</div>
                        <div className="text-[11px] text-[var(--color-text-secondary)] font-mono">{action.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[var(--color-text-secondary)] font-medium">
                        {action.actionNeeded === "Review Spec & Issue Proforma"
                          ? t.reviewSpecAndProforma
                          : action.actionNeeded === "Review B2B Application & Authorize"
                          ? t.reviewB2bApplication
                          : action.actionNeeded}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[var(--color-text-primary)] tabular-nums">
                      {action.amountCents !== null
                        ? (action.amountCents / 100).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)] font-mono text-[11px] tabular-nums">
                      {new Date(action.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={action.link}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent)] hover:underline"
                      >
                        <span>{t.review}</span>
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

