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
