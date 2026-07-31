import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token || typeof token !== "string") {
      const loginUrl = new URL("/portal", req.url);
      loginUrl.searchParams.set("error", "invalid_verification_token");
      return NextResponse.redirect(loginUrl);
    }

    const tokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { application: true },
    });

    if (!tokenRecord || tokenRecord.usedAt !== null || tokenRecord.expiresAt < new Date()) {
      const loginUrl = new URL("/portal", req.url);
      loginUrl.searchParams.set("error", "verification_token_expired_or_used");
      return NextResponse.redirect(loginUrl);
    }

    // Mark token used and update B2bApplication status to UNDER_REVIEW + set emailVerifiedAt
    await prisma.$transaction([
      prisma.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.b2bApplication.update({
        where: { id: tokenRecord.applicationId },
        data: {
          emailVerifiedAt: new Date(),
          status: tokenRecord.application.status === "SUBMITTED" ? "UNDER_REVIEW" : tokenRecord.application.status,
        },
      }),
    ]);

    const verifiedUrl = new URL("/portal/email-verified", req.url);
    return NextResponse.redirect(verifiedUrl);
  } catch (error) {
    console.error("Error verifying application email:", error);
    const loginUrl = new URL("/portal", req.url);
    loginUrl.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(loginUrl);
  }
}
