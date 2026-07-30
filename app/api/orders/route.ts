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

  const { fabricId, companyName, companyEmail, sizeQuantities, logoUrl, logoPlacement } = validation.data;

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
      status: "DRAFT",
      setupFeeCents: pricing.setupFeeCents,
      totalCents: pricing.totalCents,
      lines: {
        create: pricing.lineItems.map((line) => ({
          fabricId: fabric.id,
          size: line.size,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
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

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
