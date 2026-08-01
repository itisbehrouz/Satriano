import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await verifyAdminRequest(req);
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized access to Portal Console API." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const application = await prisma.b2bApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Application record not found." }, { status: 404 });
    }

    if (application.emailVerifiedAt !== null) {
      return NextResponse.json(
        { error: "Email address is already verified." },
        { status: 400 }
      );
    }

    // Invalidate existing tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { applicationId: id },
    });

    // Generate new token (24h expiry)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: {
        applicationId: id,
        token,
        expiresAt,
      },
    });

    // Send verification email via Resend / email helper
    const host = req.headers.get("host") || "satriano.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const verificationUrl = `${protocol}://${host}/portal/verify-email?token=${token}`;

    await sendVerificationEmail({
      to: application.corpEmail,
      verificationUrl,
    });

    return NextResponse.json({
      success: true,
      message: `Verification link successfully resent to ${application.corpEmail}.`,
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email." },
      { status: 500 }
    );
  }
}
