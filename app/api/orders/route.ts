import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeOrderPricing } from "@/lib/pricing";
import { validateCreateOrderInput } from "@/lib/orderValidation";
import { validateOrderMoq, MoqValidationItem } from "@/lib/moqValidation";

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

  const dbLines: any[] = [];
  const logoAssets: any[] = [];
  const moqItems: MoqValidationItem[] = [];

  for (const item of items) {
    const { fabricId, colorId, productId, fitId, sizeQuantities, logoUrl, logoPlacement } = item;
    
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
    const requiredMoqPerColor = fabric.moqPerColor ?? 20;
    const fabricName = fabric.name || product?.name || "this item";

    let selectedColorName: string | undefined = undefined;
    if (colorId) {
      const colorRecord = await prisma.fabricColor.findUnique({ where: { id: colorId } });
      if (colorRecord) {
        selectedColorName = colorRecord.name;
      }
    }

    const pricing = computeOrderPricing({ fabric, sizeQuantities });
    if (pricing.totalUnits === 0) {
      return NextResponse.json(
        { error: "Each configuration must include at least one unit" },
        { status: 400 },
      );
    }

    moqItems.push({
      fabricId: fabric.id,
      fabricName,
      colorId: colorId || null,
      colorName: selectedColorName || null,
      quantity: pricing.totalUnits,
      moqPerFabric: requiredMoqPerFabric,
      moqPerColor: requiredMoqPerColor,
    });

    let selectedFitName: string | undefined = undefined;
    if (fitId) {
      const fitRecord = await prisma.fit.findUnique({ where: { id: fitId } });
      if (fitRecord) {
        selectedFitName = fitRecord.name;
      }
    }

    for (const line of pricing.lineItems) {
      dbLines.push({
        fabricId: fabric.id,
        colorId: colorId || null,
        selectedColor: selectedColorName || null,
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

  // Validate two-threshold MOQ requirements across order payload
  const moqResult = validateOrderMoq(moqItems);
  if (!moqResult.valid) {
    return NextResponse.json({ error: moqResult.error }, { status: 400 });
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
      setupFeeCents: 0,
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
