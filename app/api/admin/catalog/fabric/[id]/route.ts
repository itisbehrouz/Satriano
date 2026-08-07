import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "");

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 });
    }

    const body = await request.json();
    const { priceMinCents, priceMaxCents, moqPerColor } = body;

    if (priceMinCents === undefined || priceMaxCents === undefined || moqPerColor === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (priceMinCents > priceMaxCents) {
      return NextResponse.json({ error: "Minimum price cannot exceed maximum price" }, { status: 400 });
    }

    const fabric = await prisma.fabric.update({
      where: { id },
      data: {
        priceMinCents,
        priceMaxCents,
        moqPerColor,
      },
    });

    return NextResponse.json(fabric);
  } catch (error: any) {
    console.error("Error updating fabric:", error);
    return NextResponse.json({ error: error.message || "Failed to update fabric" }, { status: 500 });
  }
}
