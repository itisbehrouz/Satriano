"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/portal/orders/FilterBar";
import { OrdersTable } from "@/components/portal/orders/OrdersTable";
import { OrderDetailModal } from "@/components/portal/orders/OrderDetailModal";
import { PaginationBar } from "@/components/portal/orders/PaginationBar";
import type { OrderStatus } from "@/app/generated/prisma/enums";

export interface CustomerOrderLine {
  id: string;
  quantity: number;
  size: string;
  selectedFit?: string | null;
  product?: { name: string; slug: string } | null;
  fabric?: { name: string; colorway?: string | null } | null;
}

export interface CustomerOrder {
  id: string;
  status: OrderStatus;
  setupFeeCents: number;
  totalCents: number;
  customerTargetPriceCents?: number | null;
  finalPriceCents?: number | null;
  createdAt: string;
  company: { name: string; email: string };
  lines: CustomerOrderLine[];
  proforma?: { refNo: string; pdfUrl?: string | null } | null;
}

function CustomerOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State initialized from URL query params
  const initialStatus = searchParams.get("status") || "ALL";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "createdAt";
  const initialOrder = (searchParams.get("order") as "asc" | "desc") || "desc";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortColumn, setSortColumn] = useState<string>(initialSort);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialOrder);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state to URL query params
  const updateUrlParams = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === "" || v === "ALL" || (k === "page" && v === 1)) {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    });
    router.replace(`/portal/orders?${params.toString()}`);
  };

  async function fetchCustomerOrders() {
    setLoading(true);
    setError(null);
    try {
      const queryUrl = `/api/customer/orders?status=${statusFilter}&search=${encodeURIComponent(
        searchQuery
      )}&sort=${sortColumn}&order=${sortOrder}&page=${currentPage}&limit=10`;

      const res = await fetch(queryUrl);

      if (res.status === 401) {
        window.location.href = "/portal?error=session_expired";
        return;
      }

      if (!res.ok) {
        // Fallback to legacy endpoint if needed
        const fallbackRes = await fetch("/api/portal/orders");
        if (!fallbackRes.ok) {
          throw new Error("Failed to load order history.");
        }
        const fallbackData = await fallbackRes.json();
        setOrders(fallbackData.orders || []);
        setCustomerEmail(fallbackData.email || null);
        return;
      }

      const data = await res.json();
      setOrders(data.orders || []);
      setCustomerEmail(data.email || null);
      if (data.orders && data.orders[0]?.company?.name) {
        setCompanyName(data.orders[0].company.name);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load order history.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomerOrders();
  }, [statusFilter, searchQuery, sortColumn, sortOrder, currentPage]);

  // Client-side counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    updateUrlParams({ status: newStatus, page: 1 });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateUrlParams({ search: query, page: 1 });
  };

  const handleSortChange = (column: string) => {
    let nextOrder: "asc" | "desc" = "asc";
    if (sortColumn === column) {
      nextOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    setSortColumn(column);
    setSortOrder(nextOrder);
    updateUrlParams({ sort: column, order: nextOrder });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page });
  };

  const handleOpenModal = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <main className="min-h-screen bg-[#0B1E3D] text-[#E8ECF3] p-4 md:p-6 lg:p-10 font-sans select-none rounded-none">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* 1. Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-[#2E5AAC]">
          <div>
            <h1 className="text-2xl font-bold text-[#E8ECF3]">
              Order History
            </h1>
            <p className="text-sm text-[#8DA0C4] mt-1">
              All manufacturing orders and proformas for{" "}
              <strong className="text-[#E8ECF3]">{companyName || customerEmail || "Corporate Partner"}</strong>
            </p>
          </div>

          <Link
            href="/configure"
            className="h-12 bg-[#2E5AAC] hover:bg-[#1E3F7F] text-white text-xs font-bold uppercase tracking-wider px-5 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
          >
            <span>Create New Order →</span>
          </Link>
        </div>

        {/* 2. Filter & Search Bar */}
        <FilterBar
          selectedStatus={statusFilter}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusCounts={statusCounts}
        />

        {/* 3. Orders Content / Table / States */}
        {loading ? (
          <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-12 text-center text-xs text-[#8DA0C4] space-y-2">
            <span className="inline-block w-6 h-6 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading manufacturing orders...</p>
          </div>
        ) : error ? (
          <div className="bg-[#3A2E14] border border-[#F0B94A] rounded-none p-6 text-center text-xs text-[#F0B94A] flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchCustomerOrders}
              className="underline font-semibold hover:text-white cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-12 text-center space-y-4">
            <div className="text-5xl text-[#8DA0C4] mx-auto flex items-center justify-center">
              📦
            </div>
            <h3 className="text-base font-bold text-[#E8ECF3]">No Orders Found</h3>
            <p className="text-sm text-[#8DA0C4] max-w-md mx-auto">
              You haven&apos;t placed any manufacturing orders matching your criteria yet. Start by configuring your first order.
            </p>
            <div>
              <Link
                href="/configure"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#2E5AAC] hover:bg-[#1E3F7F] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors"
              >
                CREATE FIRST ORDER
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <OrdersTable
              orders={orders}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              onSelectOrder={handleOpenModal}
            />

            {/* 4. Pagination Bar */}
            <PaginationBar
              currentPage={currentPage}
              totalPages={Math.ceil(orders.length / 10) || 1}
              totalOrders={orders.length}
              limit={10}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* 5. Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </main>
  );
}

export default function CustomerOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1E3D] p-10 flex items-center justify-center text-xs text-[#8DA0C4]">
          <span className="inline-block w-6 h-6 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
        </div>
      }
    >
      <CustomerOrdersContent />
    </Suspense>
  );
}
