import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/adminAuth";

export async function GET(request: Request) {
  try {
    const isAuth = await verifyAdminRequest(request);
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized access to admin metrics API." },
        { status: 401 }
      );
    }

    const [
      totalOrders,
      pendingReviewOrders,
      proformaSentOrders,
      inProductionOrders,
      shippedOrders,
      paidRevenueAggregate,
      pendingApplicationsCount,
      recentPendingOrders,
      recentPendingApps,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.order.count({ where: { status: "PROFORMA_SENT" } }),
      prisma.order.count({ where: { status: "IN_PRODUCTION" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.aggregate({
        where: {
          status: { in: ["PAID", "IN_PRODUCTION", "SHIPPED"] },
        },
        _sum: {
          totalCents: true,
          setupFeeCents: true,
        },
      }),
      prisma.b2bApplication.count({
        where: {
          status: "SUBMITTED",
        },
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
        where: { status: "SUBMITTED" },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPaidCents =
      (paidRevenueAggregate._sum.totalCents || 0) +
      (paidRevenueAggregate._sum.setupFeeCents || 0);

    // Format pending actions list
    const orderActions = recentPendingOrders.map((ord) => ({
      id: ord.id,
      type: "ORDER",
      title: `Order #${ord.id.slice(-6).toUpperCase()}`,
      client: ord.company.name,
      email: ord.company.email,
      actionNeeded: "Review Spec & Issue Proforma",
      amountCents: ord.totalCents + ord.setupFeeCents,
      status: ord.status,
      createdAt: ord.createdAt,
      link: `/admin?status=PENDING_REVIEW`,
    }));

    const appActions = recentPendingApps.map((app) => ({
      id: app.id,
      type: "APPLICATION",
      title: app.companyName,
      client: app.fullName,
      email: app.corpEmail,
      actionNeeded: "Verify Corporate B2B Account",
      amountCents: null,
      status: app.status,
      createdAt: app.createdAt,
      link: `/admin/applications?status=SUBMITTED`,
    }));

    const combinedActions = [...orderActions, ...appActions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return NextResponse.json({
      metrics: {
        totalOrders,
        pendingReviewOrders,
        proformaSentOrders,
        inProductionOrders,
        shippedOrders,
        totalPaidCents,
        pendingApplications: pendingApplicationsCount,
        pendingActions: combinedActions,
      },
    });
  } catch (error) {
    console.error("Fetch admin metrics error:", error);
    return NextResponse.json(
      { error: "Failed to load operational metrics." },
      { status: 500 }
    );
  }
}
