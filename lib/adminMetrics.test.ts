import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getAdminDashboardMetrics } from "@/lib/adminMetrics";
import { prisma } from "@/lib/prisma";

describe("getAdminDashboardMetrics", () => {
  let createdCompanyId: string | null = null;
  let createdOrderId: string | null = null;
  let createdAppId: string | null = null;

  beforeEach(async () => {
    // Create test company and order
    const company = await prisma.company.create({
      data: {
        name: "Test Metrics Co",
        email: `metrics-test-${Date.now()}@example.com`,
      },
    });
    createdCompanyId = company.id;

    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        status: "PENDING_REVIEW",
        totalCents: 15000,
        setupFeeCents: 5000,
        finalPriceCents: 20000,
      },
    });
    createdOrderId = order.id;

    const app = await prisma.b2bApplication.create({
      data: {
        companyName: "Test Metrics App Co",
        fullName: "Jane Metric",
        corpEmail: `app-metric-${Date.now()}@example.com`,
        status: "SUBMITTED",
      },
    });
    createdAppId = app.id;
  });

  afterEach(async () => {
    if (createdOrderId) {
      await prisma.order.delete({ where: { id: createdOrderId } }).catch(() => null);
    }
    if (createdCompanyId) {
      await prisma.company.delete({ where: { id: createdCompanyId } }).catch(() => null);
    }
    if (createdAppId) {
      await prisma.b2bApplication.delete({ where: { id: createdAppId } }).catch(() => null);
    }
  });

  it("calculates 4 key metrics and status distribution correctly", async () => {
    const metrics = await getAdminDashboardMetrics();

    expect(typeof metrics.pendingApplicationsCount).toBe("number");
    expect(metrics.pendingApplicationsCount).toBeGreaterThanOrEqual(1);

    expect(typeof metrics.pendingReviewOrdersCount).toBe("number");
    expect(metrics.pendingReviewOrdersCount).toBeGreaterThanOrEqual(1);

    expect(typeof metrics.inProductionOrdersCount).toBe("number");
    expect(typeof metrics.thirtyDaysRevenueCents).toBe("number");

    expect(Array.isArray(metrics.statusDistribution)).toBe(true);
    expect(metrics.statusDistribution.length).toBe(8);

    const pendingReviewItem = metrics.statusDistribution.find(
      (item) => item.status === "PENDING_REVIEW"
    );
    expect(pendingReviewItem).toBeDefined();
    expect(pendingReviewItem?.count).toBeGreaterThanOrEqual(1);

    expect(Array.isArray(metrics.pendingActions)).toBe(true);
    expect(metrics.pendingActions.length).toBeLessThanOrEqual(5);
  });
});
