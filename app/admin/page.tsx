"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { OrderStatus } from "@/app/generated/prisma/enums";
import { AdminOrderTable, type AdminOrder } from "@/components/admin/AdminOrderTable";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

type FilterTab = "ALL" | OrderStatus;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "All Orders" },
  { id: "DRAFT", label: "Draft" },
  { id: "PROFORMA_SENT", label: "Proforma Sent" },
  { id: "PAID", label: "Paid" },
  { id: "IN_PRODUCTION", label: "In Production" },
];

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [accessKey, setAccessKey] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check server-verified signed httpOnly cookie session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setCheckingSession(false);
      }
    }
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) {
      setAuthError("Please enter your corporate access key.");
      return;
    }

    setAuthError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAuthError(data.error || "Invalid access key.");
        return;
      }

      setIsAuthenticated(true);
      setAccessKey("");
    } catch (err) {
      console.error("Login error:", err);
      setAuthError("Server authentication error. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsAuthenticated(false);
    }
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        activeTab === "ALL"
          ? "/api/admin/orders"
          : `/api/admin/orders?status=${activeTab}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update status");
        return;
      }

      await fetchOrders();
    } catch {
      alert("Failed to update status. Please try again.");
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-sans">
        <div className="text-sm text-[#5B6B85] flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin" />
          Verifying Portal Console session...
        </div>
      </div>
    );
  }

  // Render Login Gate if unauthenticated
  if (!isAuthenticated) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-[80vh] bg-[#F5F7FA] text-[#1A2233] py-16 px-4 md:px-8 flex flex-col justify-center items-center font-sans">
          <div className="w-full max-w-md mx-auto">


            <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-[#0B1E3D] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                </div>
                <h1 className="text-xl font-semibold text-[#1A2233]">
                  Portal Console Access
                </h1>
                <p className="text-xs text-[#5B6B85] mt-1 leading-relaxed">
                  Authorized personnel access to order management &amp; factory status ledgers.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="accessKey"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1.5"
                  >
                    Corporate Access Key *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5B6B85] text-lg">
                      key
                    </span>
                    <input
                      id="accessKey"
                      type="password"
                      required
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      placeholder="Enter security key..."
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-[#FCE8E6] border border-[#F8B4B4] rounded text-xs text-[#C5221F]">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm"
                >
                  Authenticate &amp; Unlock Console
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center text-[11px] text-[#5B6B85]">
                Internal security audit logged. Unauthorized access attempts are monitored.
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // Render Admin Operations Console
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#F5F7FA] text-[#1A2233] py-10 px-4 md:px-8 font-sans">
        <div className="w-full max-w-container-max mx-auto space-y-6">
          {/* Top Bar Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D1D5DB]">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-semibold text-[#1A2233]">
                  Portal Console
                </h1>
                <span className="bg-[#E6F1FB] text-[#185FA5] text-[10px] uppercase font-semibold px-2 py-0.5 rounded border border-[#B3D6F6]">
                  Production Ledger
                </span>
              </div>
              <p className="text-xs text-[#5B6B85] mt-1">
                Internal order management, proforma status verification &amp; factory pipeline tracking.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchOrders}
                className="px-3.5 py-2 bg-white border border-[#D1D5DB] hover:bg-[#F5F7FA] text-xs font-semibold text-[#1A2233] rounded flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh Ledger
              </button>
              <button
                onClick={handleSignOut}
                className="px-3.5 py-2 bg-white border border-[#D1D5DB] hover:bg-[#FCE8E6] hover:text-[#C5221F] text-xs font-semibold text-[#5B6B85] rounded flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Sign Out
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#D1D5DB] pb-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#0B1E3D] text-white font-semibold shadow-sm"
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
              <p>Loading production orders ledger...</p>
            </div>
          ) : error ? (
            <div className="bg-white border border-[#F8B4B4] rounded-lg p-6 text-center text-sm text-[#C5221F]">
              <p className="font-semibold mb-1">Ledger Error</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : (
            <div className="bg-white border border-[#D1D5DB] rounded-lg shadow-sm overflow-hidden">
              <AdminOrderTable
                orders={orders}
                onStatusChange={fetchOrders}
              />
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
