import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { PortalDashboard } from "../PortalDashboard";
import { CompanyCard } from "./CompanyCard";
import { QuickActionButtons } from "./QuickActionButtons";
import { RecentOrdersSection } from "./RecentOrdersSection";
import { QuickLinksSection } from "./QuickLinksSection";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/portal",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("PortalDashboard Component & Dashboard Subcomponents", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/customer/session")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                authenticated: true,
                email: "executive@acme.com",
                companyName: "ACME Apparel Group",
                accountStatus: "APPROVED",
                createdAt: "2026-01-15T00:00:00.000Z",
              }),
          });
        }
        if (url.includes("/api/customer/orders") || url.includes("/api/portal/orders")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                orders: [
                  {
                    id: "ord-101",
                    status: "PENDING_REVIEW",
                    setupFeeCents: 5000,
                    totalCents: 15000,
                    customerTargetPriceCents: 15000,
                    createdAt: new Date().toISOString(),
                    company: { name: "ACME Apparel Group", email: "executive@acme.com" },
                    lines: [
                      {
                        id: "line-1",
                        quantity: 100,
                        size: "M",
                        product: { name: "Heavyweight Hoodie" },
                      },
                    ],
                  },
                  {
                    id: "ord-102",
                    status: "SHIPPED",
                    setupFeeCents: 0,
                    totalCents: 20000,
                    customerTargetPriceCents: 20000,
                    createdAt: new Date().toISOString(),
                    company: { name: "ACME Apparel Group", email: "executive@acme.com" },
                    lines: [
                      {
                        id: "line-2",
                        quantity: 50,
                        size: "L",
                        product: { name: "Tailored Blazer" },
                      },
                    ],
                  },
                ],
              }),
          });
        }
        return Promise.reject(new Error("Unknown route"));
      })
    );
  });

  it("renders company card with name, email, approval status", async () => {
    await act(async () => {
      render(
        <CompanyCard
          companyName="Acme Corp"
          email="acme@corp.com"
          accountStatus="APPROVED"
          createdAt="2026-01-15T00:00:00.000Z"
        />
      );
    });

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("acme@corp.com")).toBeInTheDocument();
    expect(screen.getAllByText("Approved B2B Partner").length).toBeGreaterThan(0);
  });

  it("renders all 4 quick action buttons with correct hrefs", async () => {
    await act(async () => {
      render(<QuickActionButtons />);
    });

    const createBtn = screen.getByText("CREATE NEW ORDER").closest("a");
    const viewBtn = screen.getByText("VIEW ALL ORDERS").closest("a");
    const settingsBtn = screen.getByText("ACCOUNT SETTINGS").closest("a");
    const supportBtn = screen.getByText("CONTACT SUPPORT").closest("a");

    expect(createBtn).toHaveAttribute("href", "/configure");
    expect(viewBtn).toHaveAttribute("href", "/portal/orders");
    expect(settingsBtn).toHaveAttribute("href", "/portal/account");
    expect(supportBtn).toHaveAttribute("href", "/portal/support");
  });

  it("renders recent orders section with table and status badges", async () => {
    const mockOrders: any[] = [
      {
        id: "ord-1",
        status: "PENDING_REVIEW",
        totalCents: 15000,
        createdAt: "2026-08-01T10:00:00.000Z",
        lines: [{ product: { name: "Shirt" } }],
      },
      {
        id: "ord-2",
        status: "SHIPPED",
        totalCents: 20000,
        createdAt: "2026-07-30T10:00:00.000Z",
        lines: [{ product: { name: "Pants" } }],
      },
    ];

    await act(async () => {
      render(<RecentOrdersSection orders={mockOrders} />);
    });

    expect(screen.getByText("Recent Orders (Last 5)")).toBeInTheDocument();
    expect(screen.getByText("Shirt")).toBeInTheDocument();
    expect(screen.getByText("Pants")).toBeInTheDocument();
    expect(screen.getByText("⏳ Pending Review")).toBeInTheDocument();
    expect(screen.getByText("📦 Shipped")).toBeInTheDocument();
    expect(screen.getByText("Review →")).toBeInTheDocument();
    expect(screen.getByText("Download ↓")).toBeInTheDocument();
  });

  it("renders empty state when no orders exist", async () => {
    await act(async () => {
      render(<RecentOrdersSection orders={[]} />);
    });

    expect(screen.getByText("No Orders Yet")).toBeInTheDocument();
    expect(screen.getByText("Start by configuring your first order")).toBeInTheDocument();
    expect(screen.getByText("CREATE FIRST ORDER")).toHaveAttribute("href", "/configure");
  });

  it("renders quick links section with helpful links", async () => {
    await act(async () => {
      render(<QuickLinksSection />);
    });

    expect(screen.getByText("Helpful Resources")).toBeInTheDocument();
    expect(screen.getByText("How to Configure an Order")).toBeInTheDocument();
    expect(screen.getByText("MOQ & Lead Time FAQs")).toBeInTheDocument();
    expect(screen.getByText("Payment Methods & Invoicing")).toBeInTheDocument();
    expect(screen.getByText("Contact Support")).toBeInTheDocument();
  });

  it("renders full dashboard integration", async () => {
    await act(async () => {
      render(<PortalDashboard />);
    });

    expect(screen.getByText("ACME Apparel Group")).toBeInTheDocument();
    expect(screen.getByText("CREATE NEW ORDER")).toBeInTheDocument();
    expect(screen.getByText("Heavyweight Hoodie")).toBeInTheDocument();
    expect(screen.getByText("Helpful Resources")).toBeInTheDocument();
  });
});
