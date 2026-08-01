import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/adminAuth";
import type { OrderStatus } from "@/app/generated/prisma/enums";

export async function GET(request: Request) {
  try {
    const isAuth = await verifyAdminRequest(request);
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized access to admin orders API." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") as OrderStatus | null;

    const validStatuses: OrderStatus[] = [
      "DRAFT",
      "PENDING_REVIEW",
      "PROFORMA_SENT",
      "APPROVED",
      "PAID",
      "IN_PRODUCTION",
      "SHIPPED",
      "CANCELLED",
    ];

    const whereClause =
      statusFilter && validStatuses.includes(statusFilter)
        ? { status: statusFilter }
        : {};

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        lines: {
          include: { fabric: true },
        },
        logoAssets: true,
        proforma: true,
        payment: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch admin orders error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch orders" }, { status: 500 });
  }
}
