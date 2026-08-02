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
    const pageParam = searchParams.get("page");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");
    const sortParam = searchParams.get("sort") || "createdAt";
    const orderParam = searchParams.get("order") || "desc";

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
    const skip = limit && page ? (page - 1) * limit : undefined;

    const sortOrder = orderParam.toLowerCase() === "asc" ? "asc" : "desc";

    // Build where clause
    const where: any = {
      company: {
        email: session.email,
      },
    };

    if (statusParam && statusParam !== "ALL") {
      if (statusParam === "PAID_APPROVED") {
        where.status = { in: ["PAID", "APPROVED"] };
      } else {
        where.status = statusParam;
      }
    }

    if (searchParam && searchParam.trim() !== "") {
      const query = searchParam.trim();
      where.OR = [
        { id: { contains: query, mode: "insensitive" } },
        { proforma: { refNo: { contains: query, mode: "insensitive" } } },
        { company: { name: { contains: query, mode: "insensitive" } } },
        { lines: { some: { product: { name: { contains: query, mode: "insensitive" } } } } },
      ];
    }

    // Determine orderBy
    let orderBy: any = { createdAt: sortOrder };
    if (sortParam === "totalCents" || sortParam === "total") {
      orderBy = { totalCents: sortOrder };
    } else if (sortParam === "status") {
      orderBy = { status: sortOrder };
    } else if (sortParam === "id" || sortParam === "orderId") {
      orderBy = { id: sortOrder };
    } else if (sortParam === "createdAt" || sortParam === "date") {
      orderBy = { createdAt: sortOrder };
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        take: limit,
        skip,
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
        orderBy,
      }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;

    return NextResponse.json({
      success: true,
      email: session.email,
      orders,
      total,
      page,
      limit: limit || total,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer orders." },
      { status: 500 }
    );
  }
}
