import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCustomerToken } from "@/lib/customerAuth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token || typeof token !== "string") {
      const loginUrl = new URL("/portal", req.url);
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl);
    }

    const tokenRecord = await prisma.magicLinkToken.findUnique({
      where: { token },
    });

    // Check validity: must exist, not expired, and not already used (single use enforcement)
    if (!tokenRecord || tokenRecord.usedAt !== null || tokenRecord.expiresAt < new Date()) {
      const loginUrl = new URL("/portal", req.url);
      loginUrl.searchParams.set("error", "link_expired_or_used");
      return NextResponse.redirect(loginUrl);
    }

    // Single-use enforcement: mark token as used immediately
    await prisma.magicLinkToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    // Create 24h signed customer JWT token
    const customerToken = await createCustomerToken(tokenRecord.email);

    // Redirect to /portal/orders with sat_customer_token httpOnly cookie
    const redirectUrl = new URL("/portal/orders", req.url);
    const response = NextResponse.redirect(redirectUrl);

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set({
      name: "sat_customer_token",
      value: customerToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error verifying magic link token:", error);
    const loginUrl = new URL("/portal", req.url);
    loginUrl.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(loginUrl);
  }
}
