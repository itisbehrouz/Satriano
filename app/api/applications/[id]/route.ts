import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/adminAuth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await verifyAdminRequest(req);
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized access to Portal Console applications API." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status, reviewedBy } = body;

    const existingApp = await prisma.b2bApplication.findUnique({ where: { id } });
    if (!existingApp) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Server-side enforcement: Admin CANNOT approve or reject an unverified application!
    if ((status === "APPROVED" || status === "REJECTED") && existingApp.emailVerifiedAt === null) {
      return NextResponse.json(
        { error: "Cannot approve or reject an application before the applicant's email address has been verified." },
        { status: 400 }
      );
    }

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
