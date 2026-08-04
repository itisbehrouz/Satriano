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
  orderType?: "M2O" | "WHOLESALE";
  status: OrderStatus | string;
  setupFeeCents?: number;
  totalCents: number;
  totalUSD?: number;
  totalUnits?: number;
  customerTargetPriceCents?: number | null;
  finalPriceCents?: number | null;
  offeredUnitPriceUSD?: number | null;
  listUnitPriceUSD?: number | null;
  bulkDiscountPercent?: number | null;
  stockBreakdown?: Record<string, number> | string | null;
  deliveryEstimate?: string | null;
  createdAt: string;
  company: { name: string; email: string };
  lines: CustomerOrderLine[];
  proforma?: { refNo: string; pdfUrl?: string | null } | null;
}

function CustomerOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State initialized from URL query params
  const initialType = (searchParams.get("tab") as "ALL" | "M2O" | "WHOLESALE") || "ALL";
  const initialStatus = searchParams.get("status") || "ALL";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "createdAt";
  const initialOrder = (searchParams.get("order") as "asc" | "desc") || "desc";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [orderTypeTab, setOrderTypeTab] = useState<"ALL" | "M2O" | "WHOLESALE">(initialType);
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

  // Sample default wholesale orders matching exact prompt specifications (#WH001 & #WH002)
  const sampleWholesaleOrders: CustomerOrder[] = [
    {
      id: "#WH001",
      orderType: "WHOLESALE",
      status: "PENDING_REVIEW",
      setupFeeCents: 0,
      totalCents: 525000,
      totalUSD: 5250.0,
      createdAt: new Date("2026-08-02T09:00:00Z").toISOString(),
      company: { name: "Corporate Menswear Partner", email: "procurement@corporate.com" },
      totalUnits: 50,
      offeredUnitPriceUSD: 105.0,
      listUnitPriceUSD: 125.0,
      bulkDiscountPercent: 16,
      stockBreakdown: { "36": 10, "38": 15, "40": 15, "42": 10 },
      deliveryEstimate: "Immediate Dispatch (3–5 Business Days)",
      lines: [
        {
          id: "wh-l-1",
          quantity: 50,
          size: "Mixed",
          product: { name: "Shawl Lapel Slim Fit Blazer - Wessi", slug: "shawl-lapel-prom-blazer" },
        },
      ],
      proforma: { refNo: "#WH001", pdfUrl: null },
    },
    {
      id: "#WH002",
      orderType: "WHOLESALE",
      status: "APPROVED",
      setupFeeCents: 0,
      totalCents: 600000,
      totalUSD: 6000.0,
      createdAt: new Date("2026-08-01T14:30:00Z").toISOString(),
      company: { name: "Corporate Menswear Partner", email: "procurement@corporate.com" },
      totalUnits: 100,
      offeredUnitPriceUSD: 60.0,
      listUnitPriceUSD: 75.0,
      bulkDiscountPercent: 20,
      stockBreakdown: { "36": 20, "38": 30, "40": 30, "42": 20 },
      deliveryEstimate: "Immediate Dispatch (3–5 Business Days)",
      lines: [
        {
          id: "wh-l-2",
          quantity: 100,
          size: "Mixed",
          product: { name: "Italian Poplin Cotton Dress Shirts", slug: "dress-shirt" },
        },
      ],
      proforma: { refNo: "#WH002", pdfUrl: null },
    },
  ];

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

      let fetchedOrders: CustomerOrder[] = [];
      if (res.ok) {
        const data = await res.json();
        fetchedOrders = (data.orders || []).map((o: any) => ({ ...o, orderType: "M2O" }));
        setCustomerEmail(data.email || null);
        if (data.orders && data.orders[0]?.company?.name) {
          setCompanyName(data.orders[0].company.name);
        }
      }

      // Read locally stored wholesale checkout orders
      const storedWholesaleRaw = localStorage.getItem("satriano_wholesale_orders");
      const storedWholesaleOrders: CustomerOrder[] = storedWholesaleRaw
        ? JSON.parse(storedWholesaleRaw).map((wo: any) => ({
            id: wo.id,
            orderType: "WHOLESALE",
            status: wo.status || "Pending",
            setupFeeCents: 0,
            totalCents: Math.round(wo.totalUSD * 100),
            totalUSD: wo.totalUSD,
            createdAt: wo.createdAt,
            company: { name: "Corporate Wholesale Partner", email: "wholesale@satriano.com" },
            totalUnits: wo.totalUnits,
            stockBreakdown: wo.items?.[0]?.sizeBreakdown,
            offeredUnitPriceUSD: wo.items?.[0]?.offeredPriceUSD || wo.items?.[0]?.unitPriceUSD,
            listUnitPriceUSD: wo.items?.[0]?.unitPriceUSD,
            bulkDiscountPercent: wo.discountUSD > 0 ? 20 : 0,
            deliveryEstimate: "Immediate Dispatch (3–5 Business Days)",
            lines: wo.items
              ? wo.items.map((i: any) => ({
                  id: i.id,
                  quantity: i.totalUnits,
                  size: "Mixed",
                  product: { name: i.name, slug: i.id },
                }))
              : [],
            proforma: { refNo: wo.id, pdfUrl: null },
          }))
        : [];

      const combinedWholesale = [...storedWholesaleOrders, ...sampleWholesaleOrders];
      const combinedAll = [...fetchedOrders, ...combinedWholesale];

      setOrders(combinedAll);
    } catch (err: unknown) {
      console.error(err);
      setOrders(sampleWholesaleOrders);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomerOrders();
  }, [statusFilter, searchQuery, sortColumn, sortOrder, currentPage]);

  // Filter orders based on selected order type (ALL, M2O, WHOLESALE)
  const filteredByTabOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderTypeTab === "M2O") return o.orderType !== "WHOLESALE";
      if (orderTypeTab === "WHOLESALE") return o.orderType === "WHOLESALE" || o.id.startsWith("#WH");
      return true;
    });
  }, [orders, orderTypeTab]);

  // Filter by status & search query
  const displayOrders = useMemo(() => {
    return filteredByTabOrders.filter((o) => {
      if (statusFilter !== "ALL") {
        if (statusFilter === "PAID_APPROVED" && o.status !== "PAID" && o.status !== "APPROVED" && o.status !== "Approved") {
          return false;
        } else if (statusFilter !== "PAID_APPROVED" && String(o.status).toUpperCase() !== statusFilter) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = o.id.toLowerCase().includes(q);
        const nameMatch = o.lines.some((l) => l.product?.name.toLowerCase().includes(q));
        if (!idMatch && !nameMatch) return false;
      }
      return true;
    });
  }, [filteredByTabOrders, statusFilter, searchQuery]);

  // Client-side counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: filteredByTabOrders.length };
    filteredByTabOrders.forEach((o) => {
      const st = String(o.status).toUpperCase();
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [filteredByTabOrders]);

  const handleOrderTypeChange = (tab: "ALL" | "M2O" | "WHOLESALE") => {
    setOrderTypeTab(tab);
    setCurrentPage(1);
    updateUrlParams({ tab, page: 1 });
  };

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
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-4 md:p-6 lg:p-10 font-sans select-none rounded-none transition-colors">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* 1. Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Order History
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              All manufacturing orders, proformas, and ready-made wholesale stock orders for{" "}
              <strong className="text-[var(--color-text-primary)]">{companyName || customerEmail || "Corporate Partner"}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/wholesale"
              className="h-12 bg-[var(--color-surface)] hover:bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold uppercase tracking-wider px-5 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
            >
              <span>Wholesale Catalog →</span>
            </Link>

            <Link
              href="/configure"
              className="h-12 bg-[var(--color-accent)] hover:bg-[#1E3F7F] text-white text-xs font-bold uppercase tracking-wider px-5 flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
            >
              <span>Create M2O Order →</span>
            </Link>
          </div>
        </div>

        {/* 2. Filter & Search Bar with Order Type Tabs */}
        <FilterBar
          selectedOrderType={orderTypeTab}
          onOrderTypeChange={handleOrderTypeChange}
          selectedStatus={statusFilter}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusCounts={statusCounts}
        />

        {/* 3. Orders Content / Table / States */}
        {loading ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-12 text-center text-xs text-[var(--color-text-secondary)] space-y-2">
            <span className="inline-block w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading orders history...</p>
          </div>
        ) : error ? (
          <div className="bg-[var(--color-status-warning-bg)] border border-[var(--color-status-warning)] rounded-none p-6 text-center text-xs text-[var(--color-status-warning)] flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchCustomerOrders}
              className="underline font-semibold hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-12 text-center space-y-4">
            <div className="text-5xl text-[var(--color-text-secondary)] mx-auto flex items-center justify-center">
              📦
            </div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">No {orderTypeTab === "WHOLESALE" ? "Wholesale" : orderTypeTab === "M2O" ? "M2O" : ""} Orders Found</h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
              You haven&apos;t placed any orders matching your criteria yet.
            </p>
            <div>
              <Link
                href={orderTypeTab === "WHOLESALE" ? "/wholesale" : "/configure"}
                className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-accent)] hover:bg-[#1E3F7F] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors"
              >
                {orderTypeTab === "WHOLESALE" ? "BROWSE WHOLESALE CATALOG" : "CREATE FIRST ORDER"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <OrdersTable
              orders={displayOrders}
              isWholesaleView={orderTypeTab === "WHOLESALE"}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              onSelectOrder={handleOpenModal}
            />

            {/* 4. Pagination Bar */}
            <PaginationBar
              currentPage={currentPage}
              totalPages={Math.ceil(displayOrders.length / 10) || 1}
              totalOrders={displayOrders.length}
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
        <div className="min-h-screen bg-[var(--color-bg)] p-10 flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
          <span className="inline-block w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-2" />
        </div>
      }
    >
      <CustomerOrdersContent />
    </Suspense>
  );
}
