import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event: { type: string; data: { object: Record<string, unknown> } };

    if (stripe && process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        ) as unknown as typeof event;
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else {
      // In development/test mode without webhook signature secret
      event = JSON.parse(rawBody);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        client_reference_id?: string;
        metadata?: { orderId?: string };
        id?: string;
      };

      const orderId = session.client_reference_id || session.metadata?.orderId;

      if (orderId) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: { status: "PAID" },
          }),
          prisma.payment.upsert({
            where: { orderId },
            update: {
              status: "SUCCEEDED",
              posRef: session.id || `pos_${orderId}`,
            },
            create: {
              orderId,
              status: "SUCCEEDED",
              posRef: session.id || `pos_${orderId}`,
            },
          }),
        ]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
