import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeOrderPricing } from "@/lib/pricing";
import { validateCreateOrderInput, validateCreateOrderInputMultiMaterial } from "@/lib/orderValidation";
import { validateOrderMoq, validateMultiMaterialMoq, MoqValidationItem, MultiMaterialMoqItem } from "@/lib/moqValidation";
import type { MaterialComponent } from "@/app/generated/prisma/client";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Detect if this is a multi-material order payload
  const isMultiMaterial = Array.isArray(body.items) && body.items[0]?.materials && Array.isArray(body.items[0].materials);

  if (isMultiMaterial) {
    const validation = validateCreateOrderInputMultiMaterial(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json({ error: validation.error || "Invalid multi-material order payload" }, { status: 400 });
    }

    const input = validation.data;
    const multiMaterialItems: MultiMaterialMoqItem[] = [];
    const orderLinesToCreate: any[] = [];
    let combinedMoqThreshold: number | undefined = undefined;

    for (const item of input.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found (ID: ${item.productId})` }, { status: 404 });
      }

      if (product.moqCombinedMultiFabric) {
        combinedMoqThreshold = Math.max(combinedMoqThreshold ?? 0, product.moqCombinedMultiFabric);
      }

      let selectedFitName: string | undefined = undefined;
      if (item.selectedFit) {
        const fitRecord = await prisma.fit.findFirst({
          where: { OR: [{ id: item.selectedFit }, { code: item.selectedFit }, { name: item.selectedFit }] },
        });
        if (fitRecord) {
          selectedFitName = fitRecord.name;
        }
      }

      for (const material of item.materials) {
        const fabric = await prisma.fabric.findUnique({
          where: { id: material.materialId },
        });

        if (!fabric || !fabric.active) {
          return NextResponse.json({ error: `Material fabric not found (ID: ${material.materialId})` }, { status: 404 });
        }

        let colorName: string | undefined = undefined;
        if (material.colorId) {
          const colorRecord = await prisma.fabricColor.findUnique({ where: { id: material.colorId } });
          if (colorRecord) {
            colorName = colorRecord.name;
          }
        }

        const totalMatQuantity = material.sizeQuantities.reduce((sum, sq) => sum + sq.quantity, 0);
        if (totalMatQuantity <= 0) {
          return NextResponse.json({ error: `Material ${material.materialId} must have quantity > 0` }, { status: 400 });
        }

        multiMaterialItems.push({
          materialId: fabric.id,
          materialName: fabric.name,
          colorId: material.colorId || null,
          colorName: colorName || null,
          component: material.component,
          quantity: totalMatQuantity,
          ratio: material.ratio,
          moqPerFabric: fabric.moqPerColor ? 50 : (product.moqPerFabric ?? 50),
          moqPerColor: fabric.moqPerColor ?? 20,
        });

        for (const sq of material.sizeQuantities) {
          orderLinesToCreate.push({
            productId: product.id,
            fabricId: fabric.id,
            colorId: material.colorId || null,
            selectedColor: colorName || null,
            selectedFit: selectedFitName || item.selectedFit || null,
            size: sq.size,
            quantity: sq.quantity,
            unitPriceCents: fabric.priceMinCents || 0,
            materials: {
              create: [
                {
                  materialId: fabric.id,
                  colorId: material.colorId || null,
                  component: (material.component as MaterialComponent) || "MAIN_FABRIC",
                  composition: material.composition || null,
                  ratio: material.ratio || null,
                },
              ],
            },
          });
        }
      }
    }

    const moqResult = validateMultiMaterialMoq(multiMaterialItems, {
      combinedMultiFabricMoq: combinedMoqThreshold,
    });

    if (!moqResult.valid) {
      return NextResponse.json({ error: moqResult.error }, { status: 400 });
    }

    const company = await prisma.company.upsert({
      where: { email: input.companyEmail },
      update: { name: input.companyName },
      create: { name: input.companyName, email: input.companyEmail },
    });

    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        orderType: "M2O",
        status: "PENDING_REVIEW",
        customerTargetPriceCents: input.customerTargetPriceCents ?? 0,
        totalCents: 0,
        lines: {
          create: orderLinesToCreate,
        },
      },
    });

    return NextResponse.json({ orderId: order.id, status: order.status }, { status: 201 });
  }

  // SINGLE-FABRIC LEGACY PATH
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
