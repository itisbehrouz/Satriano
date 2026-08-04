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
    companyName,
    companyEmail,
    customerTargetPriceCents,
    items,
  } = validation.data;

  // Calculate pricing and validate MOQs for each item
  let totalOrderSetupFeeCents = 0;
  const dbLines: any[] = [];
  const logoAssets: any[] = [];

  for (const item of items) {
    const { fabricId, productId, fitId, sizeQuantities, logoUrl, logoPlacement } = item;
    
    const fabric = await prisma.fabric.findUnique({
      where: { id: fabricId },
      include: { product: true },
    });
    if (!fabric || !fabric.active) {
      return NextResponse.json({ error: `Fabric not found (ID: ${fabricId})` }, { status: 404 });
    }

    let product = fabric.product;
    if (!product && productId) {
      product = await prisma.product.findUnique({ where: { id: productId } }) || null;
    }

    const requiredMoqPerFabric = product?.moqPerFabric ?? product?.moq ?? 50;
    const productName = product?.name || "this item";

    const pricing = computeOrderPricing({ fabric, sizeQuantities });
    if (pricing.totalUnits === 0) {
      return NextResponse.json(
        { error: "Each configuration must include at least one unit" },
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
    if (fitId) {
      const fitRecord = await prisma.fit.findUnique({ where: { id: fitId } });
      if (fitRecord) {
        selectedFitName = fitRecord.name;
      }
    }

    // Accumulate total setup fee across all configurations in the cart
    totalOrderSetupFeeCents += pricing.setupFeeCents;

    for (const line of pricing.lineItems) {
      dbLines.push({
        fabricId: fabric.id,
        productId: product?.id || null,
        fitId: fitId || null,
        selectedFit: selectedFitName || null,
        size: line.size,
        quantity: line.quantity,
        unitPriceCents: line.priceMinCents,
      });
    }

    if (logoUrl) {
      logoAssets.push({
        storageUrl: logoUrl,
        placement: logoPlacement || "LEFT_CHEST",
      });
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
      setupFeeCents: totalOrderSetupFeeCents,
      totalCents: 0, // Set to 0 until admin feasibility review sets finalPriceCents
      customerTargetPriceCents: customerTargetPriceCents || null,
      lines: {
        create: dbLines,
      },
      ...(logoAssets.length > 0
        ? {
            logoAssets: {
              create: logoAssets,
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ orderId: order.id, status: order.status }, { status: 201 });
}
