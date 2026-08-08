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
