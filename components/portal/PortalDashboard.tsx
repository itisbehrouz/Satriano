"use client";

import React, { useState, useEffect } from "react";
import { CompanyCard } from "@/components/portal/dashboard/CompanyCard";
import { QuickActionButtons } from "@/components/portal/dashboard/QuickActionButtons";
import { RecentOrdersSection } from "@/components/portal/dashboard/RecentOrdersSection";
import { QuickLinksSection } from "@/components/portal/dashboard/QuickLinksSection";
import type { CustomerOrder } from "@/app/portal/orders/page";

export function PortalDashboard() {
  const [session, setSession] = useState<{
    companyName: string;
    email: string;
    accountStatus?: string;
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
        fetch("/api/customer/orders?limit=5&sort=createdAt&order=desc"),
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
            accountStatus: sessionData.accountStatus || "APPROVED",
            createdAt: sessionData.createdAt,
          });
        }
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      } else {
        // Fallback to legacy endpoint if available
        const fallbackRes = await fetch("/api/portal/orders");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setOrders(fallbackData.orders || []);
        }
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
      <main className="min-h-screen bg-[var(--color-bg)] p-4 md:p-6 lg:p-10 font-sans select-none rounded-none transition-colors">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-12 text-center text-xs text-[var(--color-text-secondary)]">
            <span className="inline-block w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Initializing B2B Client Portal Dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] p-4 md:p-6 lg:p-10 font-sans select-none rounded-none transition-colors">
        <div className="max-w-[1440px] mx-auto">
          <div className="bg-[var(--color-status-warning-bg)] border border-[var(--color-status-warning)] rounded-none p-6 text-center text-xs text-[var(--color-status-warning)] flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadDashboardData}
              className="underline font-semibold hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-4 md:p-6 lg:p-10 font-sans select-none rounded-none transition-colors">
      <div className="max-w-[1440px] mx-auto">
        {/* 1. Hero Section: Company Information Card */}
        <div className="mb-6">
          <CompanyCard
            companyName={session?.companyName || "Satriano B2B Client"}
            email={session?.email || "account@satriano.com"}
            accountStatus={session?.accountStatus || "APPROVED"}
            createdAt={session?.createdAt}
          />
        </div>

        {/* 2. CTA Panel: Quick Action Buttons */}
        <div className="mb-10">
          <QuickActionButtons />
        </div>

        {/* 3. Recent Orders Section (Last 5) */}
        <div className="mb-10">
          <RecentOrdersSection orders={orders} loading={false} />
        </div>

        {/* 4. Quick Links: Helpful Resources */}
        <div>
          <QuickLinksSection />
        </div>
      </div>
    </main>
  );
}
