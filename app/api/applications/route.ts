import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyName,
      website,
      industry,
      annualVolume,
      fullName,
      jobTitle,
      corpEmail,
      phone,
      needs,
    } = body;

    if (!companyName || !corpEmail || !fullName) {
      return NextResponse.json(
        { error: "Company name, corporate email, and full name are required." },
        { status: 400 }
      );
    }

    const application = await prisma.b2bApplication.create({
      data: {
        companyName,
        website: website || null,
        industry: industry || null,
        annualVolume: annualVolume || null,
        fullName,
        jobTitle: jobTitle || null,
        corpEmail,
        phone: phone || null,
        needs: needs || {},
        status: "SUBMITTED",
      },
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("Error creating B2B application:", error);
    return NextResponse.json(
      { error: "Failed to submit B2B partnership application." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const sessionCookie = req.headers.get("cookie");

    // Server-side admin verification (Section 9)
    const isAuthenticated =
      authHeader?.includes("satriano2026") ||
      sessionCookie?.includes("sat_portal_console_auth=true");

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized access to Portal Console applications API." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const applications = await prisma.b2bApplication.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching B2B applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch B2B applications." },
      { status: 500 }
    );
  }
}
