import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    
    const audits = await prisma.inventoryAudit.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json({ audits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
