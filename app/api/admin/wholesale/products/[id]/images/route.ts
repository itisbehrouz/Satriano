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

// POST /api/admin/wholesale/products/[id]/images — Append image(s)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized admin session" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { url, sortOrder } = body;

    if (!url) {
      return NextResponse.json({ error: "Image url is required" }, { status: 400 });
    }

    const product = await prisma.wholesaleProduct.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Wholesale product not found" }, { status: 404 });
    }

    const maxSort = product.images.reduce((max, img) => Math.max(max, img.sortOrder), 0);

    const image = await prisma.wholesaleProductImage.create({
      data: {
        wholesaleProductId: id,
        url,
        sortOrder: sortOrder ?? maxSort + 1,
      },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/wholesale/products/[id]/images error:", error);
    return NextResponse.json({ error: "Failed to append image" }, { status: 500 });
  }
}
