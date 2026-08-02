import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCustomerRequest } from "@/lib/customerAuth";

export async function GET(req: Request) {
  try {
    const session = await verifyCustomerRequest(req);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const company = await prisma.company.findFirst({
      where: { email: session.email },
      select: { name: true, email: true, createdAt: true },
    });

    const companyName = company?.name || session.email.split("@")[0].toUpperCase();

    return NextResponse.json({
      authenticated: true,
      email: session.email,
      companyName,
      createdAt: company?.createdAt ? company.createdAt.toISOString() : undefined,
      accountStatus: "APPROVED",
    });
  } catch (error) {
    console.error("Error fetching customer session:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
