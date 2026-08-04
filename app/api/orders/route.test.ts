import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/orders/route";

const createdCompanyIds: string[] = [];

afterEach(async () => {
  if (createdCompanyIds.length === 0) return;
  await prisma.order.deleteMany({ where: { companyId: { in: createdCompanyIds } } });
  await prisma.company.deleteMany({ where: { id: { in: createdCompanyIds } } });
  createdCompanyIds.length = 0;
});

function postOrders(body: unknown) {
  return POST(
    new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/orders", () => {
  it("creates an order in PENDING_REVIEW status with setup fee and target budget", async () => {
    const fabric = await prisma.fabric.findFirstOrThrow({ where: { name: "Pique Cotton" } });

    const response = await postOrders({
      companyName: "Test Order Route Co",
      companyEmail: `test-order-route-${Date.now()}@example.com`,
      customerTargetPriceCents: 1850,
      items: [{
        fabricId: fabric.id,
        sizeQuantities: [{ size: "M", quantity: 300 }],
      }],
    });

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.orderId).toBeTypeOf("string");
    expect(json.status).toBe("PENDING_REVIEW");

    const order = await prisma.order.findUniqueOrThrow({
      where: { id: json.orderId },
      include: { lines: true, company: true },
    });
    createdCompanyIds.push(order.companyId);

    expect(order.status).toBe("PENDING_REVIEW");
    expect(order.setupFeeCents).toBe(15000);
    expect(order.totalCents).toBe(0);
    expect(order.customerTargetPriceCents).toBe(1850);
    expect(order.lines).toHaveLength(1);
    expect(order.company.name).toBe("Test Order Route Co");
  });

  it("rejects order when total units are below the required per-fabric MOQ", async () => {
    const fabric = await prisma.fabric.findFirstOrThrow({ where: { name: "Pique Cotton" } });

    const response = await postOrders({
      companyName: "Low Qty Co",
      companyEmail: `low-qty-${Date.now()}@example.com`,
      items: [{
        fabricId: fabric.id,
        sizeQuantities: [{ size: "M", quantity: 30 }], // 30 < 80 MOQ
      }],
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("Minimum order quantity");
  });

  it("upserts the company by email instead of creating duplicates", async () => {
    const fabric = await prisma.fabric.findFirstOrThrow({ where: { name: "Pique Cotton" } });
    const email = `test-order-route-${Date.now()}@example.com`;

    const first = await postOrders({
      companyName: "First Name",
      companyEmail: email,
      items: [{
        fabricId: fabric.id,
        sizeQuantities: [{ size: "S", quantity: 100 }],
      }],
    });
    const firstJson = await first.json();
    const firstOrder = await prisma.order.findUniqueOrThrow({ where: { id: firstJson.orderId } });
    createdCompanyIds.push(firstOrder.companyId);

    const second = await postOrders({
      companyName: "Updated Name",
      companyEmail: email,
      items: [{
        fabricId: fabric.id,
        sizeQuantities: [{ size: "L", quantity: 120 }],
      }],
    });
    const secondJson = await second.json();
    const secondOrder = await prisma.order.findUniqueOrThrow({
      where: { id: secondJson.orderId },
    });

    expect(secondOrder.companyId).toBe(firstOrder.companyId);
    const company = await prisma.company.findUniqueOrThrow({
      where: { id: firstOrder.companyId },
    });
    expect(company.name).toBe("Updated Name");
  });

  it("returns 400 for an invalid body", async () => {
    const response = await postOrders({
      companyName: "",
      companyEmail: "",
      items: [],
    });
    expect(response.status).toBe(400);
  });

  it("returns 404 when the fabric does not exist", async () => {
    const response = await postOrders({
      companyName: "Test Order Route Co",
      companyEmail: `test-order-route-${Date.now()}@example.com`,
      items: [{
        fabricId: "does-not-exist",
        sizeQuantities: [{ size: "M", quantity: 10 }],
      }],
    });
    expect(response.status).toBe(404);
  });

  it("returns 400 and creates no company when every quantity is zero", async () => {
    const fabric = await prisma.fabric.findFirstOrThrow({ where: { name: "Pique Cotton" } });
    const email = `test-order-route-${Date.now()}@example.com`;

    const response = await postOrders({
      companyName: "Test Order Route Co",
      companyEmail: email,
      items: [{
        fabricId: fabric.id,
        sizeQuantities: [{ size: "M", quantity: 0 }],
      }],
    });

    expect(response.status).toBe(400);
    const company = await prisma.company.findUnique({ where: { email } });
    expect(company).toBeNull();
  });

  it("creates an order with a logo asset when logoUrl is provided", async () => {
    const fabric = await prisma.fabric.findFirstOrThrow({ where: { name: "Pique Cotton" } });
    const email = `test-order-logo-${Date.now()}@example.com`;

    const response = await postOrders({
      companyName: "Branded Company",
      companyEmail: email,
      items: [{
        fabricId: fabric.id,
        sizeQuantities: [{ size: "M", quantity: 100 }],
        logoUrl: "/uploads/test-logo.svg",
        logoPlacement: "RIGHT_SLEEVE",
      }],
    });

    expect(response.status).toBe(201);
    const json = await response.json();

    const order = await prisma.order.findUniqueOrThrow({
      where: { id: json.orderId },
      include: { logoAssets: true },
    });
    createdCompanyIds.push(order.companyId);

    expect(order.logoAssets).toHaveLength(1);
    expect(order.logoAssets[0].storageUrl).toBe("/uploads/test-logo.svg");
    expect(order.logoAssets[0].placement).toBe("RIGHT_SLEEVE");
  });
});
