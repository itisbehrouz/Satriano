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

// GET /api/admin/wholesale/products/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized admin session" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const product = await prisma.wholesaleProduct.findUnique({
      where: { id },
      include: {
        supplier: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        stock: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Wholesale product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("GET /api/admin/wholesale/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch wholesale product" }, { status: 500 });
  }
}

// PATCH /api/admin/wholesale/products/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized admin session" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      name,
      sku,
      description,
      gender,
      ageGroup,
      costPriceCents,
      markupPercent,
      sellPriceCents,
      status,
      stock,
    } = body;

    const existing = await prisma.wholesaleProduct.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Wholesale product not found" }, { status: 404 });
    }

    if (sku && sku !== existing.sku) {
      const duplicate = await prisma.wholesaleProduct.findUnique({
        where: { sku },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `SKU '${sku}' is already taken.` },
          { status: 409 }
        );
      }
    }

    const calculatedSellPrice = costPriceCents !== undefined && markupPercent !== undefined
      ? Math.round(costPriceCents * (1 + markupPercent / 100))
      : sellPriceCents;

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.wholesaleProduct.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(sku && { sku }),
          ...(description !== undefined && { description }),
          ...(gender !== undefined && { gender }),
          ...(ageGroup !== undefined && { ageGroup }),
          ...(costPriceCents !== undefined && { costPriceCents }),
          ...(markupPercent !== undefined && { markupPercent }),
          ...(calculatedSellPrice !== undefined && { sellPriceCents: calculatedSellPrice }),
          ...(status && { status }),
        },
        include: {
          supplier: true,
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          stock: true,
        },
      });

      if (Array.isArray(stock)) {
        for (const stk of stock) {
          await tx.wholesaleStock.upsert({
            where: {
              wholesaleProductId_size: {
                wholesaleProductId: id,
                size: stk.size,
              },
            },
            create: {
              wholesaleProductId: id,
              size: stk.size,
              quantity: stk.quantity ?? 0,
              lowStockThreshold: stk.lowStockThreshold ?? 3,
            },
            update: {
              quantity: stk.quantity ?? 0,
              ...(stk.lowStockThreshold !== undefined && {
                lowStockThreshold: stk.lowStockThreshold,
              }),
            },
          });
        }
      }

      return prod;
    });

    return NextResponse.json({ product: updated });
  } catch (error: any) {
    console.error("PATCH /api/admin/wholesale/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/wholesale/products/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized admin session" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const product = await prisma.wholesaleProduct.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("DELETE /api/admin/wholesale/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
