import { NextResponse } from "next/server";

const COOKIE_NAME = "satriano_site_pass";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.SITE_ACCESS_PASSWORD || "satriano2026!";

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Geçersiz şifre. Lütfen tekrar deneyin." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, redirect: "/" });

    // Set HTTP-only cookie valid for 30 days
    response.cookies.set({
      name: COOKIE_NAME,
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
