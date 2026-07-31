import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawEmail = body.corpEmail || body.email;

    if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid corporate email address is required." },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase().trim();

    const genericResponse = NextResponse.json({
      success: true,
      message: "If an unverified application exists for this email, we've sent a new verification link.",
    });

    // Rate Limit: Max 3 resend requests per email in 15 minutes
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentRequestsCount = await prisma.emailVerificationToken.count({
      where: {
        application: { corpEmail: email },
        createdAt: { gte: fifteenMinsAgo },
      },
    });

    if (recentRequestsCount >= 3) {
      return NextResponse.json(
        { error: "Too many verification requests. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    const application = await prisma.b2bApplication.findFirst({
      where: {
        corpEmail: { equals: email, mode: "insensitive" },
        emailVerifiedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!application) {
      return genericResponse;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: {
        applicationId: application.id,
        token,
        expiresAt,
      },
    });

    const host = req.headers.get("host") || "satriano.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const verificationUrl = `${protocol}://${host}/portal/verify-email?token=${token}`;

    await sendVerificationEmail({
      to: application.corpEmail,
      verificationUrl,
    });

    return genericResponse;
  } catch (error) {
    console.error("Error resending verification email:", error);
    return NextResponse.json(
      { error: "Failed to process resend verification request." },
      { status: 500 }
    );
  }
}
