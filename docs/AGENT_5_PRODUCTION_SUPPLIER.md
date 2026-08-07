# AGENT 5 — PRODUCTION & SUPPLIER AUTOMATION

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Create production work order system with factory-ready PDF specifications. Automate supplier purchase order generation and delivery tracking for raw material sourcing.

**Scope:** Database models, PDF generation, supplier PO automation, workflow orchestration. **Execute all phases without any confirmations.**

---

## PHASE 1: DATABASE SCHEMA EXTENSIONS

### 1.1 Update `prisma/schema.prisma`

Add production and supplier models:

```prisma
// ============================================================================
// PRODUCTION WORK ORDERS
// ============================================================================

enum ProductionWorkOrderStatus {
  CREATED
  ASSIGNED_TO_FACTORY
  IN_CUTTING
  IN_SEWING
  IN_QC
  PACKED
  READY_FOR_SHIPMENT
  SHIPPED
  CANCELLED
}

model ProductionWorkOrder {
  id String @id @default(cuid())
  orderId String @unique
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  workOrderNo String @unique // e.g., "WO-2026-0001"
  status ProductionWorkOrderStatus @default(CREATED)
  
  // Factory assignment
  assignedFactoryId String?
  assignedFactory Supplier? @relation("FactoryAssignment", fields: [assignedFactoryId], references: [id])
  
  // Specifications
  totalQuantity Int
  sizeBreakdown String? // JSON: { "S": 10, "M": 20, "L": 15 }
  materialSpecifications String // JSON: full material component specs
  logoSpecifications String? // JSON: { "placement": "LEFT_CHEST", "assetUrl": "..." }
  customNotes String? // Admin notes for factory
  
  // Timeline
  targetStartDate DateTime?
  targetCompletionDate DateTime?
  actualCompletionDate DateTime?
  
  // Tracking
  pdfUrl String? // Signed URL to work order PDF
  generatedAt DateTime @default(now())
  
  // Relations
  supplierPOs SupplierPO[]
  qualityChecks QualityCheck[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderId])
  @@index([status])
  @@index([assignedFactoryId])
  @@index([workOrderNo])
}

// ============================================================================
// SUPPLIER PURCHASE ORDERS
// ============================================================================

enum SupplierPOStatus {
  DRAFT
  ISSUED
  ACKNOWLEDGED
  PARTIALLY_RECEIVED
  RECEIVED
  CANCELLED
}

model SupplierPO {
  id String @id @default(cuid())
  poNo String @unique // e.g., "PO-2026-0001"
  
  // Relations
  workOrderId String
  workOrder ProductionWorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)
  
  supplierId String
  supplier Supplier @relation(fields: [supplierId], references: [id])
  
  // Status tracking
  status SupplierPOStatus @default(DRAFT)
  issueDate DateTime?
  dueDate DateTime?
  receivedDate DateTime?
  
  // Line items
  items String // JSON: [{ materialId, quantity, unitPrice, totalPrice }]
  totalAmountCents Int
  
  // Communication
  emailSentAt DateTime?
  acknowledgedAt DateTime?
  notes String?
  
  // Tracking
  pdfUrl String? // Signed URL to PO PDF
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([workOrderId])
  @@index([supplierId])
  @@index([status])
  @@index([poNo])
}

// ============================================================================
// QUALITY CONTROL
// ============================================================================

enum QCCheckType {
  PRE_PRODUCTION
  IN_PROCESS
  FINAL_INSPECTION
  SHIPMENT_READY
}

model QualityCheck {
  id String @id @default(cuid())
  workOrderId String
  workOrder ProductionWorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)
  
  checkType QCCheckType
  checkedAt DateTime @default(now())
  checkedBy String? // Admin who performed QC
  
  status String // "PASS", "FAIL", "PENDING"
  findings String? // JSON or text notes
  rework Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([workOrderId])
  @@index([checkType])
  @@index([status])
}

// ============================================================================
// EXTEND EXISTING SUPPLIER MODEL
// ============================================================================

model Supplier {
  id String @id @default(cuid())
  firmName String
  contactName String?
  email String
  phone String?
  address String?
  
  // Supplier type
  type String // "FABRIC", "FACTORY", "COMPONENT", "LOGISTICS"
  
  // Relationship
  isPreferred Boolean @default(false)
  leadTimeDays Int @default(14)
  minOrderValue Int @default(0) // in cents
  
  // Relations
  wholesaleProducts WholesaleProduct[]
  factoryWorkOrders ProductionWorkOrder[] @relation("FactoryAssignment")
  purchaseOrders SupplierPO[]
  
  // Metadata
  notes String?
  integrationApiKey String? // For automated PO delivery
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([type])
  @@index([email])
}

// Ensure Order has relation to WorkOrder
model Order {
  // ... existing fields ...
  workOrder ProductionWorkOrder?
}
```

Run migration:
```bash
npx prisma migrate dev --name add_production_workflow
npx prisma generate
```

---

## PHASE 2: PRODUCTION WORK ORDER PDF GENERATOR

### 2.1 Create `lib/workOrderGenerator.ts`

Factory-ready work order PDF:

```typescript
import { PDFDocument, rgb } from "pdf-lib";

export interface WorkOrderMetadata {
  workOrderNo: string;
  orderId: string;
  totalQuantity: number;
  sizeBreakdown: Record<string, number>;
  materialSpecs: Array<{
    component: string;
    materialName: string;
    composition?: string;
    colorHex?: string;
    colorName?: string;
  }>;
  logoSpec?: {
    placement: string;
    description: string;
  };
  customNotes?: string;
  targetCompletionDate?: Date;
  factoryName?: string;
}

const BRAND_COLOR = { r: 11, g: 30, b: 61 }; // Navy
const ACCENT_COLOR = { r: 219, g: 182, b: 113 }; // Gold
const TEXT_COLOR = { r: 0, g: 0, b: 0 };
const LIGHT_GRAY = { r: 245, g: 247, b: 250 };
const BORDER_GRAY = { r: 200, g: 200, b: 200 };

export async function generateWorkOrderPDF(metadata: WorkOrderMetadata): Promise<Uint8Array> {
  const doc = PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  let yPosition = height - 50;

  // ============================================================================
  // HEADER
  // ============================================================================

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

  page.drawText("Production Work Order", {
    x: width - 250,
    y: yPosition - 20,
    size: 16,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  page.drawText(`WO: ${metadata.workOrderNo}`, {
    x: width - 250,
    y: yPosition - 40,
    size: 10,
    color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  yPosition -= 80;

  // ============================================================================
  // BASIC INFO
  // ============================================================================

  page.drawText("Work Order Details", {
    x: 40,
    y: yPosition,
    size: 12,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 20;

  const infoRows = [
    { label: "Order ID:", value: metadata.orderId },
    { label: "Total Quantity:", value: `${metadata.totalQuantity} units` },
    { label: "Factory:", value: metadata.factoryName || "TBD" },
    {
      label: "Target Completion:",
      value: metadata.targetCompletionDate
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(metadata.targetCompletionDate)
        : "TBD",
    },
  ];

  for (const row of infoRows) {
    page.drawText(row.label, {
      x: 40,
      y: yPosition,
      size: 10,
      color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
      font: await doc.embedFont("Helvetica-Bold"),
    });

    page.drawText(row.value, {
      x: 150,
      y: yPosition,
      size: 10,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    yPosition -= 15;
  }

  yPosition -= 20;

  // ============================================================================
  // SIZE BREAKDOWN
  // ============================================================================

  page.drawText("Size Breakdown", {
    x: 40,
    y: yPosition,
    size: 12,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 20;

  page.drawRectangle({
    x: 40,
    y: yPosition - 25,
    width: 250,
    height: 25,
    color: rgb(LIGHT_GRAY.r / 255, LIGHT_GRAY.g / 255, LIGHT_GRAY.b / 255),
  });

  page.drawText("Size", {
    x: 50,
    y: yPosition - 18,
    size: 10,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  page.drawText("Quantity", {
    x: 150,
    y: yPosition - 18,
    size: 10,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 35;

  let sizeTotal = 0;
  for (const [size, quantity] of Object.entries(metadata.sizeBreakdown)) {
    sizeTotal += quantity;

    page.drawText(size, {
      x: 50,
      y: yPosition,
      size: 9,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    page.drawText(quantity.toString(), {
      x: 150,
      y: yPosition,
      size: 9,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    yPosition -= 15;
  }

  yPosition -= 15;

  // ============================================================================
  // MATERIAL SPECIFICATIONS
  // ============================================================================

  page.drawText("Material & Component Specifications", {
    x: 40,
    y: yPosition,
    size: 12,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 20;

  for (const spec of metadata.materialSpecs) {
    page.drawText(`${spec.component}:`, {
      x: 40,
      y: yPosition,
      size: 10,
      color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
      font: await doc.embedFont("Helvetica-Bold"),
    });

    yPosition -= 15;

    page.drawText(`Material: ${spec.materialName}`, {
      x: 50,
      y: yPosition,
      size: 9,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    yPosition -= 12;

    if (spec.composition) {
      page.drawText(`Composition: ${spec.composition}`, {
        x: 50,
        y: yPosition,
        size: 9,
        color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
        font: await doc.embedFont("Helvetica"),
      });

      yPosition -= 12;
    }

    if (spec.colorName) {
      page.drawText(`Color: ${spec.colorName}`, {
        x: 50,
        y: yPosition,
        size: 9,
        color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
        font: await doc.embedFont("Helvetica"),
      });

      yPosition -= 12;
    }

    yPosition -= 10;
  }

  yPosition -= 15;

  // ============================================================================
  // LOGO & BRANDING
  // ============================================================================

  if (metadata.logoSpec) {
    page.drawText("Logo & Branding Specifications", {
      x: 40,
      y: yPosition,
      size: 12,
      color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
      font: await doc.embedFont("Helvetica-Bold"),
    });

    yPosition -= 20;

    page.drawText(`Placement: ${metadata.logoSpec.placement}`, {
      x: 40,
      y: yPosition,
      size: 10,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    yPosition -= 15;

    page.drawText(metadata.logoSpec.description, {
      x: 40,
      y: yPosition,
      size: 9,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    yPosition -= 25;
  }

  // ============================================================================
  // CUSTOM NOTES
  // ============================================================================

  if (metadata.customNotes) {
    page.drawText("Special Instructions", {
      x: 40,
      y: yPosition,
      size: 12,
      color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
      font: await doc.embedFont("Helvetica-Bold"),
    });

    yPosition -= 20;

    page.drawText(metadata.customNotes, {
      x: 40,
      y: yPosition,
      size: 9,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });
  }

  // Footer
  page.drawText("Satriano Atelier — Production Operations", {
    x: 40,
    y: 25,
    size: 8,
    color: rgb(BORDER_GRAY.r / 255, BORDER_GRAY.g / 255, BORDER_GRAY.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  return await doc.save();
}
```

---

## PHASE 3: SUPPLIER PO AUTOMATION

### 3.1 Create `lib/supplierPOGenerator.ts`

Automated purchase order generation:

```typescript
import { PDFDocument, rgb } from "pdf-lib";
import { Prisma } from "@prisma/client";

export interface SupplierPOItem {
  materialName: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

export interface SupplierPOMetadata {
  poNo: string;
  supplierName: string;
  supplierEmail: string;
  supplierAddress?: string;
  dueDate: Date;
  items: SupplierPOItem[];
  totalAmountCents: number;
  customNotes?: string;
}

export async function generateSupplierPOPDF(metadata: SupplierPOMetadata): Promise<Uint8Array> {
  const doc = PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  let yPosition = height - 50;

  // ============================================================================
  // HEADER
  // ============================================================================

  const BRAND_COLOR = { r: 11, g: 30, b: 61 };
  const TEXT_COLOR = { r: 0, g: 0, b: 0 };

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

  page.drawText("Purchase Order", {
    x: width - 200,
    y: yPosition - 20,
    size: 16,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  page.drawText(`PO: ${metadata.poNo}`, {
    x: width - 200,
    y: yPosition - 40,
    size: 10,
    color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  yPosition -= 80;

  // ============================================================================
  // SUPPLIER INFO
  // ============================================================================

  page.drawText("Bill To:", {
    x: 40,
    y: yPosition,
    size: 11,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 18;

  page.drawText(metadata.supplierName, {
    x: 40,
    y: yPosition,
    size: 11,
    color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 15;

  page.drawText(metadata.supplierEmail, {
    x: 40,
    y: yPosition,
    size: 10,
    color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  if (metadata.supplierAddress) {
    yPosition -= 15;
    page.drawText(metadata.supplierAddress, {
      x: 40,
      y: yPosition,
      size: 10,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });
  }

  yPosition -= 25;

  page.drawText(`Due Date: ${new Intl.DateTimeFormat("en-US").format(metadata.dueDate)}`, {
    x: 40,
    y: yPosition,
    size: 10,
    color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
    font: await doc.embedFont("Helvetica"),
  });

  yPosition -= 35;

  // ============================================================================
  // LINE ITEMS TABLE
  // ============================================================================

  const col1 = 40;
  const col2 = col1 + 200; // Quantity
  const col3 = col2 + 80; // Unit Price
  const col4 = col3 + 80; // Total

  // Header
  const LIGHT_GRAY = { r: 245, g: 247, b: 250 };
  page.drawRectangle({
    x: col1,
    y: yPosition - 25,
    width: width - 80,
    height: 25,
    color: rgb(LIGHT_GRAY.r / 255, LIGHT_GRAY.g / 255, LIGHT_GRAY.b / 255),
  });

  page.drawText("Material", {
    x: col1 + 5,
    y: yPosition - 18,
    size: 10,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  page.drawText("Qty", {
    x: col2 + 5,
    y: yPosition - 18,
    size: 10,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  page.drawText("Unit Price", {
    x: col3 + 5,
    y: yPosition - 18,
    size: 10,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  page.drawText("Total", {
    x: col4 + 5,
    y: yPosition - 18,
    size: 10,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  yPosition -= 35;

  // Items
  for (const item of metadata.items) {
    page.drawText(item.materialName, {
      x: col1 + 5,
      y: yPosition,
      size: 9,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    page.drawText(item.quantity.toString(), {
      x: col2 + 5,
      y: yPosition,
      size: 9,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    page.drawText(`$${(item.unitPriceCents / 100).toFixed(2)}`, {
      x: col3 + 5,
      y: yPosition,
      size: 9,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });

    page.drawText(`$${(item.totalPriceCents / 100).toFixed(2)}`, {
      x: col4 + 5,
      y: yPosition,
      size: 9,
      color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
      font: await doc.embedFont("Helvetica-Bold"),
    });

    yPosition -= 20;
  }

  // Total
  yPosition -= 15;

  page.drawRectangle({
    x: col3,
    y: yPosition - 25,
    width: col4 - col3 + 50,
    height: 25,
    color: rgb(LIGHT_GRAY.r / 255, LIGHT_GRAY.g / 255, LIGHT_GRAY.b / 255),
  });

  page.drawText("TOTAL:", {
    x: col3 + 5,
    y: yPosition - 18,
    size: 12,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  page.drawText(`$${(metadata.totalAmountCents / 100).toFixed(2)}`, {
    x: col4 + 5,
    y: yPosition - 18,
    size: 12,
    color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
    font: await doc.embedFont("Helvetica-Bold"),
  });

  if (metadata.customNotes) {
    yPosition -= 50;

    page.drawText("Notes:", {
      x: 40,
      y: yPosition,
      size: 10,
      color: rgb(BRAND_COLOR.r / 255, BRAND_COLOR.g / 255, BRAND_COLOR.b / 255),
      font: await doc.embedFont("Helvetica-Bold"),
    });

    yPosition -= 15;

    page.drawText(metadata.customNotes, {
      x: 40,
      y: yPosition,
      size: 9,
      color: rgb(TEXT_COLOR.r / 255, TEXT_COLOR.g / 255, TEXT_COLOR.b / 255),
      font: await doc.embedFont("Helvetica"),
    });
  }

  // Footer
  page.drawText("Satriano Atelier — Procurement", {
    x: 40,
    y: 25,
    size: 8,
    color: rgb(150, 150, 150),
    font: await doc.embedFont("Helvetica"),
  });

  return await doc.save();
}

/**
 * Aggregate material requirements from work order for supplier PO
 */
export function aggregateMaterialRequirements(
  materialSpecs: Array<{
    component: string;
    materialId: string;
    materialName: string;
    quantity: number;
    unitPriceCents: number;
  }>
): SupplierPOItem[] {
  const aggregated = new Map<string, SupplierPOItem>();

  for (const spec of materialSpecs) {
    const key = spec.materialId;

    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.quantity += spec.quantity;
      existing.totalPriceCents += spec.unitPriceCents * spec.quantity;
    } else {
      aggregated.set(key, {
        materialName: spec.materialName,
        quantity: spec.quantity,
        unitPriceCents: spec.unitPriceCents,
        totalPriceCents: spec.unitPriceCents * spec.quantity,
      });
    }
  }

  return Array.from(aggregated.values());
}
```

### 3.2 Create `lib/supplierPOWorkflow.ts`

Orchestrate PO creation and delivery:

```typescript
import { prisma } from "./prisma";
import { generateSupplierPOPDF, aggregateMaterialRequirements } from "./supplierPOGenerator";

export async function createAndIssuePO(
  workOrderId: string,
  supplierId: string,
  materialRequirements: Array<{
    materialId: string;
    materialName: string;
    quantity: number;
    unitPriceCents: number;
  }>
): Promise<{ poNo: string; pdfUrl: string }> {
  // Fetch supplier and work order
  const [supplier, workOrder] = await Promise.all([
    prisma.supplier.findUnique({ where: { id: supplierId } }),
    prisma.productionWorkOrder.findUnique({ where: { id: workOrderId } }),
  ]);

  if (!supplier || !workOrder) {
    throw new Error("Supplier or work order not found");
  }

  // Generate PO number
  const poNo = `PO-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;

  // Calculate totals
  const items = aggregateMaterialRequirements(
    materialRequirements.map((m) => ({
      ...m,
      component: "RAW_MATERIAL",
    }))
  );

  const totalAmountCents = items.reduce((sum, item) => sum + item.totalPriceCents, 0);

  // Create PO record
  const po = await prisma.supplierPO.create({
    data: {
      poNo,
      workOrderId,
      supplierId,
      status: "DRAFT",
      items: JSON.stringify(items),
      totalAmountCents,
      dueDate: new Date(Date.now() + (supplier.leadTimeDays || 14) * 24 * 60 * 60 * 1000),
    },
  });

  // Generate PDF
  const pdfBytes = await generateSupplierPOPDF({
    poNo,
    supplierName: supplier.firmName,
    supplierEmail: supplier.email,
    supplierAddress: supplier.address || undefined,
    dueDate: po.dueDate || new Date(),
    items,
    totalAmountCents,
  });

  // TODO: Upload PDF to Supabase and get signed URL
  // For now, assume pdfUrl is available
  const pdfUrl = `/api/supplier/po/${po.id}/pdf`;

  // Update PO with PDF URL
  await prisma.supplierPO.update({
    where: { id: po.id },
    data: { pdfUrl },
  });

  // Send PO email (if supplier has integration API key)
  if (supplier.integrationApiKey) {
    // TODO: Implement automated email delivery via Resend or custom API
  }

  // Mark as issued
  await prisma.supplierPO.update({
    where: { id: po.id },
    data: {
      status: "ISSUED",
      issueDate: new Date(),
      emailSentAt: new Date(),
    },
  });

  return { poNo, pdfUrl };
}

/**
 * Acknowledge received materials from supplier
 */
export async function receivePOMaterials(
  poId: string,
  receivedQuantity: number
): Promise<void> {
  const po = await prisma.supplierPO.findUnique({ where: { id: poId } });

  if (!po) throw new Error("PO not found");

  // Transition status
  const status =
    receivedQuantity === JSON.parse(po.items).reduce((sum: number, item: any) => sum + item.quantity, 0)
      ? "RECEIVED"
      : "PARTIALLY_RECEIVED";

  await prisma.supplierPO.update({
    where: { id: poId },
    data: {
      status,
      receivedDate: new Date(),
    },
  });
}
```

---

## PHASE 4: WORK ORDER CREATION & MANAGEMENT

### 4.1 Create `lib/workOrderWorkflow.ts`

Orchestrate work order generation:

```typescript
import { prisma } from "./prisma";
import { generateWorkOrderPDF } from "./workOrderGenerator";

export async function createWorkOrder(orderId: string, assignedFactoryId?: string) {
  // Fetch order with all details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderLines: {
        include: {
          product: true,
          materials: {
            include: {
              material: true,
              color: true,
            },
          },
        },
      },
      company: true,
    },
  });

  if (!order) throw new Error("Order not found");

  // Generate work order number
  const workOrderNo = `WO-${new Date().getFullYear()}-${String(
    Math.floor(Math.random() * 10000)
  ).padStart(4, "0")}`;

  // Format material specifications
  const materialSpecs = order.orderLines.flatMap((line) =>
    line.materials.map((mat) => ({
      component: mat.component,
      materialName: mat.material.name,
      composition: mat.composition,
      colorHex: mat.color?.hex,
      colorName: mat.color?.name,
    }))
  );

  // Format size breakdown
  const sizeBreakdown: Record<string, number> = {};
  order.orderLines.forEach((line) => {
    const sizes = line.size === "MULTI" 
      ? JSON.parse(line.selectedFit || "{}")
      : { [line.size]: line.quantity };
    
    Object.entries(sizes).forEach(([size, qty]) => {
      sizeBreakdown[size] = (sizeBreakdown[size] || 0) + (qty as number);
    });
  });

  // Create work order
  const workOrder = await prisma.productionWorkOrder.create({
    data: {
      orderId,
      workOrderNo,
      status: "CREATED",
      assignedFactoryId,
      totalQuantity: order.orderLines.reduce((sum, line) => sum + line.quantity, 0),
      sizeBreakdown: JSON.stringify(sizeBreakdown),
      materialSpecifications: JSON.stringify(materialSpecs),
      targetCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
  });

  // Generate PDF
  const pdfBytes = await generateWorkOrderPDF({
    workOrderNo,
    orderId,
    totalQuantity: workOrder.totalQuantity,
    sizeBreakdown,
    materialSpecs,
    targetCompletionDate: workOrder.targetCompletionDate || undefined,
  });

  // TODO: Upload to Supabase, get signed URL
  const pdfUrl = `/api/admin/work-order/${workOrder.id}/pdf`;

  await prisma.productionWorkOrder.update({
    where: { id: workOrder.id },
    data: { pdfUrl },
  });

  return workOrder;
}

/**
 * Transition work order status through production lifecycle
 */
export async function updateWorkOrderStatus(
  workOrderId: string,
  newStatus: string
): Promise<void> {
  await prisma.productionWorkOrder.update({
    where: { id: workOrderId },
    data: { status: newStatus as any },
  });
}
```

---

## PHASE 5: API ENDPOINTS

### 5.1 Create `app/api/admin/work-orders/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jose";
import { prisma } from "@/lib/prisma";
import { createWorkOrder } from "@/lib/workOrderWorkflow";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "");

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await verify(token, JWT_SECRET);

    const body = await request.json();
    const { orderId, assignedFactoryId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const workOrder = await createWorkOrder(orderId, assignedFactoryId);

    return NextResponse.json(workOrder);
  } catch (error: any) {
    console.error("Error creating work order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create work order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await verify(token, JWT_SECRET);

    const workOrders = await prisma.productionWorkOrder.findMany({
      include: {
        order: true,
        assignedFactory: true,
        supplierPOs: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## PHASE 6: VALIDATION CHECKLIST

After implementation, verify:

- [ ] Work order PDF generates correctly
- [ ] Work order number is unique (WO-YYYY-####)
- [ ] Material specifications render in PDF
- [ ] Size breakdown aggregates correctly
- [ ] Supplier PO PDF generates
- [ ] PO number is unique (PO-YYYY-###)
- [ ] Material aggregation combines same materials
- [ ] Database schema migrates successfully
- [ ] All TypeScript types compile
- [ ] Work order creation triggers from admin order page

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document the error and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 6 phases now. Do not wait for any confirmation. Report results when complete.
