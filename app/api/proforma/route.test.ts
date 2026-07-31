import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/proforma/route";

const createdCompanyIds: string[] = [];

afterEach(async () => {
  if (createdCompanyIds.length === 0) return;
  await prisma.proforma.deleteMany({
    where: { order: { companyId: { in: createdCompanyIds } } },
  });
  await prisma.order.deleteMany({ where: { companyId: { in: createdCompanyIds } } });
  await prisma.company.deleteMany({ where: { id: { in: createdCompanyIds } } });
  createdCompanyIds.length = 0;
});

function postProforma(body: unknown) {
  return POST(
    new Request("http://localhost/api/proforma", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/proforma", () => {
  it("returns 400 for missing or invalid orderId", async () => {
    const res = await postProforma({});
    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existing orderId", async () => {
    const res = await postProforma({ orderId: "non-existent-order-id", finalPriceCents: 1850 });
    expect(res.status).toBe(404);
  });

  it("generates proforma, sends email, sets finalPriceCents, and updates order status to PROFORMA_SENT", async () => {
    const fabric = await prisma.fabric.findFirstOrThrow({ where: { name: "Pique Cotton" } });
    const company = await prisma.company.create({
      data: {
        name: "Proforma Test Co",
        email: `test-proforma-${Date.now()}@example.com`,
      },
    });
    createdCompanyIds.push(company.id);

    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        status: "PENDING_REVIEW",
        setupFeeCents: 15000,
        totalCents: 0,
        customerTargetPriceCents: 1800,
        lines: {
          create: [{ fabricId: fabric.id, size: "M", quantity: 300, unitPriceCents: 1500 }],
        },
      },
    });

    const response = await postProforma({ orderId: order.id, finalPriceCents: 1850 });
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.status).toBe("PROFORMA_SENT");
    expect(json.finalPriceCents).toBe(1850);
    expect(json.totalCents).toBe(570000);
    expect(json.pdfUrl).toBeDefined();

    const updatedOrder = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { proforma: true },
    });

    expect(updatedOrder.status).toBe("PROFORMA_SENT");
    expect(updatedOrder.finalPriceCents).toBe(1850);
    expect(updatedOrder.totalCents).toBe(570000);
    expect(updatedOrder.proforma).not.toBeNull();
    expect(updatedOrder.proforma?.refNo).toBeDefined();
  });
});
