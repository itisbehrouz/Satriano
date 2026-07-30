import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.orderId !== "string" || !body.orderId.trim()) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const orderId = body.orderId.trim();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { company: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: order.company.email,
        client_reference_id: order.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Satriano Atelier Polo Order (${order.id.slice(-6)})`,
                description: `Bespoke Polo Manufacturing for ${order.company.name}`,
              },
              unit_amount: order.totalCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/proforma/${order.id}?success=true`,
        cancel_url: `${origin}/proforma/${order.id}?canceled=true`,
        metadata: {
          orderId: order.id,
        },
      });

      await prisma.payment.upsert({
        where: { orderId: order.id },
        update: { posRef: session.id, status: "PENDING" },
        create: { orderId: order.id, posRef: session.id, status: "PENDING" },
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    // Fallback/Mock mode when Stripe API key is not configured in environment
    const mockSessionId = `cs_test_${Date.now()}`;
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: { posRef: mockSessionId, status: "PENDING" },
      create: { orderId: order.id, posRef: mockSessionId, status: "PENDING" },
    });

    return NextResponse.json({
      url: `${origin}/proforma/${order.id}?success=true&mock_session=${mockSessionId}`,
      sessionId: mockSessionId,
    });
  } catch (error) {
    console.error("Payment session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
