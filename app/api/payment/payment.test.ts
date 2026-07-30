import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { POST as createSession } from "@/app/api/payment/create-session/route";
import { POST as webhookHandler } from "@/app/api/payment/webhook/route";

const createdCompanyIds: string[] = [];

afterEach(async () => {
  if (createdCompanyIds.length === 0) return;
  await prisma.payment.deleteMany({
    where: { order: { companyId: { in: createdCompanyIds } } },
  });
  await prisma.order.deleteMany({ where: { companyId: { in: createdCompanyIds } } });
  await prisma.company.deleteMany({ where: { id: { in: createdCompanyIds } } });
  createdCompanyIds.length = 0;
});

describe("Payment API Routes", () => {
  it("creates a checkout session and pending payment record", async () => {
    const fabric = await prisma.fabric.findUniqueOrThrow({ where: { name: "Pique Cotton" } });
    const company = await prisma.company.create({
      data: {
        name: "Payment Test Co",
        email: `test-payment-${Date.now()}@example.com`,
      },
    });
    createdCompanyIds.push(company.id);

    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        status: "PROFORMA_SENT",
        setupFeeCents: 15000,
        totalCents: 570000,
        lines: {
          create: [{ fabricId: fabric.id, size: "M", quantity: 300, unitPriceCents: 1850 }],
        },
      },
    });

    const res = await createSession(
      new Request("http://localhost/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBeDefined();
    expect(json.sessionId).toBeDefined();

    const payment = await prisma.payment.findUnique({ where: { orderId: order.id } });
    expect(payment).not.toBeNull();
    expect(payment?.status).toBe("PENDING");
  });

  it("updates order status to PAID when webhook receives checkout.session.completed event", async () => {
    const fabric = await prisma.fabric.findUniqueOrThrow({ where: { name: "Pique Cotton" } });
    const company = await prisma.company.create({
      data: {
        name: "Webhook Test Co",
        email: `test-webhook-${Date.now()}@example.com`,
      },
    });
    createdCompanyIds.push(company.id);

    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        status: "PROFORMA_SENT",
        setupFeeCents: 15000,
        totalCents: 570000,
        lines: {
          create: [{ fabricId: fabric.id, size: "M", quantity: 300, unitPriceCents: 1850 }],
        },
      },
    });

    const webhookRes = await webhookHandler(
      new Request("http://localhost/api/payment/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "checkout.session.completed",
          data: {
            object: {
              client_reference_id: order.id,
              id: "cs_test_completed_123",
            },
          },
        }),
      })
    );

    expect(webhookRes.status).toBe(200);
    const json = await webhookRes.json();
    expect(json.received).toBe(true);

    const updatedOrder = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { payment: true },
    });

    expect(updatedOrder.status).toBe("PAID");
    expect(updatedOrder.payment?.status).toBe("SUCCEEDED");
  });
});
