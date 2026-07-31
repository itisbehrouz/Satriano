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

export interface SendMagicLinkEmailParams {
  to: string;
  magicLinkUrl: string;
}

export async function sendMagicLinkEmail({
  to,
  magicLinkUrl,
}: SendMagicLinkEmailParams): Promise<{ success: boolean; messageId?: string }> {
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
      subject: "Client Portal Access Link - Satriano Atelier",
      text: `Hello,\n\nUse the link below to access your Satriano Atelier Client Portal orders & proforma invoices:\n\n${magicLinkUrl}\n\nThis link is valid for 15 minutes and can only be used once.\n\nBest regards,\nSatriano Atelier Team`,
      html: `<div font-family="sans-serif"><h2>Satriano Atelier Client Portal</h2><p>Click the button below to access your orders and proforma invoices:</p><p><a href="${magicLinkUrl}" style="background:#2E5AAC;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">Access Client Portal →</a></p><p style="color:#5B6B85;font-size:12px;">This single-use link expires in 15 minutes.</p></div>`,
    });

    return { success: true, messageId: info.messageId };
  }

  console.log(`[EMAIL MOCK] Magic link email sent to ${to}`);
  return { success: true, messageId: `mock_magic_${Date.now()}` };
}

export interface SendVerificationEmailParams {
  to: string;
  verificationUrl: string;
}

export async function sendVerificationEmail({
  to,
  verificationUrl,
}: SendVerificationEmailParams): Promise<{ success: boolean; messageId?: string }> {
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
      subject: "Verify Your B2B Partner Application - Satriano Atelier",
      text: `Hello,\n\nPlease verify your email address to complete your B2B partner application for Satriano Atelier:\n\n${verificationUrl}\n\nThis verification link is valid for 24 hours.\n\nBest regards,\nSatriano Atelier Team`,
      html: `<div style="font-family:sans-serif"><h2>Verify Your B2B Application</h2><p>Please click the button below to verify your corporate email address and submit your application for account review:</p><p><a href="${verificationUrl}" style="background:#2E5AAC;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">Verify Email Address →</a></p><p style="color:#5B6B85;font-size:12px;">This link is valid for 24 hours.</p></div>`,
    });

    return { success: true, messageId: info.messageId };
  }

  console.log(`[EMAIL MOCK] Verification email sent to ${to}`);
  return { success: true, messageId: `mock_verify_${Date.now()}` };
}
