import { NextResponse } from "next/server";
import { verifyAdminKey, createAdminToken } from "@/lib/adminAuth";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accessKey, turnstileToken } = body;

    // Verify Human Challenge via Cloudflare Turnstile
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || undefined;
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      return NextResponse.json(
        { error: "Human verification failed. Please complete the security check." },
        { status: 403 }
      );
    }

    if (!accessKey || !verifyAdminKey(accessKey)) {
      return NextResponse.json(
        { error: "Invalid Corporate Access Key." },
        { status: 401 }
      );
    }


    const token = await createAdminToken();

    const response = NextResponse.json({
      success: true,
      message: "Portal Console authentication successful.",
    });

    response.cookies.set({
      name: "sat_admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Error in admin login handler:", error);
    return NextResponse.json(
      { error: "Server authentication error." },
      { status: 500 }
    );
  }
}
