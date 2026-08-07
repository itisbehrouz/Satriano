# AGENT 6 — RBAC & REAL-TIME NOTIFICATIONS

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Implement granular Role-Based Access Control (RBAC) for admin users. Add real-time notifications system for order status updates, inventory alerts, and production events.

**Scope:** Database models, RBAC middleware, notification engine, WebSocket implementation. **Execute all phases without any confirmations.**

---

## PHASE 1: RBAC DATABASE SCHEMA

### 1.1 Update `prisma/schema.prisma`

Add admin roles and permissions:

```prisma
// ============================================================================
// RBAC MODELS
// ============================================================================

enum AdminRole {
  SUPER_ADMIN          // Full access
  OPERATIONS_MANAGER   // Orders, production, fulfillment
  SALES_MANAGER        // Applications, pricing, feasibility
  CATALOG_MANAGER      // Products, fabrics, MOQs
  WHOLESALE_MANAGER    // Suppliers, inventory, stock
  FINANCE_MANAGER      // Payments, invoicing, reports
  QUALITY_MANAGER      // QC checks, production tracking
}

enum PermissionScope {
  APPLICATIONS         // B2B applications
  ORDERS_M2O           // Made-to-order orders
  ORDERS_WHOLESALE     // Wholesale orders
  CATALOG_PRODUCTS     // Product management
  CATALOG_MATERIALS    // Fabric/material management
  SUPPLIERS            // Supplier management
  INVENTORY            // Stock management
  PAYMENTS             // Payment processing
  PRODUCTION           // Work orders & QC
  REPORTS              // Analytics & reporting
  SETTINGS             // System configuration
}

enum PermissionAction {
  VIEW
  CREATE
  UPDATE
  DELETE
  APPROVE
  REJECT
}

model AdminUser {
  id String @id @default(cuid())
  email String @unique
  name String
  
  // Role assignment
  role AdminRole @default(OPERATIONS_MANAGER)
  
  // Access control
  isActive Boolean @default(true)
  lastLoginAt DateTime?
  
  // Custom permissions (overrides role defaults)
  customPermissions AdminPermission[]
  
  // Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([role])
}

model AdminPermission {
  id String @id @default(cuid())
  adminUserId String
  adminUser AdminUser @relation(fields: [adminUserId], references: [id], onDelete: Cascade)
  
  // Permission definition
  scope PermissionScope
  action PermissionAction
  
  // Granular resource restrictions (optional)
  resourceId String? // e.g., supplierId, categoryId
  resourceType String? // e.g., "supplier", "category"
  
  // Status
  isGranted Boolean @default(true) // Can be used to deny permissions
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([adminUserId, scope, action, resourceId])
  @@index([adminUserId])
}

// Audit trail for admin actions
model AdminAuditLog {
  id String @id @default(cuid())
  adminUserId String
  adminEmail String
  
  // Action details
  action String // e.g., "UPDATE_ORDER_STATUS", "CREATE_WORK_ORDER"
  resourceType String // e.g., "Order", "WorkOrder"
  resourceId String
  
  // Changes
  changes String? // JSON of before/after values
  ipAddress String?
  userAgent String?
  
  // Status
  success Boolean @default(true)
  errorMessage String?
  
  createdAt DateTime @default(now())

  @@index([adminUserId])
  @@index([action])
  @@index([resourceType])
}
```

### 1.2 Run Migration

```bash
npx prisma migrate dev --name add_rbac_system
npx prisma generate
```

---

## PHASE 2: RBAC MIDDLEWARE & HELPERS

### 2.1 Create `lib/rbac.ts`

Role and permission definitions:

```typescript
import { AdminRole, PermissionScope, PermissionAction } from "@prisma/client";

/**
 * Default permissions per role
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Array<{ scope: PermissionScope; actions: PermissionAction[] }>> = {
  SUPER_ADMIN: [
    { scope: "APPLICATIONS", actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT"] },
    { scope: "ORDERS_M2O", actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT"] },
    { scope: "ORDERS_WHOLESALE", actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT"] },
    { scope: "CATALOG_PRODUCTS", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
    { scope: "CATALOG_MATERIALS", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
    { scope: "SUPPLIERS", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
    { scope: "INVENTORY", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
    { scope: "PAYMENTS", actions: ["VIEW", "UPDATE", "APPROVE"] },
    { scope: "PRODUCTION", actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "APPROVE"] },
    { scope: "REPORTS", actions: ["VIEW"] },
    { scope: "SETTINGS", actions: ["VIEW", "UPDATE"] },
  ],
  
  OPERATIONS_MANAGER: [
    { scope: "ORDERS_M2O", actions: ["VIEW", "UPDATE"] },
    { scope: "ORDERS_WHOLESALE", actions: ["VIEW", "UPDATE"] },
    { scope: "INVENTORY", actions: ["VIEW", "UPDATE"] },
    { scope: "PRODUCTION", actions: ["VIEW", "UPDATE"] },
    { scope: "REPORTS", actions: ["VIEW"] },
  ],
  
  SALES_MANAGER: [
    { scope: "APPLICATIONS", actions: ["VIEW", "UPDATE", "APPROVE", "REJECT"] },
    { scope: "ORDERS_M2O", actions: ["VIEW", "UPDATE"] },
    { scope: "CATALOG_PRODUCTS", actions: ["VIEW"] },
    { scope: "CATALOG_MATERIALS", actions: ["VIEW"] },
    { scope: "REPORTS", actions: ["VIEW"] },
  ],
  
  CATALOG_MANAGER: [
    { scope: "CATALOG_PRODUCTS", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
    { scope: "CATALOG_MATERIALS", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
    { scope: "ORDERS_M2O", actions: ["VIEW"] },
  ],
  
  WHOLESALE_MANAGER: [
    { scope: "SUPPLIERS", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
    { scope: "INVENTORY", actions: ["VIEW", "CREATE", "UPDATE"] },
    { scope: "ORDERS_WHOLESALE", actions: ["VIEW"] },
  ],
  
  FINANCE_MANAGER: [
    { scope: "PAYMENTS", actions: ["VIEW", "UPDATE"] },
    { scope: "REPORTS", actions: ["VIEW"] },
    { scope: "ORDERS_M2O", actions: ["VIEW"] },
    { scope: "ORDERS_WHOLESALE", actions: ["VIEW"] },
  ],
  
  QUALITY_MANAGER: [
    { scope: "PRODUCTION", actions: ["VIEW", "UPDATE", "APPROVE"] },
    { scope: "ORDERS_M2O", actions: ["VIEW"] },
    { scope: "REPORTS", actions: ["VIEW"] },
  ],
};

/**
 * Check if user has permission
 */
export function hasPermission(
  userRole: AdminRole,
  scope: PermissionScope,
  action: PermissionAction,
  customPermissions?: Array<{ scope: PermissionScope; action: PermissionAction; isGranted: boolean }>
): boolean {
  // Check custom permissions first (can deny even if role allows)
  if (customPermissions) {
    const custom = customPermissions.find((p) => p.scope === scope && p.action === action);
    if (custom && !custom.isGranted) return false; // Explicitly denied
    if (custom && custom.isGranted) return true; // Explicitly granted
  }

  // Check role-based permissions
  const rolePerms = ROLE_PERMISSIONS[userRole];
  if (!rolePerms) return false;

  const scopePerms = rolePerms.find((p) => p.scope === scope);
  if (!scopePerms) return false;

  return scopePerms.actions.includes(action);
}

/**
 * Get all accessible resources for a user
 */
export function getAccessibleResources(
  userRole: AdminRole,
  customPermissions?: Array<{ scope: PermissionScope; resourceId?: string; isGranted: boolean }>
): Set<PermissionScope> {
  const rolePerms = ROLE_PERMISSIONS[userRole];
  const accessible = new Set<PermissionScope>();

  rolePerms?.forEach((p) => {
    const custom = customPermissions?.find((cp) => cp.scope === p.scope);
    if (custom && !custom.isGranted) return; // Skip if denied

    accessible.add(p.scope);
  });

  return accessible;
}
```

### 2.2 Create `middleware/rbac.ts`

RBAC middleware for API routes:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jose";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { PermissionScope, PermissionAction } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "");

export interface AdminSession {
  email: string;
  role: string;
  userId: string;
}

/**
 * Verify admin session and check permissions
 */
export async function requirePermission(
  request: NextRequest,
  requiredScope: PermissionScope,
  requiredAction: PermissionAction
): Promise<{ valid: true; admin: AdminSession } | { valid: false; response: NextResponse }> {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) {
      return {
        valid: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const verified = await verify(token, JWT_SECRET);
    const email = verified.email as string;

    if (!email) {
      return {
        valid: false,
        response: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
      };
    }

    // Fetch admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
      include: { customPermissions: true },
    });

    if (!adminUser || !adminUser.isActive) {
      return {
        valid: false,
        response: NextResponse.json({ error: "Admin account inactive" }, { status: 403 }),
      };
    }

    // Check permissions
    const permitted = hasPermission(
      adminUser.role as any,
      requiredScope,
      requiredAction,
      adminUser.customPermissions
    );

    if (!permitted) {
      return {
        valid: false,
        response: NextResponse.json(
          { error: `Insufficient permissions for ${requiredScope}:${requiredAction}` },
          { status: 403 }
        ),
      };
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      valid: true,
      admin: {
        email: adminUser.email,
        role: adminUser.role,
        userId: adminUser.id,
      },
    };
  } catch (error) {
    return {
      valid: false,
      response: NextResponse.json({ error: "Authentication failed" }, { status: 401 }),
    };
  }
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
  adminEmail: string,
  action: string,
  resourceType: string,
  resourceId: string,
  changes?: any,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminEmail,
        action,
        resourceType,
        resourceId,
        changes: changes ? JSON.stringify(changes) : null,
        success,
        errorMessage,
      },
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
```

---

## PHASE 3: REAL-TIME NOTIFICATIONS

### 3.1 Create `lib/notifications.ts`

Notification engine:

```typescript
import { prisma } from "./prisma";

export type NotificationType =
  | "ORDER_STATUS_CHANGED"
  | "PAYMENT_RECEIVED"
  | "PRODUCTION_STARTED"
  | "PRODUCTION_COMPLETED"
  | "LOW_STOCK_ALERT"
  | "INVENTORY_DEPLETED"
  | "PROFORMA_GENERATED"
  | "PO_ACKNOWLEDGED"
  | "SHIPMENT_READY";

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  resourceType: string; // "Order", "WorkOrder", "WholesaleStock", etc.
  resourceId: string;
  recipientEmails?: string[]; // Admin emails to notify
  data?: Record<string, any>;
}

/**
 * Create and broadcast notification
 */
export async function createNotification(
  payload: NotificationPayload
): Promise<void> {
  try {
    // Store notification in database for persistence
    // (Future: integrate with notification table)

    // Broadcast via WebSocket to connected admin clients
    if (typeof window === "undefined") {
      // Server-side: use server-sent events or websocket server
      // TODO: Implement server-side broadcast
      console.log(`[NOTIFICATION] ${payload.type}: ${payload.message}`);
    } else {
      // Client-side: emit event
      const event = new CustomEvent("notification", { detail: payload });
      window.dispatchEvent(event);
    }
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

/**
 * Notification templates
 */
export const NotificationTemplates = {
  ORDER_PAID: (orderId: string, amount: string): NotificationPayload => ({
    type: "PAYMENT_RECEIVED",
    title: "Payment Received",
    message: `Order ${orderId} payment confirmed: ${amount}`,
    resourceType: "Order",
    resourceId: orderId,
  }),

  PRODUCTION_STARTED: (workOrderNo: string, orderId: string): NotificationPayload => ({
    type: "PRODUCTION_STARTED",
    title: "Production Started",
    message: `Work order ${workOrderNo} moved to production`,
    resourceType: "ProductionWorkOrder",
    resourceId: workOrderNo,
    data: { orderId },
  }),

  LOW_STOCK_ALERT: (sku: string, quantity: number, threshold: number): NotificationPayload => ({
    type: "LOW_STOCK_ALERT",
    title: "Low Stock Alert",
    message: `${sku} has ${quantity} units (threshold: ${threshold})`,
    resourceType: "WholesaleStock",
    resourceId: sku,
  }),

  INVENTORY_DEPLETED: (sku: string): NotificationPayload => ({
    type: "INVENTORY_DEPLETED",
    title: "Stock Depleted",
    message: `${sku} is now out of stock`,
    resourceType: "WholesaleStock",
    resourceId: sku,
  }),

  PROFORMA_GENERATED: (orderId: string, refNo: string): NotificationPayload => ({
    type: "PROFORMA_GENERATED",
    title: "Proforma Generated",
    message: `Proforma ${refNo} for order ${orderId} is ready`,
    resourceType: "Order",
    resourceId: orderId,
    data: { refNo },
  }),
};
```

### 3.2 Create `app/api/notifications/subscribe/route.ts`

Server-Sent Events (SSE) for real-time updates:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "");

// In-memory subscribers (replace with Redis in production)
const subscribers = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  try {
    // Verify admin auth
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await verify(token, JWT_SECRET);

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        subscribers.add(controller);

        // Send initial connection confirmation
        controller.enqueue(
          `data: ${JSON.stringify({ type: "CONNECTED", message: "Notification stream active" })}\n\n`
        );

        // Cleanup on disconnect
        request.signal.addEventListener("abort", () => {
          subscribers.delete(controller);
          controller.close();
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

/**
 * Broadcast notification to all subscribers
 */
export function broadcastNotification(data: any): void {
  const message = `data: ${JSON.stringify(data)}\n\n`;

  subscribers.forEach((controller) => {
    try {
      controller.enqueue(message);
    } catch (error) {
      subscribers.delete(controller);
    }
  });
}
```

### 3.3 Create `lib/notificationHooks.ts`

Integrate notifications into existing workflows:

```typescript
import { Order, ProductionWorkOrder, WholesaleStock } from "@prisma/client";
import { createNotification, NotificationTemplates } from "./notifications";

/**
 * Hook into order status changes
 */
export async function onOrderStatusChanged(
  order: Order,
  previousStatus: string,
  newStatus: string
): Promise<void> {
  if (newStatus === "PAID") {
    const amount = `$${(order.finalPriceCents / 100).toFixed(2)}`;
    await createNotification(NotificationTemplates.ORDER_PAID(order.id, amount));
  }

  if (newStatus === "IN_PRODUCTION") {
    // TODO: Fetch work order and send notification
  }

  if (newStatus === "SHIPPED") {
    // TODO: Send shipment notification
  }
}

/**
 * Hook into work order creation
 */
export async function onWorkOrderCreated(
  workOrder: ProductionWorkOrder
): Promise<void> {
  await createNotification(
    NotificationTemplates.PRODUCTION_STARTED(workOrder.workOrderNo, workOrder.orderId)
  );
}

/**
 * Hook into inventory changes
 */
export async function onInventoryUpdated(
  product: WholesaleStock,
  previousQuantity: number,
  newQuantity: number,
  threshold: number
): Promise<void> {
  if (newQuantity <= 0) {
    await createNotification(NotificationTemplates.INVENTORY_DEPLETED(product.productId));
  } else if (newQuantity <= threshold && previousQuantity > threshold) {
    await createNotification(
      NotificationTemplates.LOW_STOCK_ALERT(product.productId, newQuantity, threshold)
    );
  }
}

/**
 * Hook into proforma generation
 */
export async function onProformaGenerated(
  orderId: string,
  refNo: string
): Promise<void> {
  await createNotification(NotificationTemplates.PROFORMA_GENERATED(orderId, refNo));
}
```

---

## PHASE 4: NOTIFICATION UI COMPONENT

### 4.1 Create `components/admin/NotificationCenter.tsx`

Real-time notification display:

```typescript
"use client";

import { useEffect, useState } from "react";

interface Notification {
  type: string;
  title: string;
  message: string;
  timestamp: Date;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Subscribe to SSE stream
    const eventSource = new EventSource("/api/notifications/subscribe");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== "CONNECTED") {
          setNotifications((prev) => [
            { ...data, timestamp: new Date() },
            ...prev.slice(0, 49), // Keep last 50
          ]);
        }
      } catch (error) {
        console.error("Failed to parse notification:", error);
      }
    };

    eventSource.onerror = () => {
      console.error("Notification stream error");
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-medium text-gray-900">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Intl.DateTimeFormat("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(notif.timestamp)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 5: SEED RBAC DATA

### 5.1 Update `prisma/seed.ts`

Add admin user seeding:

```typescript
// Add to seed.ts

console.log("Seeding admin users and roles...");

const adminUsers = [
  {
    email: "super@satriano.local",
    name: "Super Administrator",
    role: "SUPER_ADMIN" as const,
  },
  {
    email: "ops@satriano.local",
    name: "Operations Manager",
    role: "OPERATIONS_MANAGER" as const,
  },
  {
    email: "sales@satriano.local",
    name: "Sales Manager",
    role: "SALES_MANAGER" as const,
  },
  {
    email: "catalog@satriano.local",
    name: "Catalog Manager",
    role: "CATALOG_MANAGER" as const,
  },
  {
    email: "wholesale@satriano.local",
    name: "Wholesale Manager",
    role: "WHOLESALE_MANAGER" as const,
  },
  {
    email: "finance@satriano.local",
    name: "Finance Manager",
    role: "FINANCE_MANAGER" as const,
  },
  {
    email: "quality@satriano.local",
    name: "Quality Manager",
    role: "QUALITY_MANAGER" as const,
  },
];

for (const user of adminUsers) {
  await prisma.adminUser.upsert({
    where: { email: user.email },
    update: {},
    create: {
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: true,
    },
  });
}

console.log("✓ Admin users seeded");
```

Run seed:
```bash
npx prisma db seed
```

---

## PHASE 6: VALIDATION CHECKLIST

After implementation, verify:

- [ ] AdminUser model created
- [ ] AdminPermission model created
- [ ] AdminAuditLog model created
- [ ] RBAC middleware compiles
- [ ] Notification templates work
- [ ] SSE subscription endpoint works
- [ ] NotificationCenter component renders
- [ ] Admin users seeded (7 roles)
- [ ] All TypeScript types compile
- [ ] Permissions grant/deny correctly per role

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document the error and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 6 phases now. Do not wait for any confirmation. Report results when complete.
