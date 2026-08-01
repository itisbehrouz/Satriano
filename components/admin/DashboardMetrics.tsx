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
        <div className="bg-white border border-[#EAECF0] rounded-md p-5 flex flex-col justify-between shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
              Pending Applications
            </span>
            <div className="w-8 h-8 rounded-md bg-[#E6F1FB] text-[#185FA5] flex items-center justify-center border border-[#B3D6F6]">
              <span className="material-symbols-outlined text-base">assignment_ind</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[#111318] tabular-nums">
              {data.pendingApplicationsCount}
            </div>
            <p className="text-[11px] text-[#185FA5] font-medium mt-1">
              Under Review &amp; Submitted
            </p>
          </div>
        </div>

        {/* KPI 2: Pending Proforma Reviews */}
        <div className="bg-white border border-[#EAECF0] rounded-md p-5 flex flex-col justify-between shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
              Pending Proformas
            </span>
            <div className="w-8 h-8 rounded-md bg-[#FEF0C7] text-[#DC6803] flex items-center justify-center border border-[#FDE272]">
              <span className="material-symbols-outlined text-base">pending_actions</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[#D92D20] tabular-nums">
              {data.pendingReviewOrdersCount}
            </div>
            <p className="text-[11px] text-[#D92D20] font-medium mt-1">
              Awaiting spec verification
            </p>
          </div>
        </div>

        {/* KPI 3: Active Production Orders */}
        <div className="bg-white border border-[#EAECF0] rounded-md p-5 flex flex-col justify-between shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
              Active Orders
            </span>
            <div className="w-8 h-8 rounded-md bg-[#F0F9FF] text-[#026AA2] flex items-center justify-center border border-[#B2DDFF]">
              <span className="material-symbols-outlined text-base">factory</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[#111318] tabular-nums">
              {data.inProductionOrdersCount}
            </div>
            <p className="text-[11px] text-[#026AA2] font-medium mt-1">
              Currently in production
            </p>
          </div>
        </div>

        {/* KPI 4: 30-Day Paid Revenue */}
        <div className="bg-white border border-[#EAECF0] rounded-md p-5 flex flex-col justify-between shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
              30-Day Paid Revenue
            </span>
            <div className="w-8 h-8 rounded-md bg-[#ECFDF3] text-[#027A48] flex items-center justify-center border border-[#ABE5C6]">
              <span className="material-symbols-outlined text-base">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[#111318] tabular-nums">
              {formattedRevenue}
            </div>
            <p className="text-[11px] text-[#027A48] font-medium mt-1">
              Paid &amp; Shipped (Last 30 Days)
            </p>
          </div>
        </div>
      </div>

      {/* Minimalist Recharts Bar Chart: Orders by Status Distribution */}
      <div className="bg-white border border-[#EAECF0] rounded-md p-5 shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111318]">
              Orders by Status Distribution
            </h3>
            <p className="text-[11px] text-[#475467] mt-0.5">
              Live operational order volume breakdown across lifecycle stages.
            </p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="text-xs font-semibold text-[#2E5AAC] hover:text-[#1E3F7A] inline-flex items-center gap-1 cursor-pointer"
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
                <CartesianGrid strokeDasharray="3 3" stroke="#EAECF0" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#667085"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#EAECF0" }}
                />
                <YAxis
                  stroke="#667085"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#EAECF0" }}
                />
                <Tooltip
                  cursor={{ fill: "#F8FAFC" }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#EAECF0",
                    borderRadius: "6px",
                    fontSize: "12px",
                    boxShadow: "none",
                  }}
                />
                <Bar dataKey="count" fill="#2E5AAC" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#667085]">
              Loading chart canvas...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
