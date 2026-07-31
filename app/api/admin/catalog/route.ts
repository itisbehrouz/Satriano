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
            fabrics: true,
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

    return NextResponse.json({ categories, sizeSystems });
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
          ...(typeof data.leadTimeDays === "number" ? { leadTimeDays: data.leadTimeDays } : {}),
          ...(typeof data.moq === "number" ? { moq: data.moq } : {}),
        },
      });
      return NextResponse.json({ success: true, subcategory: updated });
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
