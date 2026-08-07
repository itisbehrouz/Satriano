# AGENT 7 — EMAIL & COMMUNICATION AUTOMATION

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Implement automated email delivery system for proformas, payment confirmations, order status updates, and supplier communications. Add customer support ticket system.

**Scope:** Email templates, Resend integration, transactional workflows, support ticketing. **Execute all phases without any confirmations.**

---

## PHASE 1: EMAIL TEMPLATE SYSTEM

### 1.1 Create `lib/emailTemplates.ts`

```typescript
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function proformaEmailTemplate(
  companyName: string,
  refNo: string,
  pdfUrl: string,
  validUntil: Date,
  totalAmount: string
): EmailTemplate {
  const validDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(validUntil);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0B1E3D; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; border: 1px solid #eee; }
          .button { background: #0B1E3D; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px; margin: 20px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SATRIANO Atelier</h1>
            <p>Proforma Invoice</p>
          </div>
          
          <div class="content">
            <p>Dear ${companyName},</p>
            
            <p>Your proforma invoice has been generated and is ready for review.</p>
            
            <table style="width: 100%; margin: 20px 0;">
              <tr>
                <td><strong>Reference:</strong></td>
                <td>${refNo}</td>
              </tr>
              <tr>
                <td><strong>Total Amount:</strong></td>
                <td style="color: #0B1E3D; font-size: 18px; font-weight: bold;">${totalAmount}</td>
              </tr>
              <tr>
                <td><strong>Valid Until:</strong></td>
                <td>${validDate}</td>
              </tr>
            </table>
            
            <p style="text-align: center;">
              <a href="${pdfUrl}" class="button">Download Proforma PDF</a>
            </p>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Review the proforma details</li>
              <li>Confirm quantities and specifications</li>
              <li>Arrange payment via bank transfer or credit card</li>
              <li>Production begins upon payment confirmation</li>
            </ol>
            
            <p><strong>Payment Methods:</strong></p>
            <ul>
              <li>Bank Transfer (T/T)</li>
              <li>Credit Card (Virtual POS)</li>
              <li>B2B Account Terms (approved customers)</li>
            </ul>
            
            <p>If you have any questions, please reply to this email or contact our sales team.</p>
            
            <p>Best regards,<br>SATRIANO Atelier Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email from SATRIANO Atelier. Please do not reply with sensitive information.</p>
            <p>© 2026 SATRIANO Atelier. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
SATRIANO Atelier - Proforma Invoice

Dear ${companyName},

Your proforma invoice has been generated and is ready for review.

Reference: ${refNo}
Total Amount: ${totalAmount}
Valid Until: ${validDate}

Download your proforma PDF: ${pdfUrl}

NEXT STEPS:
1. Review the proforma details
2. Confirm quantities and specifications
3. Arrange payment via bank transfer or credit card
4. Production begins upon payment confirmation

PAYMENT METHODS:
- Bank Transfer (T/T)
- Credit Card (Virtual POS)
- B2B Account Terms (approved customers)

If you have any questions, please reply to this email or contact our sales team.

Best regards,
SATRIANO Atelier Team
  `;

  return {
    subject: `Proforma Invoice ${refNo} - SATRIANO Atelier`,
    html,
    text,
  };
}

export function paymentConfirmationTemplate(
  companyName: string,
  orderId: string,
  amount: string,
  estimatedLeadTime: string
): EmailTemplate {
  return {
    subject: `Payment Confirmed - Order ${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Payment Received</h2>
            <p>Dear ${companyName},</p>
            <p>Thank you for your payment. Your order has been confirmed and production will begin immediately.</p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px;"><strong>Order ID:</strong></td>
                <td style="padding: 10px;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Amount Paid:</strong></td>
                <td style="padding: 10px;">${amount}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px;"><strong>Estimated Lead Time:</strong></td>
                <td style="padding: 10px;">${estimatedLeadTime}</td>
              </tr>
            </table>
            
            <p>You can track your order status on your customer portal.</p>
            <p>Best regards,<br>SATRIANO Atelier Team</p>
          </div>
        </body>
      </html>
    `,
    text: `Payment Received\n\nDear ${companyName},\n\nThank you for your payment.\n\nOrder ID: ${orderId}\nAmount Paid: ${amount}\nEstimated Lead Time: ${estimatedLeadTime}\n\nYou can track your order status on your customer portal.\n\nBest regards,\nSATRIANO Atelier Team`,
  };
}

export function orderStatusUpdateTemplate(
  companyName: string,
  orderId: string,
  status: string,
  message: string
): EmailTemplate {
  return {
    subject: `Order ${orderId} Status Update - ${status}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>${status}</h2>
            <p>Dear ${companyName},</p>
            <p>${message}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p>You can view full details on your customer portal.</p>
            <p>Best regards,<br>SATRIANO Atelier Team</p>
          </div>
        </body>
      </html>
    `,
    text: `${status}\n\nDear ${companyName},\n\n${message}\n\nOrder ID: ${orderId}\n\nBest regards,\nSATRIANO Atelier Team`,
  };
}

export function supplierPOTemplate(
  supplierName: string,
  poNo: string,
  dueDate: Date,
  totalAmount: string,
  pdfUrl: string
): EmailTemplate {
  const dueDateStr = new Intl.DateTimeFormat("en-US").format(dueDate);

  return {
    subject: `Purchase Order ${poNo} - SATRIANO Atelier`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Purchase Order</h2>
            <p>Dear ${supplierName},</p>
            <p>Please find attached your purchase order for materials supply.</p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px;"><strong>PO Number:</strong></td>
                <td style="padding: 10px;">${poNo}</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Total Amount:</strong></td>
                <td style="padding: 10px;">${totalAmount}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px;"><strong>Delivery Due:</strong></td>
                <td style="padding: 10px;">${dueDateStr}</td>
              </tr>
            </table>
            
            <p><a href="${pdfUrl}" style="background: #0B1E3D; color: white; padding: 10px 20px; text-decoration: none;">Download PO PDF</a></p>
            
            <p>Please confirm receipt and expected delivery date.</p>
            <p>Best regards,<br>SATRIANO Procurement Team</p>
          </div>
        </body>
      </html>
    `,
    text: `Purchase Order ${poNo}\n\nDear ${supplierName},\n\nPO Number: ${poNo}\nTotal Amount: ${totalAmount}\nDelivery Due: ${dueDateStr}\n\nDownload: ${pdfUrl}\n\nPlease confirm receipt.\n\nBest regards,\nSATRIANO Procurement Team`,
  };
}

export function supportTicketConfirmationTemplate(
  companyName: string,
  ticketId: string,
  subject: string
): EmailTemplate {
  return {
    subject: `Support Ticket #${ticketId} Received`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Support Ticket Received</h2>
            <p>Dear ${companyName},</p>
            <p>Thank you for contacting SATRIANO support. We have received your ticket and will respond within 24 business hours.</p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px;"><strong>Ticket ID:</strong></td>
                <td style="padding: 10px;">#${ticketId}</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Subject:</strong></td>
                <td style="padding: 10px;">${subject}</td>
              </tr>
            </table>
            
            <p>Please keep this ticket ID for reference when following up.</p>
            <p>Best regards,<br>SATRIANO Support Team</p>
          </div>
        </body>
      </html>
    `,
    text: `Support Ticket #${ticketId} Received\n\nDear ${companyName},\n\nTicket ID: #${ticketId}\nSubject: ${subject}\n\nWe will respond within 24 business hours.\n\nBest regards,\nSATRIANO Support Team`,
  };
}
```

---

## PHASE 2: RESEND INTEGRATION

### 2.1 Create `lib/emailService.ts`

```typescript
import { Resend } from "resend";
import { EmailTemplate } from "./emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@satrianoatelier.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@satrianoatelier.com";

export interface EmailPayload {
  to: string | string[];
  template: EmailTemplate;
  cc?: string[];
  bcc?: string[];
}

/**
 * Send email via Resend
 */
export async function sendEmail(payload: EmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const to = Array.isArray(payload.to) ? payload.to : [payload.to];

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.template.subject,
      html: payload.template.html,
      text: payload.template.text,
    });

    if (response.error) {
      console.error("Resend error:", response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true, messageId: response.data?.id };
  } catch (error: any) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send proforma to customer
 */
export async function sendProformaEmail(
  customerEmail: string,
  companyName: string,
  refNo: string,
  pdfUrl: string,
  validUntil: Date,
  totalAmount: string
): Promise<{ success: boolean; error?: string }> {
  const template = await import("./emailTemplates").then((m) =>
    m.proformaEmailTemplate(companyName, refNo, pdfUrl, validUntil, totalAmount)
  );

  const result = await sendEmail({
    to: customerEmail,
    template,
    bcc: [ADMIN_EMAIL], // Admin copy
  });

  if (!result.success) {
    // Log failed email attempt
    console.error(`Failed to send proforma ${refNo} to ${customerEmail}:`, result.error);
  }

  return result;
}

/**
 * Send payment confirmation
 */
export async function sendPaymentConfirmationEmail(
  customerEmail: string,
  companyName: string,
  orderId: string,
  amount: string,
  estimatedLeadTime: string
): Promise<{ success: boolean; error?: string }> {
  const template = await import("./emailTemplates").then((m) =>
    m.paymentConfirmationTemplate(companyName, orderId, amount, estimatedLeadTime)
  );

  return sendEmail({
    to: customerEmail,
    template,
    bcc: [ADMIN_EMAIL],
  });
}

/**
 * Send order status update
 */
export async function sendOrderStatusEmail(
  customerEmail: string,
  companyName: string,
  orderId: string,
  status: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const template = await import("./emailTemplates").then((m) =>
    m.orderStatusUpdateTemplate(companyName, orderId, status, message)
  );

  return sendEmail({
    to: customerEmail,
    template,
    bcc: [ADMIN_EMAIL],
  });
}

/**
 * Send supplier PO
 */
export async function sendSupplierPOEmail(
  supplierEmail: string,
  supplierName: string,
  poNo: string,
  dueDate: Date,
  totalAmount: string,
  pdfUrl: string
): Promise<{ success: boolean; error?: string }> {
  const template = await import("./emailTemplates").then((m) =>
    m.supplierPOTemplate(supplierName, poNo, dueDate, totalAmount, pdfUrl)
  );

  return sendEmail({
    to: supplierEmail,
    template,
    bcc: [ADMIN_EMAIL],
  });
}

/**
 * Send support ticket confirmation
 */
export async function sendSupportTicketConfirmationEmail(
  customerEmail: string,
  companyName: string,
  ticketId: string,
  subject: string
): Promise<{ success: boolean; error?: string }> {
  const template = await import("./emailTemplates").then((m) =>
    m.supportTicketConfirmationTemplate(companyName, ticketId, subject)
  );

  return sendEmail({
    to: customerEmail,
    template,
  });
}
```

---

## PHASE 3: SUPPORT TICKET SYSTEM

### 3.1 Update `prisma/schema.prisma`

Add support ticket models:

```prisma
enum SupportTicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_CUSTOMER
  RESOLVED
  CLOSED
}

enum SupportTicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model SupportTicket {
  id String @id @default(cuid())
  ticketNo String @unique
  companyId String
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  subject String
  description String
  status SupportTicketStatus @default(OPEN)
  priority SupportTicketPriority @default(MEDIUM)
  
  createdBy String? // Customer email
  assignedTo String? // Admin email
  
  messages TicketMessage[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  resolvedAt DateTime?

  @@index([companyId])
  @@index([status])
  @@index([priority])
}

model TicketMessage {
  id String @id @default(cuid())
  ticketId String
  ticket SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  
  authorEmail String
  authorRole String // "customer" or "admin"
  
  message String
  attachmentUrl String?
  
  createdAt DateTime @default(now())

  @@index([ticketId])
}
```

### 3.2 Create `app/api/support/tickets/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSupportTicketConfirmationEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("sat_customer_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, subject, description, priority } = body;

    if (!companyId || !subject || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Generate ticket number
    const ticketNo = `TKT-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 10000)
    ).padStart(4, "0")}`;

    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNo,
        companyId,
        subject,
        description,
        priority: priority || "MEDIUM",
        createdBy: company.email,
        status: "OPEN",
        messages: {
          create: {
            authorEmail: company.email,
            authorRole: "customer",
            message: description,
          },
        },
      },
      include: { messages: true },
    });

    // Send confirmation email
    await sendSupportTicketConfirmationEmail(company.email, company.name, ticket.ticketNo, subject);

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sat_customer_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId required" }, { status: 400 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { companyId },
      include: { messages: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## PHASE 4: EMAIL HOOKS INTO WORKFLOWS

### 4.1 Create `lib/emailHooks.ts`

Integrate emails into order lifecycle:

```typescript
import {
  sendProformaEmail,
  sendPaymentConfirmationEmail,
  sendOrderStatusEmail,
  sendSupplierPOEmail,
} from "./emailService";

/**
 * Hook into proforma generation
 */
export async function onProformaGenerated(
  orderId: string,
  refNo: string,
  pdfUrl: string,
  validUntil: Date,
  totalAmount: number,
  companyEmail: string,
  companyName: string
): Promise<void> {
  const amount = `$${(totalAmount / 100).toFixed(2)}`;
  
  await sendProformaEmail(
    companyEmail,
    companyName,
    refNo,
    pdfUrl,
    validUntil,
    amount
  );
}

/**
 * Hook into payment success
 */
export async function onPaymentSuccess(
  orderId: string,
  amount: number,
  companyEmail: string,
  companyName: string
): Promise<void> {
  const estimatedLeadTime = "14 business days";
  
  await sendPaymentConfirmationEmail(
    companyEmail,
    companyName,
    orderId,
    `$${(amount / 100).toFixed(2)}`,
    estimatedLeadTime
  );
}

/**
 * Hook into order status changes
 */
export async function onOrderStatusChanged(
  orderId: string,
  newStatus: string,
  companyEmail: string,
  companyName: string
): Promise<void> {
  const statusMessages: Record<string, string> = {
    PROFORMA_SENT: "Your proforma invoice is ready for review.",
    PAID: "Payment received. Production starts now.",
    IN_PRODUCTION: "Your order is now in production.",
    QUALITY_CHECK: "Order is undergoing quality control.",
    PACKED: "Order has been packed and is ready for shipment.",
    SHIPPED: "Your order has been shipped. Tracking info coming soon.",
  };

  const message = statusMessages[newStatus] || `Order status updated to ${newStatus}`;

  await sendOrderStatusEmail(
    companyEmail,
    companyName,
    orderId,
    newStatus,
    message
  );
}

/**
 * Hook into supplier PO creation
 */
export async function onSupplierPOCreated(
  poNo: string,
  supplierEmail: string,
  supplierName: string,
  dueDate: Date,
  totalAmount: number,
  pdfUrl: string
): Promise<void> {
  await sendSupplierPOEmail(
    supplierEmail,
    supplierName,
    poNo,
    dueDate,
    `$${(totalAmount / 100).toFixed(2)}`,
    pdfUrl
  );
}
```

---

## PHASE 5: VALIDATION CHECKLIST

After implementation, verify:

- [ ] Resend API key configured in `.env.local`
- [ ] Email templates render correctly
- [ ] Proforma email sends to customer + BCC admin
- [ ] Payment confirmation email sends
- [ ] Order status email sends for status changes
- [ ] Supplier PO email sends to supplier
- [ ] Support ticket creation creates ticket + sends confirmation
- [ ] Support ticket retrieval works by companyId
- [ ] All email hooks integrate without errors
- [ ] Failed emails are logged (not blocking)

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document the error and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 5 phases now. Do not wait for any confirmation. Report results when complete.
