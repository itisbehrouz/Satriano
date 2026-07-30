import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/app/generated/prisma/enums";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json().catch(() => null);

    if (!body || !body.status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const validStatuses: OrderStatus[] = [
      "DRAFT",
      "PROFORMA_SENT",
      "APPROVED",
      "PAID",
      "IN_PRODUCTION",
    ];

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: body.status },
      include: {
        company: true,
        lines: { include: { fabric: true } },
        logoAssets: true,
        proforma: true,
        payment: true,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
