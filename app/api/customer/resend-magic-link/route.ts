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

    // Rate limit: max 3 requests per 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.magicLinkToken.count({
      where: {
        email,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= 3) {
      return NextResponse.json(
        { error: "Too many magic link requests. Please wait an hour before trying again." },
        { status: 429 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.magicLinkToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const host = req.headers.get("host") || "satriano.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const magicLinkUrl = `${protocol}://${host}/portal/verify?token=${token}`;

    await sendMagicLinkEmail({ to: email, magicLinkUrl });

    return NextResponse.json({
      success: true,
      message: `Magic link email re-sent to ${email}. Check your inbox.`,
    });
  } catch (error) {
    console.error("Error resending magic link:", error);
    return NextResponse.json(
      { error: "Failed to resend magic link." },
      { status: 500 }
    );
  }
}
