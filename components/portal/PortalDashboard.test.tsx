import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { PortalDashboard } from "./PortalDashboard";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/portal",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("PortalDashboard Component", () => {
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
              }),
          });
        }
        if (url.includes("/api/portal/orders")) {
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
                ],
              }),
          });
        }
        return Promise.reject(new Error("Unknown route"));
      })
    );
  });

  it("renders company info card with company name", async () => {
    await act(async () => {
      render(<PortalDashboard />);
    });

    expect(screen.getByText("ACME Apparel Group")).toBeInTheDocument();
    expect(screen.getByText("executive@acme.com")).toBeInTheDocument();
  });

  it("renders 4 quick action buttons", async () => {
    await act(async () => {
      render(<PortalDashboard />);
    });

    expect(screen.getByText("Create New Order")).toBeInTheDocument();
    expect(screen.getByText("View All Orders")).toBeInTheDocument();
    expect(screen.getByText("Account Settings")).toBeInTheDocument();
    expect(screen.getByText("Contact Support")).toBeInTheDocument();
  });

  it("renders recent orders table with order items", async () => {
    await act(async () => {
      render(<PortalDashboard />);
    });

    expect(screen.getByText("Recent Orders (Last 5)")).toBeInTheDocument();
    expect(screen.getByText("Heavyweight Hoodie")).toBeInTheDocument();
    expect(screen.getByText("⏳ Pending Review")).toBeInTheDocument();
  });
});
