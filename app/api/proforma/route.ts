import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateProformaPdf } from "@/lib/pdfGenerator";
import { sendProformaEmail } from "@/lib/email";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.orderId !== "string" || !body.orderId.trim()) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const orderId = body.orderId.trim();
    const inputFinalPriceCents =
      typeof body.finalPriceCents === "number" && body.finalPriceCents > 0
        ? Math.round(body.finalPriceCents)
        : null;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        company: true,
        lines: {
          include: { fabric: true },
        },
        proforma: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const finalPriceCents = inputFinalPriceCents ?? order.finalPriceCents;
    if (!finalPriceCents || finalPriceCents <= 0) {
      return NextResponse.json(
        { error: "finalPriceCents is required before generating proforma" },
        { status: 400 }
      );
    }

    const totalUnits = order.lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotalCents = totalUnits * finalPriceCents;
    const totalCents = subtotalCents + order.setupFeeCents;

    const refNo =
      order.proforma?.refNo ||
      `PRO-${new Date().getFullYear()}-${order.id.slice(-6).toUpperCase()}`;
    const validUntil = new Date(Date.now() + 30 * 86400 * 1000);

    // Generate PDF with finalized unit price
    const pdfUint8Array = await generateProformaPdf({
      refNo,
      orderId: order.id,
      companyName: order.company.name,
      companyEmail: order.company.email,
      createdAt: order.createdAt,
      validUntil,
      lines: order.lines.map((line) => ({
        fabricName: line.fabric.name,
        size: line.size,
        quantity: line.quantity,
        unitPriceCents: finalPriceCents,
      })),
      setupFeeCents: order.setupFeeCents,
      totalCents,
    });

    const pdfBuffer = Buffer.from(pdfUint8Array);

    // Save PDF to public/proformas directory
    const proformaDir = path.join(process.cwd(), "public", "proformas");
    await mkdir(proformaDir, { recursive: true });
    const filename = `${refNo}.pdf`;
    const filePath = path.join(proformaDir, filename);
    await writeFile(filePath, pdfBuffer);

    const pdfUrl = `/proformas/${filename}`;

    // Send Email
    await sendProformaEmail({
      to: order.company.email,
      companyName: order.company.name,
      refNo,
      pdfBuffer,
    });

    // Update DB: Update order status to PROFORMA_SENT, finalPriceCents, totalCents, and upsert Proforma record
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PROFORMA_SENT",
          finalPriceCents,
          totalCents,
        },
      }),
      prisma.proforma.upsert({
        where: { orderId: order.id },
        update: {
          pdfUrl,
          sentAt: new Date(),
          validUntil,
        },
        create: {
          orderId: order.id,
          refNo,
          pdfUrl,
          sentAt: new Date(),
          validUntil,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      refNo,
      orderId: order.id,
      finalPriceCents,
      totalCents,
      pdfUrl,
      status: "PROFORMA_SENT",
    });
  } catch (error) {
    console.error("Proforma generation error:", error);
    return NextResponse.json({ error: "Failed to generate proforma" }, { status: 500 });
  }
}
