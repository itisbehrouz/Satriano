import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { GET as getOrders } from "@/app/api/admin/orders/route";
import { PATCH as updateOrderStatus } from "@/app/api/admin/orders/[orderId]/route";

const createdCompanyIds: string[] = [];

afterEach(async () => {
  if (createdCompanyIds.length === 0) return;
  await prisma.order.deleteMany({ where: { companyId: { in: createdCompanyIds } } });
  await prisma.company.deleteMany({ where: { id: { in: createdCompanyIds } } });
  createdCompanyIds.length = 0;
});

describe("Admin API Routes", () => {
  it("fetches orders list with status filter", async () => {
    const fabric = await prisma.fabric.findUniqueOrThrow({ where: { name: "Pique Cotton" } });
    const company = await prisma.company.create({
      data: {
        name: "Admin Fetch Co",
        email: `test-admin-fetch-${Date.now()}@example.com`,
      },
    });
    createdCompanyIds.push(company.id);

    await prisma.order.create({
      data: {
        companyId: company.id,
        status: "IN_PRODUCTION",
        setupFeeCents: 15000,
        totalCents: 570000,
        lines: {
          create: [{ fabricId: fabric.id, size: "M", quantity: 300, unitPriceCents: 1850 }],
        },
      },
    });

    const res = await getOrders(
      new Request("http://localhost/api/admin/orders?status=IN_PRODUCTION")
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.orders).toBeDefined();
    expect(Array.isArray(json.orders)).toBe(true);
    expect(json.orders.some((o: { companyId: string }) => o.companyId === company.id)).toBe(true);
  });

  it("updates order status manually via PATCH endpoint", async () => {
    const fabric = await prisma.fabric.findUniqueOrThrow({ where: { name: "Pique Cotton" } });
    const company = await prisma.company.create({
      data: {
        name: "Admin Patch Co",
        email: `test-admin-patch-${Date.now()}@example.com`,
      },
    });
    createdCompanyIds.push(company.id);

    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        status: "PAID",
        setupFeeCents: 15000,
        totalCents: 570000,
        lines: {
          create: [{ fabricId: fabric.id, size: "M", quantity: 300, unitPriceCents: 1850 }],
        },
      },
    });

    const res = await updateOrderStatus(
      new Request(`http://localhost/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PRODUCTION" }),
      }),
      { params: Promise.resolve({ orderId: order.id }) }
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.order.status).toBe("IN_PRODUCTION");

    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.status).toBe("IN_PRODUCTION");
  });
});
