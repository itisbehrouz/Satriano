import { Resend } from "resend";
import { EmailTemplate } from "./emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

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
  } catch (error: unknown) {
    console.error("Email sending failed:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
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
