import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeOrderPricing } from "@/lib/pricing";
import { validateCreateOrderInput } from "@/lib/orderValidation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = validateCreateOrderInput(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const {
    fabricId,
    companyName,
    companyEmail,
    sizeQuantities,
    customerTargetPriceCents,
    logoUrl,
    logoPlacement,
  } = validation.data;

  const fabric = await prisma.fabric.findUnique({ where: { id: fabricId } });
  if (!fabric || !fabric.active) {
    return NextResponse.json({ error: "Fabric not found" }, { status: 404 });
  }

  const pricing = computeOrderPricing({ fabric, sizeQuantities });
  if (pricing.totalUnits === 0) {
    return NextResponse.json(
      { error: "Order must include at least one unit" },
      { status: 400 },
    );
  }

  const company = await prisma.company.upsert({
    where: { email: companyEmail },
    update: { name: companyName },
    create: { name: companyName, email: companyEmail },
  });

  const order = await prisma.order.create({
    data: {
      companyId: company.id,
      status: "PENDING_REVIEW",
      setupFeeCents: pricing.setupFeeCents,
      totalCents: 0, // Set to 0 until admin feasibility review sets finalPriceCents
      customerTargetPriceCents: customerTargetPriceCents || null,
      lines: {
        create: pricing.lineItems.map((line) => ({
          fabricId: fabric.id,
          size: line.size,
          quantity: line.quantity,
          unitPriceCents: line.priceMinCents, // Store min range as reference
        })),
      },
      ...(logoUrl
        ? {
            logoAssets: {
              create: {
                storageUrl: logoUrl,
                placement: logoPlacement || "LEFT_CHEST",
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ orderId: order.id, status: order.status }, { status: 201 });
}
