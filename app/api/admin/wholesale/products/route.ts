import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  try {
    const token = req.cookies.get("sat_admin_token")?.value;
    if (!token || !ADMIN_JWT_SECRET) return false;
    const secret = new TextEncoder().encode(ADMIN_JWT_SECRET);
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

// GET /api/admin/wholesale/products
// Filters: supplierId, categoryId, status
export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized admin session" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const supplierId = searchParams.get("supplierId");
  const categoryId = searchParams.get("categoryId");
  const status = searchParams.get("status");

  const where: any = {};
  if (supplierId) where.supplierId = supplierId;
  if (categoryId) where.categoryId = categoryId;
  if (status && status !== "ALL") where.status = status;

  try {
    const products = await prisma.wholesaleProduct.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            firmName: true,
            contactPerson: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        stock: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("GET /api/admin/wholesale/products error:", error);
    return NextResponse.json({ error: "Failed to fetch wholesale products" }, { status: 500 });
  }
}

// POST /api/admin/wholesale/products
export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized admin session" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      supplierId,
      categoryId,
      name,
      sku,
      description,
      costPriceCents,
      markupPercent,
      sellPriceCents,
      status,
      images,
      stock,
    } = body;

    // 1. Basic field validations
    if (!name || !sku || !supplierId || !categoryId) {
      return NextResponse.json(
        { error: "Product name, SKU, supplierId, and categoryId are required." },
        { status: 400 }
      );
    }

    if (costPriceCents === undefined || costPriceCents <= 0) {
      return NextResponse.json(
        { error: "Cost price (costPriceCents) must be greater than 0." },
        { status: 400 }
      );
    }

    if (!Array.isArray(stock) || stock.length === 0) {
      return NextResponse.json(
        { error: "At least one size row is required in the stock array." },
        { status: 400 }
      );
    }

    // 2. Reject if SKU already exists
    const existingSku = await prisma.wholesaleProduct.findUnique({
      where: { sku },
    });
    if (existingSku) {
      return NextResponse.json(
        { error: `SKU '${sku}' already exists in wholesale catalog.` },
        { status: 409 }
      );
    }

    // 3. Reject if supplierId doesn't resolve to an existing supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier) {
      return NextResponse.json(
        { error: `Supplier with ID '${supplierId}' not found.` },
        { status: 400 }
      );
    }

    if (supplier.status === "PENDING_VERIFICATION") {
      return NextResponse.json(
        { error: `Supplier '${supplier.firmName}' is pending verification and cannot be attached to new products.` },
        { status: 400 }
      );
    }

    // Computed sell price fallback if not passed
    const computedSellPrice =
      sellPriceCents !== undefined
        ? sellPriceCents
        : Math.round(costPriceCents * (1 + (markupPercent || 35.0) / 100));

    // 4. Create in a single Prisma transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      const created = await tx.wholesaleProduct.create({
        data: {
          supplierId,
          categoryId,
          name,
          sku,
          description: description || null,
          costPriceCents,
          markupPercent: markupPercent || 35.0,
          sellPriceCents: computedSellPrice,
          status: status || "ACTIVE",
          images: {
            create: (images || []).map((img: any, idx: number) => ({
              url: img.url,
              sortOrder: img.sortOrder ?? idx,
            })),
          },
          stock: {
            create: stock.map((stk: any) => ({
              size: stk.size,
              quantity: stk.quantity ?? 0,
              lowStockThreshold: stk.lowStockThreshold ?? 3,
            })),
          },
        },
        select: {
          id: true,
          sku: true,
          name: true,
          status: true,
          costPriceCents: true,
          sellPriceCents: true,
          createdAt: true,
        },
      });

      return created;
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/wholesale/products error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
