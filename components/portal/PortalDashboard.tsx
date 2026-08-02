"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CompanyInfoCard } from "@/components/portal/CompanyInfoCard";
import { QuickActionButtons } from "@/components/portal/QuickActionButtons";
import { RecentOrdersTable } from "@/components/portal/RecentOrdersTable";
import type { CustomerOrder } from "@/app/portal/orders/page";

export function PortalDashboard() {
  const [session, setSession] = useState<{
    companyName: string;
    email: string;
    createdAt?: string;
  } | null>(null);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const [sessionRes, ordersRes] = await Promise.all([
        fetch("/api/customer/session"),
        fetch("/api/portal/orders"),
      ]);

      if (sessionRes.status === 401 || ordersRes.status === 401) {
        window.location.href = "/portal?error=session_expired";
        return;
      }

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated) {
          setSession({
            companyName: sessionData.companyName || "Corporate Account",
            email: sessionData.email,
          });
        }
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard operational data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B1E3D] py-10 px-4 sm:px-6 lg:px-8 font-sans select-none rounded-none">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-12 text-center text-xs text-[#8DA0C4]">
            <span className="inline-block w-6 h-6 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Initializing B2B Client Portal Dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0B1E3D] py-10 px-4 sm:px-6 lg:px-8 font-sans select-none rounded-none">
        <div className="max-w-[1440px] mx-auto">
          <div className="bg-[#3A2E14] border border-[#F0B94A] rounded-none p-6 text-center text-xs text-[#F0B94A] flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadDashboardData}
              className="underline font-semibold hover:text-white cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B1E3D] text-[#E8ECF3] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans select-none rounded-none">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* 1. Hero Section: Company Info Card */}
        <CompanyInfoCard
          companyName={session?.companyName || "Satriano B2B Client"}
          email={session?.email || "account@satriano.com"}
          status="APPROVED"
        />

        {/* 2. CTA Panel: Quick Action Buttons */}
        <QuickActionButtons />

        {/* 3. Recent Orders Section (Last 5) */}
        <RecentOrdersTable orders={orders} loading={false} />

        {/* 4. Quick Links: Helpful Resources */}
        <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-6 text-[#E8ECF3] shadow-none">
          <h3 className="text-sm font-bold text-[#E8ECF3] uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#85B7EB] rounded-none" />
            Helpful Resources &amp; Support
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
            <Link
              href="/konfigurator"
              className="p-3 bg-[#0B1E3D] border border-[#1E3A8A] hover:border-[#2E5AAC] text-[#85B7EB] hover:text-white transition-colors rounded-none flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>How to Configure an Order</span>
            </Link>

            <Link
              href="/portal/faq"
              className="p-3 bg-[#0B1E3D] border border-[#1E3A8A] hover:border-[#2E5AAC] text-[#85B7EB] hover:text-white transition-colors rounded-none flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">help</span>
              <span>MOQ &amp; Lead Time FAQs</span>
            </Link>

            <Link
              href="/portal/orders#invoices"
              className="p-3 bg-[#0B1E3D] border border-[#1E3A8A] hover:border-[#2E5AAC] text-[#85B7EB] hover:text-white transition-colors rounded-none flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">payments</span>
              <span>Payment Methods &amp; Invoicing</span>
            </Link>

            <Link
              href="/portal/support"
              className="p-3 bg-[#0B1E3D] border border-[#1E3A8A] hover:border-[#2E5AAC] text-[#85B7EB] hover:text-white transition-colors rounded-none flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">support_agent</span>
              <span>Contact Support Team</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
