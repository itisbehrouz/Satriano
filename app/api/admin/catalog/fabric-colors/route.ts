import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/adminAuth";

export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fabricId = searchParams.get("fabricId");

  if (!fabricId) {
    return NextResponse.json({ error: "fabricId parameter is required" }, { status: 400 });
  }

  try {
    const colors = await prisma.fabricColor.findMany({
      where: { fabricId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ colors });
  } catch (error) {
    console.error("Failed to fetch fabric colors:", error);
    return NextResponse.json({ error: "Failed to fetch fabric colors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { fabricId, name, hex, source } = body;

    if (!fabricId || typeof fabricId !== "string" || !name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "fabricId and name are required" }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanHex = typeof hex === "string" && hex.trim() ? hex.trim() : null;
    const cleanSource = source === "SUPPLIER_VERIFIED" || source === "PLACEHOLDER" ? source : "MANUAL";

    const fabric = await prisma.fabric.findUnique({ where: { id: fabricId } });
    if (!fabric) {
      return NextResponse.json({ error: "Fabric not found" }, { status: 404 });
    }

    const existing = await prisma.fabricColor.findUnique({
      where: {
        fabricId_name: {
          fabricId,
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

    const maxSortOrderColor = await prisma.fabricColor.findFirst({
      where: { fabricId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const nextSortOrder = (maxSortOrderColor?.sortOrder ?? -1) + 1;

    const color = await prisma.fabricColor.create({
      data: {
        fabricId,
        name: cleanName,
        hex: cleanHex,
        source: cleanSource,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json({ success: true, color }, { status: 201 });
  } catch (error) {
    console.error("Failed to create fabric color:", error);
    return NextResponse.json({ error: "Failed to create fabric color" }, { status: 500 });
  }
}
