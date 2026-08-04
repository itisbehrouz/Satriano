import { prisma } from "@/lib/prisma";

export interface StatusDistributionItem {
  status: string;
  label: string;
  count: number;
}

export interface DashboardMetricsData {
  pendingApplicationsCount: number;
  pendingReviewOrdersCount: number;
  inProductionOrdersCount: number;
  thirtyDaysRevenueCents: number;
  statusDistribution: StatusDistributionItem[];
  pendingActions: Array<{
    id: string;
    type: "ORDER" | "APPLICATION";
    title: string;
    client: string;
    email: string;
    actionNeeded: string;
    amountCents: number | null;
    status: string;
    createdAt: string;
    link: string;
  }>;
}

const ALL_STATUSES: Array<{ status: string; label: string }> = [
  { status: "DRAFT", label: "Draft" },
  { status: "PENDING_REVIEW", label: "Pending Review" },
  { status: "PROFORMA_SENT", label: "Proforma Sent" },
  { status: "APPROVED", label: "Approved" },
  { status: "PAID", label: "Paid" },
  { status: "IN_PRODUCTION", label: "In Production" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "CANCELLED", label: "Cancelled" },
];

export async function getAdminDashboardMetrics(): Promise<DashboardMetricsData> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    pendingApplicationsCount,
    pendingReviewOrdersCount,
    inProductionOrdersCount,
    revenueAggregate,
    statusGroup,
    recentPendingOrders,
    recentPendingApps,
  ] = await Promise.all([
    prisma.b2bApplication.count({
      where: { status: { in: ["UNDER_REVIEW", "SUBMITTED"] } },
    }),
    prisma.order.count({
      where: { status: "PENDING_REVIEW" },
    }),
    prisma.order.count({
      where: { status: "IN_PRODUCTION" },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: ["PAID", "SHIPPED"] },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: {
        finalPriceCents: true,
        totalCents: true,
        setupFeeCents: true,
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { status: "PENDING_REVIEW" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.b2bApplication.findMany({
      where: { status: { in: ["UNDER_REVIEW", "SUBMITTED"] } },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Calculate 30-day sum: prefer finalPriceCents, fallback to totalCents
  const thirtyDaysRevenueCents =
    revenueAggregate._sum.finalPriceCents ?? (revenueAggregate._sum.totalCents || 0);

  // Map status counts to complete distribution array
  const countMap = new Map<string, number>();
  statusGroup.forEach((item) => {
    countMap.set(item.status, item._count._all);
  });

  const statusDistribution: StatusDistributionItem[] = ALL_STATUSES.map((item) => ({
    status: item.status,
    label: item.label,
    count: countMap.get(item.status) || 0,
  }));

  // Format pending actions list
  const orderActions = recentPendingOrders.map((ord) => ({
    id: ord.id,
    type: "ORDER" as const,
    title: `Order #${ord.id.slice(-6).toUpperCase()}`,
    client: ord.company.name,
    email: ord.company.email,
    actionNeeded: "Review Spec & Issue Proforma",
    amountCents: ord.finalPriceCents ?? ord.totalCents,
    status: ord.status,
    createdAt: ord.createdAt.toISOString(),
    link: `/admin?status=PENDING_REVIEW`,
  }));

  const appActions = recentPendingApps.map((app) => ({
    id: app.id,
    type: "APPLICATION" as const,
    title: app.companyName,
    client: app.fullName,
    email: app.corpEmail,
    actionNeeded: "Verify Corporate B2B Account",
    amountCents: null,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
    link: `/admin/applications?status=SUBMITTED`,
  }));

  const pendingActions = [...orderActions, ...appActions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return {
    pendingApplicationsCount,
    pendingReviewOrdersCount,
    inProductionOrdersCount,
    thirtyDaysRevenueCents,
    statusDistribution,
    pendingActions,
  };
}
