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
      pendingApplications,
      recentOrders,
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
          status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    const totalPaidCents =
      (paidRevenueAggregate._sum.totalCents || 0) +
      (paidRevenueAggregate._sum.setupFeeCents || 0);

    return NextResponse.json({
      metrics: {
        totalOrders,
        pendingReviewOrders,
        proformaSentOrders,
        inProductionOrders,
        shippedOrders,
        totalPaidCents,
        pendingApplications,
        recentOrders: recentOrders.map((ord) => ({
          id: ord.id,
          companyName: ord.company.name,
          corpEmail: ord.company.email,
          status: ord.status,
          totalCents: ord.totalCents + ord.setupFeeCents,
          createdAt: ord.createdAt,
        })),
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
