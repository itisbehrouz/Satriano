import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCustomerRequest } from "@/lib/customerAuth";

export async function GET(req: Request) {
  try {
    const session = await verifyCustomerRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access to customer orders." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const sortParam = searchParams.get("sort") || "createdAt";
    const orderParam = searchParams.get("order") || "desc";

    const take = limitParam ? parseInt(limitParam, 10) : undefined;
    const sortField = sortParam === "createdAt" ? "createdAt" : "createdAt";
    const sortOrder = orderParam === "asc" ? "asc" : "desc";

    const orders = await prisma.order.findMany({
      where: {
        company: {
          email: session.email,
        },
      },
      take,
      include: {
        company: true,
        lines: {
          include: {
            product: true,
            fabric: true,
            fit: true,
          },
        },
        proforma: true,
      },
      orderBy: { [sortField]: sortOrder },
    });

    return NextResponse.json({ success: true, email: session.email, orders });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer orders." },
      { status: 500 }
    );
  }
}
