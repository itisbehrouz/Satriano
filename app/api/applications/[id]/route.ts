import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();
    const { status, reviewedBy } = body;

    const application = await prisma.b2bApplication.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || "admin",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Error updating B2B application status:", error);
    return NextResponse.json(
      { error: "Failed to update B2B application status." },
      { status: 500 }
    );
  }
}
