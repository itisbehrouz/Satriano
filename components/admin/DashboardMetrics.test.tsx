import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { DashboardMetrics } from "./DashboardMetrics";
import type { DashboardMetricsData } from "@/lib/adminMetrics";

const mockMetricsData: DashboardMetricsData = {
  pendingApplicationsCount: 4,
  pendingReviewOrdersCount: 2,
  inProductionOrdersCount: 6,
  thirtyDaysRevenueCents: 485000,
  statusDistribution: [
    { status: "DRAFT", label: "Draft", count: 1 },
    { status: "PENDING_REVIEW", label: "Pending Review", count: 2 },
    { status: "PROFORMA_SENT", label: "Proforma Sent", count: 3 },
    { status: "APPROVED", label: "Approved", count: 0 },
    { status: "PAID", label: "Paid", count: 2 },
    { status: "IN_PRODUCTION", label: "In Production", count: 6 },
    { status: "SHIPPED", label: "Shipped", count: 5 },
    { status: "CANCELLED", label: "Cancelled", count: 0 },
  ],
  pendingActions: [],
};

describe("DashboardMetrics Component", () => {
  it("renders null when data is not provided", () => {
    const { container } = render(<DashboardMetrics data={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders 4 primary KPI cards with correct metric values", () => {
    render(<DashboardMetrics data={mockMetricsData} />);

    expect(screen.getByText("Pending Applications")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();

    expect(screen.getByText("Pending Proformas")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.getByText("Active Orders")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();

    expect(screen.getByText("30-Day Paid Revenue")).toBeInTheDocument();
    expect(screen.getByText("$4,850.00")).toBeInTheDocument();
  });

  it("renders the Orders by Status Distribution section header", () => {
    render(<DashboardMetrics data={mockMetricsData} />);
    expect(screen.getByText("Orders by Status Distribution")).toBeInTheDocument();
  });
});
