import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCustomerRequest } from "@/lib/customerAuth";

export async function GET(req: Request) {
  try {
    const session = await verifyCustomerRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access to customer portal orders." },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        company: {
          email: session.email,
        },
      },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, email: session.email, orders });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
