import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/adminAuth";

export async function POST(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fabricId = searchParams.get("fabricId");

  if (!fabricId) {
    return NextResponse.json({ error: "fabricId parameter is required" }, { status: 400 });
  }

  try {
    const result = await prisma.fabricColor.deleteMany({
      where: {
        fabricId,
        source: "PLACEHOLDER",
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Failed to clear placeholder colors:", error);
    return NextResponse.json({ error: "Failed to clear placeholder colors" }, { status: 500 });
  }
}
