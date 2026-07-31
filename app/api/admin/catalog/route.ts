import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/adminAuth";

export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            sizeSystems: {
              include: {
                sizeSystem: {
                  include: {
                    options: { orderBy: { sortOrder: "asc" } },
                  },
                },
              },
            },
            products: {
              include: {
                fabrics: true,
                fits: {
                  include: { fit: true },
                },
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const sizeSystems = await prisma.sizeSystem.findMany({
      include: {
        options: { orderBy: { sortOrder: "asc" } },
      },
    });

    const allFits = await prisma.fit.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories, sizeSystems, fits: allFits });
  } catch (error) {
    console.error("Failed to fetch admin catalog", error);
    return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { target, id, data } = body;

    if (target === "subcategory" && typeof id === "string") {
      const updated = await prisma.subcategory.update({
        where: { id },
        data: {
          ...(typeof data.active === "boolean" ? { active: data.active } : {}),
        },
      });
      return NextResponse.json({ success: true, subcategory: updated });
    }

    if (target === "product" && typeof id === "string") {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(typeof data.active === "boolean" ? { active: data.active } : {}),
          ...(typeof data.leadTimeDays === "number" ? { leadTimeDays: data.leadTimeDays } : {}),
          ...(typeof data.moq === "number" ? { moq: data.moq } : {}),
          ...(typeof data.moqPerFabric === "number" ? { moqPerFabric: data.moqPerFabric } : {}),
          ...(data.moqCombinedMultiFabric === null || typeof data.moqCombinedMultiFabric === "number"
            ? { moqCombinedMultiFabric: data.moqCombinedMultiFabric }
            : {}),
        },
      });
      return NextResponse.json({ success: true, product: updated });
    }

    if (target === "productFits" && typeof id === "string" && Array.isArray(data.fitIds)) {
      // Clear existing product fit links
      await prisma.productFit.deleteMany({
        where: { productId: id },
      });

      // Insert selected fit links
      if (data.fitIds.length > 0) {
        await prisma.productFit.createMany({
          data: data.fitIds.map((fitId: string) => ({
            productId: id,
            fitId,
          })),
        });
      }
      return NextResponse.json({ success: true });
    }

    if (target === "fabric" && typeof id === "string") {
      const updated = await prisma.fabric.update({
        where: { id },
        data: {
          ...(typeof data.active === "boolean" ? { active: data.active } : {}),
          ...(typeof data.priceMinCents === "number" ? { priceMinCents: data.priceMinCents } : {}),
          ...(typeof data.priceMaxCents === "number" ? { priceMaxCents: data.priceMaxCents } : {}),
          ...(typeof data.setupFeeCents === "number" ? { setupFeeCents: data.setupFeeCents } : {}),
        },
      });
      return NextResponse.json({ success: true, fabric: updated });
    }

    return NextResponse.json({ error: "Invalid target or id" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update catalog item", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
