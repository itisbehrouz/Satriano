import nodemailer from "nodemailer";

export interface SendProformaEmailParams {
  to: string;
  companyName: string;
  refNo: string;
  pdfBuffer: Buffer;
}

export async function sendProformaEmail({
  to,
  companyName,
  refNo,
  pdfBuffer,
}: SendProformaEmailParams): Promise<{ success: boolean; messageId?: string }> {
  // If SMTP environment variables are provided, send via Nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Satriano Atelier" <no-reply@satrianoatelier.com>',
      to,
      subject: `Proforma Invoice ${refNo} - Satriano Atelier`,
      text: `Dear ${companyName},\n\nPlease find attached your proforma invoice (${refNo}).\n\nBest regards,\nSatriano Atelier Team`,
      attachments: [
        {
          filename: `Proforma_${refNo}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return { success: true, messageId: info.messageId };
  }

  // Development/fallback mode: simulate send
  console.log(`[EMAIL MOCK] Proforma ${refNo} sent to ${to} for ${companyName}`);
  return { success: true, messageId: `mock_${Date.now()}` };
}
