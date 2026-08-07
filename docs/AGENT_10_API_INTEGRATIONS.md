# AGENT 10 — API & INTEGRATIONS

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Build robust third-party integrations with Stripe webhook enhancements, Zapier/Make.com connection points, EDI supplier APIs, and accounting software sync.

**Scope:** Integration adapters, webhook retry logic, external API clients. **Execute all phases without any confirmations.**

---

## PHASE 1: STRIPE WEBHOOK ROBUSTNESS

### 1.1 Update `app/api/payment/webhook/route.ts`

Enhanced webhook handling with retry:

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// In-memory retry queue (use Redis in production)
const retryQueue: Map<string, { attempts: number; nextRetry: Date }> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Idempotency check: Avoid processing same event twice
    const existingLog = await prisma.webhookLog.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existingLog && existingLog.processed) {
      return NextResponse.json({ success: true, cached: true });
    }

    // Process event
    let processed = false;
    let error: string | null = null;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          processed = true;
          break;

        case "charge.failed":
          await handleChargeFailed(event.data.object as Stripe.Charge);
          processed = true;
          break;

        case "charge.refunded":
          await handleChargeRefunded(event.data.object as Stripe.Charge);
          processed = true;
          break;

        // Add more event handlers as needed
      }
    } catch (err: any) {
      error = err.message;
      processed = false;
    }

    // Log webhook
    await prisma.webhookLog.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        processed,
        errorMessage: error,
        rawPayload: body,
      },
    });

    return NextResponse.json({ success: processed, error });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Implementation from Agent 4
}

async function handleChargeFailed(charge: Stripe.Charge) {
  // Implementation
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  // Implementation
}
```

### 1.2 Add Webhook Log Model to Prisma

```prisma
model WebhookLog {
  id String @id @default(cuid())
  stripeEventId String @unique
  eventType String
  processed Boolean @default(false)
  errorMessage String?
  rawPayload String // Store full payload for debugging
  
  createdAt DateTime @default(now())
  
  @@index([processed])
  @@index([eventType])
}
```

---

## PHASE 2: ZAPIER / MAKE.COM INTEGRATION POINTS

### 2.1 Create `app/api/integrations/webhooks/route.ts`

Outbound webhooks for Zapier/Make integration:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "");

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await verify(token, JWT_SECRET);

    const body = await request.json();
    const { event, targetUrl, active } = body;

    if (!event || !targetUrl) {
      return NextResponse.json({ error: "Missing event or targetUrl" }, { status: 400 });
    }

    // Save webhook subscription
    const webhook = await prisma.externalWebhook.upsert({
      where: { targetUrl_event: { targetUrl, event } },
      update: { active },
      create: { event, targetUrl, active: active !== false },
    });

    return NextResponse.json(webhook);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await verify(token, JWT_SECRET);

    const webhooks = await prisma.externalWebhook.findMany();
    return NextResponse.json(webhooks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 2.2 Create `lib/externalWebhooks.ts`

```typescript
import { prisma } from "./prisma";

/**
 * Trigger external webhooks when events occur
 */
export async function triggerExternalWebhook(
  event: string,
  payload: any
): Promise<void> {
  const webhooks = await prisma.externalWebhook.findMany({
    where: { event, active: true },
  });

  for (const webhook of webhooks) {
    try {
      const response = await fetch(webhook.targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, timestamp: new Date(), payload }),
      });

      if (!response.ok) {
        console.warn(`Webhook delivery failed for ${webhook.targetUrl}:`, response.status);
      }
    } catch (error: any) {
      console.error(`Failed to trigger webhook ${webhook.targetUrl}:`, error.message);
    }
  }
}

// Export events for different triggers
export const WEBHOOK_EVENTS = {
  ORDER_CREATED: "order.created",
  ORDER_PAID: "order.paid",
  ORDER_SHIPPED: "order.shipped",
  PRODUCT_UPDATED: "product.updated",
  INVENTORY_LOW: "inventory.low_stock",
};
```

---

## PHASE 3: EDI SUPPLIER APIs

### 3.1 Create `lib/suppliers/ediAdapter.ts`

```typescript
export interface EDIMessage {
  type: "855" | "856" | "997"; // EDI document types
  content: string;
  supplier: string;
  timestamp: Date;
}

/**
 * EDI 855: Purchase Order Acknowledgment
 * Supplier confirms PO receipt and delivery dates
 */
export async function parseEDI855(content: string): Promise<{
  poNo: string;
  status: string;
  expectedDelivery: Date;
  items: Array<{ sku: string; quantity: number }>;
}> {
  // Parse EDI X12 855 format
  // This is a stub — actual parsing requires EDI X12 library
  console.log("Parsing EDI 855:", content);
  
  return {
    poNo: "PO-123",
    status: "ACCEPTED",
    expectedDelivery: new Date(),
    items: [],
  };
}

/**
 * EDI 856: Ship Notice/Manifest
 * Supplier notifies of shipment
 */
export async function parseEDI856(content: string): Promise<{
  poNo: string;
  shipDate: Date;
  trackingNo: string;
  items: Array<{ sku: string; quantity: number }>;
}> {
  console.log("Parsing EDI 856:", content);
  
  return {
    poNo: "PO-123",
    shipDate: new Date(),
    trackingNo: "TRACK123",
    items: [],
  };
}

/**
 * EDI 997: Functional Acknowledgment
 * System confirms receipt of EDI message
 */
export function generateEDI997(originalMessageId: string): string {
  // Generate X12 997 format
  return `GENERATE997:${originalMessageId}`;
}
```

---

## PHASE 4: ACCOUNTING SYNC (QuickBooks)

### 4.1 Create `lib/accounting/quickbooksSync.ts`

```typescript
export interface QuickBooksConfig {
  realmId: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Sync order to QuickBooks as an invoice
 */
export async function syncOrderToQuickBooks(
  orderId: string,
  qbConfig: QuickBooksConfig
): Promise<{ success: boolean; qbInvoiceId?: string; error?: string }> {
  // TODO: Implement QuickBooks API integration
  // Would sync order details, line items, customer info to QB invoice
  
  return {
    success: false,
    error: "QuickBooks integration not yet implemented",
  };
}

/**
 * Sync payment to QuickBooks
 */
export async function syncPaymentToQuickBooks(
  orderId: string,
  amountCents: number,
  qbConfig: QuickBooksConfig
): Promise<{ success: boolean; qbDepositId?: string }> {
  // TODO: Implement payment sync
  return { success: false };
}
```

---

## PHASE 5: INTEGRATION MODELS

### 5.1 Add to `prisma/schema.prisma`

```prisma
// External webhook subscriptions (for Zapier, Make, etc.)
model ExternalWebhook {
  id String @id @default(cuid())
  event String // "order.paid", "inventory.low", etc.
  targetUrl String // Zapier/Make webhook URL
  active Boolean @default(true)
  
  createdAt DateTime @default(now())
  lastTriggeredAt DateTime?
  
  @@unique([targetUrl, event])
  @@index([event])
}

// Integration configurations
model IntegrationConfig {
  id String @id @default(cuid())
  provider String // "quickbooks", "edi", "shopify", etc.
  
  config String // JSON: API keys, tokens, settings
  enabled Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([provider])
}
```

---

## PHASE 6: VALIDATION CHECKLIST

After implementation, verify:

- [ ] Webhook idempotency check prevents duplicates
- [ ] Stripe webhook logging works
- [ ] External webhooks can be subscribed
- [ ] Webhook triggers fire to external URLs
- [ ] EDI parsers extract data correctly
- [ ] QuickBooks sync structure ready
- [ ] Integration config model stores credentials securely
- [ ] All TypeScript types compile
- [ ] Database migrations run successfully

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document the error and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 6 phases now. Do not wait for any confirmation. Report results when complete.
