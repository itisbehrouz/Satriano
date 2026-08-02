"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { DashboardMetricsData } from "@/lib/adminMetrics";

export interface DashboardMetricsProps {
  data?: DashboardMetricsData | null;
  onRefresh?: () => void;
}

export function DashboardMetrics({ data, onRefresh }: DashboardMetricsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data) {
    return null;
  }

  const formattedRevenue = (data.thirtyDaysRevenueCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const chartData = data.statusDistribution.map((item) => ({
    name: item.label,
    count: item.count,
  }));

  return (
    <div className="space-y-6 font-sans select-none">
      {/* 4-Card Primary KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pending B2B Applications */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Pending Applications
            </span>
            <div className="w-8 h-8 rounded-none bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center border border-[var(--color-accent)]/30">
              <span className="material-symbols-outlined text-base">assignment_ind</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[var(--color-text-primary)] tabular-nums">
              {data.pendingApplicationsCount}
            </div>
            <p className="text-[11px] text-[var(--color-accent)] font-medium mt-1">
              Under Review &amp; Submitted
            </p>
          </div>
        </div>

        {/* KPI 2: Pending Proforma Reviews */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Pending Proformas
            </span>
            <div className="w-8 h-8 rounded-none bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <span className="material-symbols-outlined text-base">pending_actions</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-500 tabular-nums">
              {data.pendingReviewOrdersCount}
            </div>
            <p className="text-[11px] text-amber-500 font-medium mt-1">
              Awaiting spec verification
            </p>
          </div>
        </div>

        {/* KPI 3: Active Production Orders */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Active Orders
            </span>
            <div className="w-8 h-8 rounded-none bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center border border-[var(--color-accent)]/30">
              <span className="material-symbols-outlined text-base">factory</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[var(--color-text-primary)] tabular-nums">
              {data.inProductionOrdersCount}
            </div>
            <p className="text-[11px] text-[var(--color-accent)] font-medium mt-1">
              Currently in production
            </p>
          </div>
        </div>

        {/* KPI 4: 30-Day Paid Revenue */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              30-Day Paid Revenue
            </span>
            <div className="w-8 h-8 rounded-none bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] flex items-center justify-center border border-[var(--color-status-success)]/30">
              <span className="material-symbols-outlined text-base">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[var(--color-text-primary)] tabular-nums">
              {formattedRevenue}
            </div>
            <p className="text-[11px] text-[var(--color-status-success)] font-medium mt-1">
              Paid &amp; Shipped (Last 30 Days)
            </p>
          </div>
        </div>
      </div>

      {/* Minimalist Recharts Bar Chart: Orders by Status Distribution */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-5 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Orders by Status Distribution
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              Live operational order volume breakdown across lifecycle stages.
            </p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              <span>Refresh</span>
            </button>
          )}
        </div>

        <div className="w-full h-64">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text-secondary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border)" }}
                />
                <YAxis
                  stroke="var(--color-text-secondary)"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-bg)" }}
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                    borderRadius: "0px",
                    fontSize: "12px",
                    boxShadow: "none",
                  }}
                />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[0, 0, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
              Loading chart canvas...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
