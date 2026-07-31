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

  const rawFitId = body?.fitId as string | undefined;
  const rawProductId = body?.productId as string | undefined;

  const fabric = await prisma.fabric.findUnique({
    where: { id: fabricId },
    include: { product: true },
  });
  if (!fabric || !fabric.active) {
    return NextResponse.json({ error: "Fabric not found" }, { status: 404 });
  }

  // Determine Product and per-fabric MOQ
  let product = fabric.product;
  if (!product && rawProductId) {
    product = await prisma.product.findUnique({ where: { id: rawProductId } });
  }

  const requiredMoqPerFabric = product?.moqPerFabric ?? product?.moq ?? 50;
  const productName = product?.name || "this item";

  const pricing = computeOrderPricing({ fabric, sizeQuantities });
  if (pricing.totalUnits === 0) {
    return NextResponse.json(
      { error: "Order must include at least one unit" },
      { status: 400 },
    );
  }

  if (pricing.totalUnits < requiredMoqPerFabric) {
    return NextResponse.json(
      {
        error: `Minimum order quantity for ${productName} in this fabric selection is ${requiredMoqPerFabric} units.`,
      },
      { status: 400 },
    );
  }

  let selectedFitName: string | undefined = undefined;
  if (rawFitId) {
    const fitRecord = await prisma.fit.findUnique({ where: { id: rawFitId } });
    if (fitRecord) {
      selectedFitName = fitRecord.name;
    }
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
          productId: product?.id || null,
          fitId: rawFitId || null,
          selectedFit: selectedFitName || null,
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
