import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface ProformaPdfData {
  refNo: string;
  orderId: string;
  companyName: string;
  companyEmail: string;
  createdAt: Date;
  validUntil: Date;
  lines: Array<{
    fabricName: string;
    size: string;
    quantity: number;
    unitPriceCents: number;
  }>;
  setupFeeCents: number;
  totalCents: number;
}

export async function generateProformaPdf(data: ProformaPdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 format
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 50;

  // Header
  page.drawText("SATRIANO ATELIER", {
    x: 50,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText("PROFORMA INVOICE", {
    x: width - 200,
    y,
    size: 16,
    font: boldFont,
    color: rgb(0.7, 0.5, 0.2),
  });
  y -= 30;

  page.drawText(`Ref No: ${data.refNo}`, { x: width - 200, y, size: 10, font });
  page.drawText(`Date: ${data.createdAt.toLocaleDateString("en-US")}`, {
    x: width - 200,
    y: y - 15,
    size: 10,
    font,
  });
  page.drawText(`Valid Until: ${data.validUntil.toLocaleDateString("en-US")}`, {
    x: width - 200,
    y: y - 30,
    size: 10,
    font,
  });

  page.drawText(`Client: ${data.companyName}`, { x: 50, y, size: 11, font: boldFont });
  page.drawText(`Email: ${data.companyEmail}`, { x: 50, y: y - 15, size: 10, font });
  page.drawText(`Order ID: ${data.orderId}`, { x: 50, y: y - 30, size: 10, font });

  y -= 70;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 20;

  // Table Headers
  page.drawText("Item / Specification", { x: 50, y, size: 10, font: boldFont });
  page.drawText("Size", { x: 280, y, size: 10, font: boldFont });
  page.drawText("Qty", { x: 340, y, size: 10, font: boldFont });
  page.drawText("Unit Price", { x: 400, y, size: 10, font: boldFont });
  page.drawText("Total", { x: 480, y, size: 10, font: boldFont });

  y -= 15;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 20;

  // Items
  for (const line of data.lines) {
    const lineTotal = (line.quantity * line.unitPriceCents) / 100;
    const unitPrice = line.unitPriceCents / 100;

    page.drawText(`Classic Polo - ${line.fabricName}`, { x: 50, y, size: 9, font });
    page.drawText(line.size, { x: 280, y, size: 9, font });
    page.drawText(line.quantity.toString(), { x: 340, y, size: 9, font });
    page.drawText(`$${unitPrice.toFixed(2)}`, { x: 400, y, size: 9, font });
    page.drawText(`$${lineTotal.toFixed(2)}`, { x: 480, y, size: 9, font });
    y -= 18;
  }

  // Setup Fee
  if (data.setupFeeCents > 0) {
    const setupFee = data.setupFeeCents / 100;
    page.drawText("Production Setup Fee", { x: 50, y, size: 9, font });
    page.drawText("-", { x: 280, y, size: 9, font });
    page.drawText("1", { x: 340, y, size: 9, font });
    page.drawText(`$${setupFee.toFixed(2)}`, { x: 400, y, size: 9, font });
    page.drawText(`$${setupFee.toFixed(2)}`, { x: 480, y, size: 9, font });
    y -= 18;
  }

  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 25;

  // Grand Total
  const grandTotal = data.totalCents / 100;
  page.drawText("TOTAL AMOUNT:", { x: 340, y, size: 11, font: boldFont });
  page.drawText(`$${grandTotal.toFixed(2)}`, {
    x: 480,
    y,
    size: 11,
    font: boldFont,
    color: rgb(0.7, 0.5, 0.2),
  });

  // Footer
  page.drawText("Thank you for choosing Satriano Atelier.", { x: 50, y: 50, size: 9, font });
  page.drawText("Satriano Atelier B2B Platform - Bespoke Manufacturing", {
    x: 50,
    y: 35,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdfDoc.save();
}
