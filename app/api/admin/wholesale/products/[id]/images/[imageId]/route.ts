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

// DELETE /api/admin/wholesale/products/[id]/images/[imageId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized admin session" }, { status: 401 });
  }

  const { id, imageId } = await params;

  try {
    const image = await prisma.wholesaleProductImage.findFirst({
      where: {
        id: imageId,
        wholesaleProductId: id,
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found for this product" }, { status: 404 });
    }

    await prisma.wholesaleProductImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error: any) {
    console.error("DELETE /api/admin/wholesale/products/[id]/images/[imageId] error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
