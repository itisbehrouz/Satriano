# AGENT 9 — ADVANCED INVENTORY MANAGEMENT

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Implement advanced inventory management with forecasting, automatic reorder points, supplier SLA tracking, audit trails, and multi-warehouse preparation.

**Scope:** Database models, forecasting engine, SLA tracking, audit logging. **Execute all phases without any confirmations.**

---

## PHASE 1: INVENTORY MODELS & AUDIT

### 1.1 Update `prisma/schema.prisma`

Add inventory tracking models:

```prisma
// Inventory forecasting based on historical demand
model InventoryForecast {
  id String @id @default(cuid())
  productId String
  product WholesaleProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  size String
  forecastedDemand30Days Int
  forecastedDemand90Days Int
  historicalMovementRate Float // units per day
  
  lastUpdated DateTime @default(now())

  @@unique([productId, size])
}

// Reorder points and supplier settings
model InventoryPolicy {
  id String @id @default(cuid())
  productId String @unique
  product WholesaleProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  reorderPoint Int // Auto-reorder when stock falls below
  reorderQuantity Int // Order this many units
  safetyStock Int // Minimum safety buffer
  leadTimeDays Int // Supplier lead time
  
  autoReorderEnabled Boolean @default(false)
  preferredSupplierId String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Supplier SLA terms
model SupplierSLA {
  id String @id @default(cuid())
  supplierId String
  supplier Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  
  standardLeadTimeDays Int
  expeditedLeadTimeDays Int?
  expeditedCostMultiplier Float? // 1.5x, 2x, etc.
  
  onTimeDeliveryTarget Float // 95%, 98%, etc.
  minOrderValue Int // Cents
  maxOrderValue Int? // Cents
  
  qualityAgreement String? // JSON: { "defectRate": 0.02, "inspectionRequired": true }
  paymentTerms String // "NET30", "NET60", "PREPAY"
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([supplierId])
}

// Inventory transaction audit log
model InventoryAudit {
  id String @id @default(cuid())
  productId String
  product WholesaleProduct? @relation(fields: [productId], references: [id], onDelete: SetNull)
  
  size String
  action String // "DEDUCT", "RESTOCK", "ADJUSTMENT", "COUNT"
  quantityChanged Int
  previousQuantity Int
  newQuantity Int
  
  reason String? // "SALE", "RETURN", "DAMAGE", "INVENTORY_COUNT"
  reference String? // Order ID, Return ID, etc.
  
  performedBy String // Admin email
  notes String?
  
  createdAt DateTime @default(now())

  @@index([productId])
  @@index([action])
  @@index([createdAt])
}

// Low stock alerts
model LowStockAlert {
  id String @id @default(cuid())
  productId String
  product WholesaleProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  size String
  currentQuantity Int
  thresholdQuantity Int
  
  alertSentAt DateTime @default(now())
  acknowledgedAt DateTime?
  acknowledgedBy String? // Admin email
  
  resolved Boolean @default(false)
  actionTaken String? // "REORDER_PLACED", "MANUAL_ADJUSTMENT", etc.

  @@index([productId])
  @@index([resolved])
}

// Extend WholesaleProduct
model WholesaleProduct {
  // ... existing fields ...
  
  // New relations
  forecasts InventoryForecast[]
  inventoryPolicy InventoryPolicy?
  auditLog InventoryAudit[]
  lowStockAlerts LowStockAlert[]
}

// Extend Supplier
model Supplier {
  // ... existing fields ...
  
  slaAgreements SupplierSLA[]
}
```

Run migration:
```bash
npx prisma migrate dev --name add_advanced_inventory
npx prisma generate
```

---

## PHASE 2: INVENTORY FORECASTING

### 2.1 Create `lib/inventoryForecasting.ts`

```typescript
import { prisma } from "./prisma";

/**
 * Calculate inventory forecast based on historical demand
 */
export async function updateInventoryForecasts(): Promise<void> {
  const products = await prisma.wholesaleProduct.findMany({
    include: {
      stock: true,
    },
  });

  for (const product of products) {
    for (const stock of product.stock) {
      const historicalOrders = await getHistoricalDemand(product.id, stock.size, 90);
      const dailyRate = historicalOrders / 90;
      
      const forecast30Days = Math.ceil(dailyRate * 30);
      const forecast90Days = Math.ceil(dailyRate * 90);

      await prisma.inventoryForecast.upsert({
        where: {
          productId_size: {
            productId: product.id,
            size: stock.size,
          },
        },
        update: {
          forecastedDemand30Days: forecast30Days,
          forecastedDemand90Days: forecast90Days,
          historicalMovementRate: dailyRate,
          lastUpdated: new Date(),
        },
        create: {
          productId: product.id,
          size: stock.size,
          forecastedDemand30Days: forecast30Days,
          forecastedDemand90Days: forecast90Days,
          historicalMovementRate: dailyRate,
        },
      });
    }
  }
}

/**
 * Get historical demand for a product/size
 */
async function getHistoricalDemand(
  productId: string,
  size: string,
  days: number
): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: "PAID",
      orderLines: {
        some: {
          productId,
          size,
        },
      },
    },
    include: {
      orderLines: {
        where: { productId, size },
      },
    },
  });

  return orders.reduce((sum, o) => sum + o.orderLines[0]?.quantity || 0, 0);
}

/**
 * Check if stock is below reorder point and auto-reorder if enabled
 */
export async function checkAndAutoReorder(): Promise<void> {
  const policies = await prisma.inventoryPolicy.findMany({
    where: { autoReorderEnabled: true },
    include: {
      product: {
        include: {
          stock: true,
          supplier: true,
        },
      },
    },
  });

  for (const policy of policies) {
    for (const stock of policy.product.stock) {
      if (stock.quantity <= policy.reorderPoint) {
        // Trigger auto-reorder
        console.log(
          `Auto-reorder triggered for ${policy.product.sku}, size ${stock.size}`
        );
        
        // TODO: Create PO automatically
      }
    }
  }
}
```

---

## PHASE 3: INVENTORY AUDIT & TRACKING

### 3.1 Create `lib/inventoryAudit.ts`

```typescript
import { prisma } from "./prisma";

export async function logInventoryTransaction(
  productId: string,
  size: string,
  action: string,
  quantityChanged: number,
  reason: string,
  reference: string,
  performedBy: string,
  notes?: string
): Promise<void> {
  const stock = await prisma.wholesaleStock.findFirst({
    where: { productId, size },
  });

  if (!stock) throw new Error("Stock not found");

  const previousQuantity = stock.quantity;
  const newQuantity = previousQuantity - quantityChanged; // For DEDUCT

  await prisma.inventoryAudit.create({
    data: {
      productId,
      size,
      action,
      quantityChanged,
      previousQuantity,
      newQuantity,
      reason,
      reference,
      performedBy,
      notes,
    },
  });

  // Check if low stock alert needed
  if (newQuantity <= stock.lowStockThreshold) {
    await prisma.lowStockAlert.create({
      data: {
        productId,
        size,
        currentQuantity: newQuantity,
        thresholdQuantity: stock.lowStockThreshold,
      },
    });
  }
}

/**
 * Generate audit report for a product
 */
export async function getInventoryAuditReport(
  productId: string,
  startDate: Date,
  endDate: Date
): Promise<any> {
  const transactions = await prisma.inventoryAudit.findMany({
    where: {
      productId,
      createdAt: { gte: startDate, lte: endDate },
    },
    orderBy: { createdAt: "asc" },
  });

  const summary = {
    totalDeductions: 0,
    totalRestocks: 0,
    netChange: 0,
    actions: new Map<string, number>(),
  };

  transactions.forEach((t) => {
    if (t.action === "DEDUCT") summary.totalDeductions += t.quantityChanged;
    if (t.action === "RESTOCK") summary.totalRestocks += t.quantityChanged;

    summary.actions.set(t.action, (summary.actions.get(t.action) || 0) + 1);
  });

  return {
    transactions,
    summary,
  };
}
```

---

## PHASE 4: SUPPLIER SLA MONITORING

### 4.1 Create `lib/slaMonitoring.ts`

```typescript
import { prisma } from "./prisma";

/**
 * Check supplier SLA compliance
 */
export async function checkSupplierSLACompliance(supplierId: string): Promise<any> {
  const sla = await prisma.supplierSLA.findUnique({
    where: { supplierId },
  });

  if (!sla) return null;

  // Get POs for last 90 days
  const pos = await prisma.supplierPO.findMany({
    where: {
      supplierId,
      issueDate: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
  });

  let onTimeCount = 0;
  let lateCount = 0;
  const deliveryTimes: number[] = [];

  pos.forEach((po) => {
    if (po.receivedDate && po.dueDate) {
      const leadTime = Math.ceil(
        (po.receivedDate.getTime() - po.issueDate!.getTime()) / (1000 * 60 * 60 * 24)
      );
      deliveryTimes.push(leadTime);

      if (po.receivedDate <= po.dueDate) {
        onTimeCount += 1;
      } else {
        lateCount += 1;
      }
    }
  });

  const onTimeRate = pos.length > 0 ? (onTimeCount / pos.length) * 100 : 100;
  const avgLeadTime = deliveryTimes.length > 0
    ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
    : 0;

  return {
    supplierId,
    slaTarget: sla.onTimeDeliveryTarget,
    actualPerformance: onTimeRate,
    compliant: onTimeRate >= sla.onTimeDeliveryTarget,
    onTimeCount,
    lateCount,
    avgLeadTime,
    standardLeadTime: sla.standardLeadTimeDays,
  };
}

/**
 * Monitor all supplier SLAs
 */
export async function monitorAllSupplierSLAs(): Promise<any[]> {
  const slas = await prisma.supplierSLA.findMany({
    include: { supplier: true },
  });

  const results = await Promise.all(
    slas.map((sla) => checkSupplierSLACompliance(sla.supplierId))
  );

  return results.filter((r) => !r.compliant); // Only non-compliant ones
}
```

---

## PHASE 5: VALIDATION CHECKLIST

After implementation, verify:

- [ ] Inventory models created
- [ ] Forecasts calculate from historical demand
- [ ] Audit log records all transactions
- [ ] Low stock alerts trigger correctly
- [ ] SLA compliance calculates on-time delivery rate
- [ ] Auto-reorder checks run without errors
- [ ] Audit reports generate correctly
- [ ] All TypeScript types compile
- [ ] Database migrations run successfully

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document the error and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 5 phases now. Do not wait for any confirmation. Report results when complete.
