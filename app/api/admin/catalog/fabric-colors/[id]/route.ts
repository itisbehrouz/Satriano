import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/adminAuth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const color = await prisma.fabricColor.findUnique({ where: { id } });
    if (!color) {
      return NextResponse.json({ error: "Fabric color not found" }, { status: 404 });
    }

    const { name, hex, source, active, sortOrder } = body;

    const dataToUpdate: Record<string, unknown> = {};

    if (typeof name === "string" && name.trim()) {
      const cleanName = name.trim();
      if (cleanName !== color.name) {
        const existing = await prisma.fabricColor.findUnique({
          where: {
            fabricId_name: {
              fabricId: color.fabricId,
              name: cleanName,
            },
          },
        });
        if (existing) {
          return NextResponse.json(
            { error: `Color '${cleanName}' already exists for this fabric.` },
            { status: 409 }
          );
        }
        dataToUpdate.name = cleanName;
      }
    }

    if (typeof hex === "string" || hex === null) {
      dataToUpdate.hex = typeof hex === "string" && hex.trim() ? hex.trim() : null;
    }

    if (source === "PLACEHOLDER" || source === "SUPPLIER_VERIFIED" || source === "MANUAL") {
      dataToUpdate.source = source;
    }

    if (typeof active === "boolean") {
      dataToUpdate.active = active;
    }

    if (typeof sortOrder === "number") {
      dataToUpdate.sortOrder = sortOrder;
    }

    const updated = await prisma.fabricColor.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, color: updated });
  } catch (error) {
    console.error("Failed to update fabric color:", error);
    return NextResponse.json({ error: "Failed to update fabric color" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  try {
    const color = await prisma.fabricColor.findUnique({ where: { id } });
    if (!color) {
      return NextResponse.json({ error: "Fabric color not found" }, { status: 404 });
    }

    const orderLineCount = await prisma.orderLine.count({
      where: { colorId: id },
    });

    if (orderLineCount > 0 && !force) {
      return NextResponse.json(
        {
          error: "Color is referenced in existing orders.",
          orderLineCount,
          requiresConfirmation: true,
        },
        { status: 409 }
      );
    }

    await prisma.fabricColor.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Failed to delete fabric color:", error);
    return NextResponse.json({ error: "Failed to delete fabric color" }, { status: 500 });
  }
}
