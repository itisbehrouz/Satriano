# AGENT 4 — PROFORMA PDF & INVENTORY DEDUCTION

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Update Proforma PDF generator to display multi-material component specifications. Implement automatic inventory deduction on Stripe payment webhook success with transactional safety guarantees.

**Scope:** PDF generation engine updates, webhook inventory logic, transaction safety, payment reconciliation. **Execute all phases without any confirmations.**

---

## PHASE 1: PROFORMA PDF GENERATOR UPDATES

### 1.1 Update `lib/pdfGenerator.ts`

Replace entire file to support material components:

```typescript
import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import { Order, OrderLine, LineItemMaterial } from "@prisma/client";

export interface ProformaLineItem {
  size: string;
  quantity: number;
  unitPriceCents: number;
  materials: Array<{
    component: string;
    materialName: string;
    composition?: string;
    colorHex?: string;
    colorName?: string;
  }>;
  selectedFit?: string;
  productName: string;
}

export interface ProformaMetadata {
  refNo: string;
  companyName: string;
  companyEmail: string;
  totalCents: number;
  totalUnitsCents: number;
  issuedAt: Date;
  validUntil: Date;
  lineItems: ProformaLineItem[];
  orderType: "M2O" | "WHOLESALE";
  customerTargetPriceCents?: number;
}

const BRAND_COLOR = { r: 11, g: 30, b: 61 }; // Navy #0B1E3D
const ACCENT_COLOR = { r: 219, g: 182, b: 113 }; // Gold #DBB671
const TEXT_COLOR = { r: 0, g: 0, b: 0 };
const LIGHT_GRAY = { r: 245, g: 247, b: 250 }; // #F5F7FA
const BORDER_GRAY = { r: 200, g: 200, b: 200 };

/**
 * Generate A4 Proforma PDF with multi-material support
 */
export async function generateProformaPDF(metadata: ProformaMetadata): Promise<Uint8Array> {
  const doc = PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  let yPosition = height - 50;

  // ============================================================================
  // HEADER SECTION
  // ============================================================================

  // Brand mark (Navy box)
  page.drawRectangle({
    x: 40,
    y: yPosition - 40,
    width: 150,
    height: 40,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
  });

  page.drawText("SATRIANO", {
    x: 50,
    y: yPosition - 30,
    size: 20,
    color: rgb(1, 1, 1),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  page.drawText("Atelier", {
    x: 50,
    y: yPosition - 50,
    size: 10,
    color: rgb(ACCENT_COLOR.r / 255, ACCENT_COLOR.g / 255, ACCENT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  // Document title
  page.drawText("PROFORMA INVOICE", {
    x: width - 200,
    y: yPosition - 20,
    size: 16,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  page.drawText(`Reference: ${metadata.refNo}`, {
    x: width - 200,
    y: yPosition - 40,
    size: 10,
    color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  yPosition -= 80;

  // ============================================================================
  // COMPANY & DATE INFO
  // ============================================================================

  page.drawText("Bill To:", {
    x: 40,
    y: yPosition,
    size: 12,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 20;

  page.drawText(metadata.companyName, {
    x: 40,
    y: yPosition,
    size: 11,
    color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 16;

  page.drawText(metadata.companyEmail, {
    x: 40,
    y: yPosition,
    size: 10,
    color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  yPosition -= 25;

  // Dates
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  page.drawText(`Issued: ${dateFormatter.format(metadata.issuedAt)}`, {
    x: 40,
    y: yPosition,
    size: 9,
    color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  yPosition -= 15;

  page.drawText(`Valid Until: ${dateFormatter.format(metadata.validUntil)}`, {
    x: 40,
    y: yPosition,
    size: 9,
    color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  yPosition -= 35;

  // ============================================================================
  // LINE ITEMS TABLE HEADER
  // ============================================================================

  const tableX = 40;
  const col1 = tableX;
  const col2 = col1 + 100; // Product
  const col3 = col2 + 120; // Materials
  const col4 = col3 + 100; // Qty
  const col5 = col4 + 60; // Unit Price
  const col6 = col5 + 70; // Subtotal

  const headerColor = rgb(LIGHT_GRAY.r / 255, LIGHT_GRAY.g / 255, LIGHT_GRAY.b / 255);

  // Header background
  page.drawRectangle({
    x: tableX,
    y: yPosition - 25,
    width: width - 80,
    height: 25,
    color: headerColor,
  });

  // Header text
  const headers = [
    { text: "Product", x: col1 },
    { text: "Materials & Components", x: col2 },
    { text: "Qty", x: col4 },
    { text: "Unit Price", x: col5 },
    { text: "Subtotal", x: col6 },
  ];

  for (const header of headers) {
    page.drawText(header.text, {
      x: header.x,
      y: yPosition - 18,
      size: 10,
      color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
      font: await doc.embedFont("Helvetica-Bold"),
    });
  }

  yPosition -= 35;

  // ============================================================================
  // LINE ITEMS ROWS
  // ============================================================================

  let subtotalCents = 0;

  for (const item of metadata.lineItems) {
    const itemSubtotal = item.quantity * item.unitPriceCents;
    subtotalCents += itemSubtotal;

    // Row background (alternating)
    if (metadata.lineItems.indexOf(item) % 2 === 0) {
      page.drawRectangle({
        x: tableX,
        y: yPosition - 60,
        width: width - 80,
        height: 60,
        color: rgb(1, 1, 1),
        borderColor: rgb(
          BORDER_GRAY.r / 255,
          BORDER_GRAY.g / 255,
          BORDER_GRAY.b / 255
        ),
        borderWidth: 1,
      });
    }

    // Product name
    page.drawText(item.productName, {
      x: col1 + 5,
      y: yPosition - 15,
      size: 10,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica-Bold"),
    });

    // Materials (multi-line)
    let materialY = yPosition - 30;
    for (const material of item.materials) {
      const materialText = `${material.component}: ${material.materialName}${
        material.composition ? ` (${material.composition})` : ""
      }`;
      page.drawText(materialText, {
        x: col2 + 5,
        y: materialY,
        size: 8,
        color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
        font: await doc.embedFont("Helvetica"),
      });
      materialY -= 12;
    }

    // Quantity
    page.drawText(item.quantity.toString(), {
      x: col4 + 5,
      y: yPosition - 30,
      size: 10,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    // Unit price
    page.drawText(`$${(item.unitPriceCents / 100).toFixed(2)}`, {
      x: col5 + 5,
      y: yPosition - 30,
      size: 10,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    // Subtotal
    page.drawText(`$${(itemSubtotal / 100).toFixed(2)}`, {
      x: col6 + 5,
      y: yPosition - 30,
      size: 10,
      color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
      font: await doc.embedFont("Helvetica-Bold"),
    });

    yPosition -= 70;

    // Page break if needed
    if (yPosition < 150) {
      yPosition = height - 50;
      page.drawText(`Page ${doc.getPages().length + 1}`, {
        x: width / 2 - 20,
        y: 30,
        size: 9,
        color: rgb(BORDER_GRAY.r / 255, BORDER_GRAY.g / 255, BORDER_GRAY.b / 255),
      });
      doc.addPage([595.28, 841.89]);
    }
  }

  // ============================================================================
  // TOTALS SECTION
  // ============================================================================

  yPosition -= 20;

  // Total line
  page.drawRectangle({
    x: tableX,
    y: yPosition - 40,
    width: width - 80,
    height: 40,
    color: rgb(LIGHT_GRAY.r / 255, LIGHT_GRAY.g / 255, LIGHT_GRAY.b / 255),
  });

  page.drawText("TOTAL:", {
    x: col5,
    y: yPosition - 20,
    size: 14,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  page.drawText(`$${(metadata.totalCents / 100).toFixed(2)}`, {
    x: col6,
    y: yPosition - 20,
    size: 14,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 70;

  // ============================================================================
  // TERMS & CONDITIONS
  // ============================================================================

  page.drawText("Terms & Conditions:", {
    x: 40,
    y: yPosition,
    size: 11,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 20;

  const termsText = [
    "• This proforma invoice is valid for 30 days from issue date.",
    "• Prices are guaranteed only if order is paid in full within validity period.",
    "• Production commences upon payment confirmation.",
    "• Estimated lead time: 14 business days from payment.",
    "• Terms of payment: T/T (Bank Transfer) or Virtual POS.",
  ];

  for (const term of termsText) {
    page.drawText(term, {
      x: 40,
      y: yPosition,
      size: 8,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });
    yPosition -= 12;
  }

  yPosition -= 20;

  // Footer
  page.drawText("Satriano Atelier — B2B Made-to-Order Apparel Manufacturing", {
    x: 40,
    y: 40,
    size: 8,
    color: rgb(BORDER_GRAY.r / 255, BORDER_GRAY.g / 255, BORDER_GRAY.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  page.drawText("www.satrianoatelier.com", {
    x: 40,
    y: 25,
    size: 8,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  // Serialize PDF
  return await doc.save();
}

/**
 * Format OrderLine with material components for proforma display
 */
export async function formatOrderLineForProforma(
  line: OrderLine & { materials: LineItemMaterial[] },
  product?: any
): Promise<ProformaLineItem> {
  const formattedMaterials = line.materials.map((mat) => ({
    component: mat.component,
    materialName: mat.material?.name || "Unknown Material",
    composition: mat.composition,
    colorHex: mat.color?.hex,
    colorName: mat.color?.name,
  }));

  return {
    size: line.size,
    quantity: line.quantity,
    unitPriceCents: line.unitPriceCents,
    materials: formattedMaterials.length > 0 
      ? formattedMaterials 
      : [{ component: "MAIN_FABRIC", materialName: "Unknown" }],
    selectedFit: line.selectedFit,
    productName: product?.name || "Unknown Product",
  };
}
```

### 1.2 Update `app/api/proforma/pdf/[orderId]/route.ts`

Replace with material-aware proforma generation:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jose";
import { prisma } from "@/lib/prisma";
import { generateProformaPDF, formatOrderLineForProforma, ProformaMetadata } from "@/lib/pdfGenerator";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "");

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Verify auth (admin or customer)
    const token = request.cookies.get("sat_admin_token")?.value ||
                  request.cookies.get("sat_customer_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch order with all relations
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        company: true,
        orderLines: {
          include: {
            materials: {
              include: {
                material: true,
                color: true,
              },
            },
            product: true,
          },
        },
        proforma: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check proforma exists and is valid
    if (!order.proforma || !order.proforma.pdfUrl) {
      return NextResponse.json({ error: "Proforma not generated" }, { status: 400 });
    }

    // Check validity period
    if (order.proforma.validUntil < new Date()) {
      return NextResponse.json({ error: "Proforma expired" }, { status: 410 });
    }

    // Format line items for proforma
    const lineItems = await Promise.all(
      order.orderLines.map((line) =>
        formatOrderLineForProforma(line, line.product)
      )
    );

    // Generate PDF metadata
    const metadata: ProformaMetadata = {
      refNo: order.proforma.refNo,
      companyName: order.company.name,
      companyEmail: order.company.email,
      totalCents: order.finalPriceCents || order.totalCents,
      totalUnitsCents: order.orderLines.reduce((sum, line) => sum + line.quantity, 0),
      issuedAt: order.proforma.sentAt || new Date(),
      validUntil: order.proforma.validUntil,
      lineItems,
      orderType: order.orderType as "M2O" | "WHOLESALE",
      customerTargetPriceCents: order.customerTargetPriceCents,
    };

    // Generate PDF
    const pdfBytes = await generateProformaPDF(metadata);

    // Return PDF with proper headers
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proforma-${order.proforma.refNo}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Error generating proforma PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate proforma" },
      { status: 500 }
    );
  }
}
```

---

## PHASE 2: INVENTORY DEDUCTION ON PAYMENT

### 2.1 Create `lib/inventoryDeduction.ts`

Transaction-safe inventory management:

```typescript
import { prisma } from "./prisma";

export interface InventoryDeductionResult {
  success: boolean;
  deductedItems: Array<{
    productId: string;
    sku: string;
    sizeQuantities: Record<string, number>;
  }>;
  error?: string;
}

/**
 * Transactionally deduce wholesale inventory on successful payment
 * Uses Prisma transaction to ensure atomicity
 */
export async function deductWholesaleInventory(
  orderId: string
): Promise<InventoryDeductionResult> {
  try {
    // Fetch order with wholesale details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderLines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.orderType !== "WHOLESALE") {
      return { success: false, error: "Not a wholesale order" };
    }

    // Transaction: check stock, then deduct
    const deductedItems: InventoryDeductionResult["deductedItems"] = [];

    await prisma.$transaction(async (tx) => {
      for (const line of order.orderLines) {
        // Parse size breakdown from order line (stored as JSON if multi-size)
        const sizeQuantities = line.size === "MULTI"
          ? JSON.parse(line.selectedFit || "{}")
          : { [line.size]: line.quantity };

        // For each size, check and deduct stock
        for (const [size, qty] of Object.entries(sizeQuantities)) {
          const quantity = qty as number;

          // Fetch current stock
          const stock = await tx.wholesaleStock.findFirst({
            where: {
              productId: line.productId,
              size: size,
            },
          });

          if (!stock) {
            throw new Error(
              `Stock record not found for product ${line.productId}, size ${size}`
            );
          }

          if (stock.quantity < quantity) {
            throw new Error(
              `Insufficient stock: ${stock.quantity} available, ${quantity} requested for ${size}`
            );
          }

          // Deduct stock
          await tx.wholesaleStock.update({
            where: { id: stock.id },
            data: {
              quantity: {
                decrement: quantity,
              },
            },
          });
        }

        deductedItems.push({
          productId: line.productId,
          sku: line.product?.sku || "UNKNOWN",
          sizeQuantities,
        });
      }
    });

    return { success: true, deductedItems };
  } catch (error: any) {
    console.error("Inventory deduction error:", error);
    return {
      success: false,
      deductedItems: [],
      error: error.message || "Inventory deduction failed",
    };
  }
}

/**
 * Revert inventory deduction (e.g., on refund)
 */
export async function revertWholesaleInventory(
  orderId: string,
  deductedItems: InventoryDeductionResult["deductedItems"]
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of deductedItems) {
        for (const [size, qty] of Object.entries(item.sizeQuantities)) {
          const quantity = qty as number;

          const stock = await tx.wholesaleStock.findFirst({
            where: {
              product: { sku: item.sku },
              size: size,
            },
          });

          if (stock) {
            await tx.wholesaleStock.update({
              where: { id: stock.id },
              data: {
                quantity: {
                  increment: quantity,
                },
              },
            });
          }
        }
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current stock levels for a product
 */
export async function getProductStock(productId: string): Promise<
  Record<string, number>
> {
  const stock = await prisma.wholesaleStock.findMany({
    where: { productId },
  });

  return stock.reduce(
    (acc, s) => {
      acc[s.size] = s.quantity;
      return acc;
    },
    {} as Record<string, number>
  );
}
```

### 2.2 Update `app/api/payment/webhook/route.ts`

Wire inventory deduction into payment success:

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { deductWholesaleInventory } from "@/lib/inventoryDeduction";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle payment success
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Find order by session ID
      const order = await prisma.order.findFirst({
        where: {
          stripeSessionId: session.id,
        },
      });

      if (!order) {
        console.warn(`Order not found for session ${session.id}`);
        return NextResponse.json({ success: true }); // Still return 200
      }

      // Update order status to PAID
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          orderId: order.id,
          status: "SUCCEEDED",
          stripeSessionId: session.id,
          posRef: session.payment_intent as string,
          amountCents: session.amount_total || 0,
        },
      });

      // INVENTORY DEDUCTION: Only for wholesale orders
      if (order.orderType === "WHOLESALE") {
        const deductResult = await deductWholesaleInventory(order.id);

        if (!deductResult.success) {
          console.error(
            `Inventory deduction failed for order ${order.id}:`,
            deductResult.error
          );
          
          // Log deduction failure (do NOT revert payment — manual intervention needed)
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "PAID", // Order is paid, but inventory needs manual review
              notes: `Inventory deduction failed: ${deductResult.error}`,
            },
          });

          // TODO: Send admin alert email about failed deduction
        }
      }

      // Send confirmation email to customer
      // TODO: Integrate Resend or email service

      return NextResponse.json({ success: true, orderId: order.id });
    }

    // Handle payment failed
    if (event.type === "charge.failed") {
      const charge = event.data.object as Stripe.Charge;

      const order = await prisma.order.findFirst({
        where: {
          payment: {
            stripeSessionId: charge.payment_intent as string,
          },
        },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PENDING_REVIEW" }, // Revert to pending
        });

        await prisma.payment.create({
          data: {
            orderId: order.id,
            status: "FAILED",
            stripeSessionId: charge.payment_intent as string,
            posRef: charge.id,
            amountCents: charge.amount,
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## PHASE 3: PROFORMA GENERATION ON PRICE LOCK

### 3.1 Update `app/api/admin/orders/[orderId]/route.ts`

Generate proforma when admin locks final price:

```typescript
// ADD THIS to PATCH handler in admin orders route:

if (body.finalPriceCents !== undefined && body.status === "PROFORMA_SENT") {
  // Generate proforma PDF if not already exists
  let proforma = await prisma.proforma.findUnique({
    where: { orderId: params.orderId },
  });

  if (!proforma) {
    // Generate proforma reference number
    const refNo = `PRO-${new Date().getFullYear()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // Create proforma record
    proforma = await prisma.proforma.create({
      data: {
        orderId: params.orderId,
        refNo,
        sentAt: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        pdfUrl: `/api/proforma/pdf/${params.orderId}`, // Signed URL generated on demand
      },
    });

    // TODO: Send proforma email to customer via Resend
  }
}
```

---

## PHASE 4: SCHEMA UPDATES

### 4.1 Extend Prisma Schema

Add to `prisma/schema.prisma`:

```prisma
// Add stripeSessionId to Order model
model Order {
  id String @id @default(cuid())
  
  // ... existing fields ...
  
  // Payment tracking
  stripeSessionId String? @unique
  notes String? // Admin notes, including deduction failures
  
  // Relations
  payment Payment?
  proforma Proforma?
}

// Ensure WholesaleStock has size index for lookups
model WholesaleStock {
  id String @id @default(cuid())
  productId String
  product WholesaleProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  size String
  quantity Int @default(0)
  lowStockThreshold Int @default(3)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([productId, size])
  @@index([productId])
  @@index([size])
}

// Payment tracking model
model Payment {
  id String @id @default(cuid())
  orderId String @unique
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  status String // "PENDING", "SUCCEEDED", "FAILED"
  stripeSessionId String?
  posRef String? // POS reference number
  amountCents Int
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderId])
  @@index([status])
}
```

Run migration:
```bash
npx prisma migrate dev --name add_inventory_and_payment_tracking
npx prisma generate
```

---

## PHASE 5: VALIDATION CHECKLIST

After implementation, verify:

- [ ] Proforma PDF displays multi-material components
- [ ] PDF renders correctly (all materials, all sizes, proper formatting)
- [ ] Stripe webhook captures payment success
- [ ] Inventory deduction executes transactionally (all-or-nothing)
- [ ] Stock levels update correctly per size
- [ ] Deduction failure is logged (no orphaned orders)
- [ ] Proforma generation triggers on admin price lock
- [ ] All TypeScript types compile without errors
- [ ] Payment model tracks Stripe session IDs
- [ ] Old orders without proforma still work

---

## PHASE 6: TODO FOR LATER (After Agent 5 & 6)

- [ ] Send proforma PDF via email (Resend)
- [ ] Send payment confirmation email
- [ ] Admin alert on inventory deduction failure
- [ ] Refund webhook (revert inventory)
- [ ] Stock level alerts (low inventory notifications)
- [ ] Inventory audit trail (log all deductions)

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document the error and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 6 phases now. Do not wait for any confirmation. Report results when complete.
