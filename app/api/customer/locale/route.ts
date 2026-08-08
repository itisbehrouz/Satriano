import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    const localeCookie = req.cookies.get("sat_locale")?.value || "en";
    return NextResponse.json({ locale: localeCookie });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    return NextResponse.json({ locale: "en" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch locale" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { locale } = await req.json();

    if (!locale) {
      return NextResponse.json({ error: "Locale is required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, locale });
    response.cookies.set("sat_locale", locale, { path: "/", maxAge: 31536000 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Failed to set locale" }, { status: 500 });
  }
}
