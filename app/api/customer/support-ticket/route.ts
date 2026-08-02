import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCustomerToken } from "@/lib/customerAuth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sat_customer_token")?.value;
    const session = token ? await verifyCustomerToken(token) : null;

    const body = await request.json().catch(() => null);
    if (!body || !body.subject?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { error: "Subject and message are required fields." },
        { status: 400 }
      );
    }

    const ticketId = `TCK-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json(
      {
        ticketId,
        status: "OPEN",
        message: "Support ticket received. An atelier account manager will respond within 4 business hours.",
        companyEmail: session?.email || body.email || "client@company.com",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Support ticket API error:", err);
    return NextResponse.json(
      { error: "Failed to submit support ticket. Please try again." },
      { status: 500 }
    );
  }
}
