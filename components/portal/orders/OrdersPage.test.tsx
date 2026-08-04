import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import CustomerOrdersPage from "@/app/portal/orders/page";
import { FilterBar } from "./FilterBar";
import { OrdersTable } from "./OrdersTable";
import { OrderDetailModal } from "./OrderDetailModal";
import { PaginationBar } from "./PaginationBar";

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/portal/orders",
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams("status=ALL&page=1"),
}));

describe("Order History Page & Components (/portal/orders)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/customer/orders") || url.includes("/api/portal/orders")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                success: true,
                email: "executive@acme.com",
                total: 2,
                page: 1,
                limit: 10,
                totalPages: 1,
                orders: [
                  {
                    id: "ord-101",
                    status: "PENDING_REVIEW",
                    setupFeeCents: 0,
                    totalCents: 15000,
                    customerTargetPriceCents: 15000,
                    createdAt: "2026-08-01T10:00:00.000Z",
                    company: { name: "ACME Apparel Group", email: "executive@acme.com" },
                    lines: [
                      {
                        id: "line-1",
                        quantity: 100,
                        size: "M",
                        product: { name: "Heavyweight Hoodie", slug: "hoodie" },
                        fabric: { name: "Cotton Fleece" },
                        selectedFit: "Relaxed Fit",
                      },
                    ],
                    proforma: { refNo: "PRO-2026-101" },
                  },
                  {
                    id: "ord-102",
                    status: "SHIPPED",
                    setupFeeCents: 0,
                    totalCents: 320000,
                    customerTargetPriceCents: 320000,
                    createdAt: "2026-07-28T10:00:00.000Z",
                    company: { name: "ACME Apparel Group", email: "executive@acme.com" },
                    lines: [
                      {
                        id: "line-2",
                        quantity: 200,
                        size: "L",
                        product: { name: "Trousers", slug: "trousers" },
                        fabric: { name: "Wool Twill" },
                        selectedFit: "Regular Fit",
                      },
                    ],
                    proforma: { refNo: "PRO-2026-102" },
                  },
                ],
              }),
          });
        }
        return Promise.reject(new Error("Unknown route"));
      })
    );
  });

  it("renders FilterBar with status tabs and search input", () => {
    const onStatusChange = vi.fn();
    const onSearchChange = vi.fn();

    render(
      <FilterBar
        selectedStatus="ALL"
        onStatusChange={onStatusChange}
        searchQuery=""
        onSearchChange={onSearchChange}
        statusCounts={{ ALL: 5, PENDING_REVIEW: 2 }}
      />
    );

    expect(screen.getByText("All Statuses")).toBeInTheDocument();
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by Order ID/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Pending Review"));
    expect(onStatusChange).toHaveBeenCalledWith("PENDING_REVIEW");

    fireEvent.change(screen.getByPlaceholderText(/Search by Order ID/i), {
      target: { value: "PRO-2026" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("PRO-2026");
  });

  it("renders OrdersTable with columns, data rows, and sort headers", () => {
    const onSortChange = vi.fn();
    const onSelectOrder = vi.fn();

    const mockOrders: any[] = [
      {
        id: "ord-101",
        status: "PENDING_REVIEW",
        totalCents: 15000,
        createdAt: "2026-08-01T10:00:00.000Z",
        company: { name: "ACME", email: "acme@test.com" },
        lines: [{ quantity: 100, size: "M", product: { name: "Hoodie" } }],
        proforma: { refNo: "PRO-101" },
      },
    ];

    render(
      <OrdersTable
        orders={mockOrders}
        sortColumn="createdAt"
        sortOrder="desc"
        onSortChange={onSortChange}
        onSelectOrder={onSelectOrder}
      />
    );

    expect(screen.getByText("Order ID")).toBeInTheDocument();
    expect(screen.getByText("Quantity")).toBeInTheDocument();
    expect(screen.getByText("PRO-101")).toBeInTheDocument();
    expect(screen.getByText("Hoodie")).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Order ID"));
    expect(onSortChange).toHaveBeenCalledWith("id");

    fireEvent.click(screen.getByText("PRO-101"));
    expect(onSelectOrder).toHaveBeenCalledWith(mockOrders[0]);
  });

  it("renders OrderDetailModal and closes on X click", () => {
    const onClose = vi.fn();
    const mockOrder: any = {
      id: "ord-101",
      status: "PENDING_REVIEW",
      totalCents: 15000,
      finalPriceCents: 15000,
      createdAt: "2026-08-01T10:00:00.000Z",
      company: { name: "ACME Apparel Group", email: "executive@acme.com" },
      lines: [
        {
          id: "l-1",
          quantity: 100,
          size: "M",
          product: { name: "Heavyweight Hoodie" },
          fabric: { name: "Cotton Fleece" },
          selectedFit: "Relaxed Fit",
        },
      ],
      proforma: { refNo: "PRO-2026-101" },
    };

    render(<OrderDetailModal order={mockOrder} isOpen={true} onClose={onClose} />);

    expect(screen.getByText("ORDER PRO-2026-101")).toBeInTheDocument();
    expect(screen.getByText("Heavyweight Hoodie")).toBeInTheDocument();
    expect(screen.getByText("Cotton Fleece")).toBeInTheDocument();
    expect(screen.getByText("Relaxed Fit")).toBeInTheDocument();
    expect(screen.getByText(/Download Proforma/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Wholesale Support/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close Modal"));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders PaginationBar with page buttons", () => {
    const onPageChange = vi.fn();

    render(
      <PaginationBar
        currentPage={1}
        totalPages={3}
        totalOrders={25}
        limit={10}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    fireEvent.click(screen.getByText("2"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders full CustomerOrdersPage integration", async () => {
    await act(async () => {
      render(<CustomerOrdersPage />);
    });

    expect(screen.getByText("Order History")).toBeInTheDocument();
    expect(screen.getByText(/Create M2O Order/i)).toBeInTheDocument();
    expect(screen.getByText("PRO-2026-101")).toBeInTheDocument();
    expect(screen.getByText("PRO-2026-102")).toBeInTheDocument();
  });
});
