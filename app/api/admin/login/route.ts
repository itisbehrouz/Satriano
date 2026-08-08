import { NextResponse } from "next/server";
import { verifyAdminKey, createAdminToken } from "@/lib/adminAuth";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accessKey } = body;

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
