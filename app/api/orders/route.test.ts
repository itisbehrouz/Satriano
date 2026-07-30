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
  it("creates an order with the correct totals and returns its id", async () => {
    const fabric = await prisma.fabric.findUniqueOrThrow({ where: { name: "Pique Cotton" } });

    const response = await postOrders({
      fabricId: fabric.id,
      companyName: "Test Order Route Co",
      companyEmail: `test-order-route-${Date.now()}@example.com`,
      sizeQuantities: [{ size: "M", quantity: 300 }],
    });

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.orderId).toBeTypeOf("string");

    const order = await prisma.order.findUniqueOrThrow({
      where: { id: json.orderId },
      include: { lines: true, company: true },
    });
    createdCompanyIds.push(order.companyId);

    // Pique Cotton: 1850/unit * 300 + 15000 setup = 570000 (matches the
    // configurator mockup's $5,700.00).
    expect(order.totalCents).toBe(570000);
    expect(order.setupFeeCents).toBe(15000);
    expect(order.status).toBe("DRAFT");
    expect(order.lines).toHaveLength(1);
    expect(order.lines[0]).toMatchObject({ size: "M", quantity: 300, unitPriceCents: 1850 });
    expect(order.company.name).toBe("Test Order Route Co");
  });

  it("upserts the company by email instead of creating duplicates", async () => {
    const fabric = await prisma.fabric.findUniqueOrThrow({ where: { name: "Pique Cotton" } });
    const email = `test-order-route-${Date.now()}@example.com`;

    const first = await postOrders({
      fabricId: fabric.id,
      companyName: "First Name",
      companyEmail: email,
      sizeQuantities: [{ size: "S", quantity: 10 }],
    });
    const firstJson = await first.json();
    const firstOrder = await prisma.order.findUniqueOrThrow({ where: { id: firstJson.orderId } });
    createdCompanyIds.push(firstOrder.companyId);

    const second = await postOrders({
      fabricId: fabric.id,
      companyName: "Updated Name",
      companyEmail: email,
      sizeQuantities: [{ size: "L", quantity: 5 }],
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
      fabricId: "",
      companyName: "",
      companyEmail: "",
      sizeQuantities: [],
    });
    expect(response.status).toBe(400);
  });

  it("returns 404 when the fabric does not exist", async () => {
    const response = await postOrders({
      fabricId: "does-not-exist",
      companyName: "Test Order Route Co",
      companyEmail: `test-order-route-${Date.now()}@example.com`,
      sizeQuantities: [{ size: "M", quantity: 10 }],
    });
    expect(response.status).toBe(404);
  });

  it("returns 400 and creates no company when every quantity is zero", async () => {
    const fabric = await prisma.fabric.findUniqueOrThrow({ where: { name: "Pique Cotton" } });
    const email = `test-order-route-${Date.now()}@example.com`;

    const response = await postOrders({
      fabricId: fabric.id,
      companyName: "Test Order Route Co",
      companyEmail: email,
      sizeQuantities: [{ size: "M", quantity: 0 }],
    });

    expect(response.status).toBe(400);
    const company = await prisma.company.findUnique({ where: { email } });
    expect(company).toBeNull();
  });

  it("creates an order with a logo asset when logoUrl is provided", async () => {
    const fabric = await prisma.fabric.findUniqueOrThrow({ where: { name: "Pique Cotton" } });
    const email = `test-order-logo-${Date.now()}@example.com`;

    const response = await postOrders({
      fabricId: fabric.id,
      companyName: "Branded Company",
      companyEmail: email,
      sizeQuantities: [{ size: "M", quantity: 50 }],
      logoUrl: "/uploads/test-logo.svg",
      logoPlacement: "RIGHT_SLEEVE",
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
