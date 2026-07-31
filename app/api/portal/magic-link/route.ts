import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMagicLinkEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawEmail = body.email;

    if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid corporate email address is required." },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase().trim();

    // Rate Limit: Max 3 magic-link requests per email in 15 minutes
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentRequestsCount = await prisma.magicLinkToken.count({
      where: {
        email,
        createdAt: { gte: fifteenMinsAgo },
      },
    });

    if (recentRequestsCount >= 3) {
      return NextResponse.json(
        { error: "Too many login link requests. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    // Generate token & 15-minute expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.magicLinkToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Build URL base dynamically from host header or fallback to satriano.vercel.app
    const host = req.headers.get("host") || "satriano.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const magicLinkUrl = `${protocol}://${host}/portal/verify?token=${token}`;

    await sendMagicLinkEmail({ to: email, magicLinkUrl });

    // Generic security response preventing email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, we've sent a login link.",
    });
  } catch (error) {
    console.error("Error creating magic link token:", error);
    return NextResponse.json(
      { error: "Failed to process magic link request." },
      { status: 500 }
    );
  }
}
