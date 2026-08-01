"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export interface AdminMetrics {
  totalOrders: number;
  pendingReviewOrders: number;
  proformaSentOrders: number;
  inProductionOrders: number;
  shippedOrders: number;
  totalPaidCents: number;
  pendingApplications: number;
  recentOrders: Array<{
    id: string;
    companyName: string;
    corpEmail: string;
    status: string;
    totalCents: number;
    createdAt: string;
  }>;
}

export function AdminKpiDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchMetrics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/metrics");
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
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-[#EAECF0] rounded-lg p-6 mb-6 font-sans">
        <div className="flex items-center gap-3 text-xs text-[#667085]">
          <span className="w-4 h-4 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin" />
          <span>Calculating operational KPIs &amp; production telemetry...</span>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-white border border-[#FDA29B] rounded-lg p-4 mb-6 font-sans flex items-center justify-between text-xs text-[#F04438]">
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

  const formattedRevenue = (metrics.totalPaidCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="space-y-6 font-sans mb-6">
      {/* 4-Card Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Orders */}
        <div className="bg-white border border-[#EAECF0] rounded-lg p-5 flex flex-col justify-between select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-md bg-[#F2F4F7] text-[#344054] flex items-center justify-center border border-[#D0D5DD]">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-[#101828]">
              {metrics.totalOrders}
            </div>
            <p className="text-[11px] text-[#475467] mt-1 flex items-center gap-1">
              <span>All production orders in ledger</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Pending Review (Quotes Pending) */}
        <div className="bg-white border border-[#EAECF0] rounded-lg p-5 flex flex-col justify-between select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Quotes Pending
            </span>
            <div className="w-9 h-9 rounded-md bg-[#FEF0C7] text-[#DC6803] flex items-center justify-center border border-[#FDE272]">
              <span className="material-symbols-outlined text-lg">pending_actions</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-[#D92D20]">
              {metrics.pendingReviewOrders}
            </div>
            <p className="text-[11px] text-[#D92D20] font-medium mt-1">
              Awaiting proforma price verification
            </p>
          </div>
        </div>

        {/* KPI 3: Total Paid Revenue */}
        <div className="bg-white border border-[#EAECF0] rounded-lg p-5 flex flex-col justify-between select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Paid Revenue
            </span>
            <div className="w-9 h-9 rounded-md bg-[#ECFDF3] text-[#027A48] flex items-center justify-center border border-[#ABE5C6]">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-[#101828]">
              {formattedRevenue}
            </div>
            <p className="text-[11px] text-[#027A48] font-medium mt-1">
              Confirmed B2B payment authorizations
            </p>
          </div>
        </div>

        {/* KPI 4: Pending B2B Applications */}
        <div className="bg-white border border-[#EAECF0] rounded-lg p-5 flex flex-col justify-between select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Pending Partners
            </span>
            <div className="w-9 h-9 rounded-md bg-[#E6F1FB] text-[#185FA5] flex items-center justify-center border border-[#B3D6F6]">
              <span className="material-symbols-outlined text-lg">assignment_ind</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-[#101828]">
              {metrics.pendingApplications}
            </div>
            <p className="text-[11px] text-[#185FA5] font-medium mt-1">
              B2B company requests for review
            </p>
          </div>
        </div>
      </div>

      {/* Production Pipeline Scannable Overview Bar */}
      <div className="bg-white border border-[#EAECF0] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101828]">
              Production Pipeline Status Breakdown
            </h3>
            <p className="text-[11px] text-[#475467] mt-0.5">
              Real-time operational distribution across active order stages.
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#667085]">
              Quotes Pending
            </span>
            <div className="text-lg font-bold font-mono text-[#101828] mt-1">
              {metrics.pendingReviewOrders}
            </div>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#667085]">
              Proformas Sent
            </span>
            <div className="text-lg font-bold font-mono text-[#101828] mt-1">
              {metrics.proformaSentOrders}
            </div>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#667085]">
              In Production
            </span>
            <div className="text-lg font-bold font-mono text-[#101828] mt-1">
              {metrics.inProductionOrders}
            </div>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#667085]">
              Shipped / Complete
            </span>
            <div className="text-lg font-bold font-mono text-[#101828] mt-1">
              {metrics.shippedOrders}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
