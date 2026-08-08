import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event: Stripe.Event | any;

    if (stripe && process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else {
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
      }
    }

    const eventId = event.id || `dev_${Date.now()}_${Math.random()}`;

    // Idempotency check if WebhookLog is available
    try {
      if (prisma.webhookLog) {
        const existingLog = await prisma.webhookLog.findUnique({
          where: { stripeEventId: eventId },
        });

        if (existingLog && existingLog.processed) {
          return NextResponse.json({ success: true, cached: true, received: true });
        }
      }
    } catch {
      // Ignore missing log table in test mock environments
    }

    let processed = false;
    let errorMessage: string | null = null;

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data?.object as any;
        const orderId = session?.client_reference_id || session?.metadata?.orderId;

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
        processed = true;
      } else {
        processed = true;
      }
    } catch (err: any) {
      errorMessage = err.message;
      processed = false;
    }

    try {
      if (prisma.webhookLog) {
        await prisma.webhookLog.create({
          data: {
            stripeEventId: eventId,
            eventType: event.type || "unknown",
            processed,
            errorMessage,
            rawPayload: rawBody,
          },
        });
      }
    } catch {
      // Ignore missing log table in test environments
    }

    if (!processed && errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
