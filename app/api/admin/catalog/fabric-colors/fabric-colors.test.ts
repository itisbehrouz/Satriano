import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { GET as getColors, POST as createColor } from "@/app/api/admin/catalog/fabric-colors/route";
import { PATCH as updateColor, DELETE as deleteColor } from "@/app/api/admin/catalog/fabric-colors/[id]/route";
import { POST as clearPlaceholders } from "@/app/api/admin/catalog/fabric-colors/clear-placeholders/route";
import { createAdminToken } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

describe("Admin FabricColor Management API", () => {
  let adminToken: string;
  let testFabricId: string;
  let createdColorId: string;
  let placeholderColorId: string;
  let referencedColorId: string;

  beforeAll(async () => {
    adminToken = await createAdminToken();

    // Find an active fabric to run tests against
    const fabric = await prisma.fabric.findFirst();
    if (!fabric) {
      throw new Error("No fabric found in DB for testing");
    }
    testFabricId = fabric.id;
  });

  afterAll(async () => {
    // Cleanup any remaining test colors
    await prisma.fabricColor.deleteMany({
      where: {
        name: { in: ["Test Red Color", "Test Red Duplicate", "Test Placeholder Color", "Test Referenced Color"] },
      },
    });
  });

  it("Rejects unauthenticated requests with 401", async () => {
    const req = new Request(`http://localhost/api/admin/catalog/fabric-colors?fabricId=${testFabricId}`);
    const res = await getColors(req);
    expect(res.status).toBe(401);
  });

  it("Creates a new FabricColor via POST with auto sortOrder", async () => {
    const req = new Request("http://localhost/api/admin/catalog/fabric-colors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fabricId: testFabricId,
        name: "Test Red Color",
        hex: "#FF0000",
        source: "MANUAL",
      }),
    });

    const res = await createColor(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.color.name).toBe("Test Red Color");
    expect(json.color.source).toBe("MANUAL");
    createdColorId = json.color.id;
  });

  it("Rejects duplicate color name for same fabric with 409", async () => {
    const req = new Request("http://localhost/api/admin/catalog/fabric-colors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fabricId: testFabricId,
        name: "Test Red Color",
        hex: "#FF0000",
        source: "MANUAL",
      }),
    });

    const res = await createColor(req);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("already exists");
  });

  it("Fetches colors for a fabric via GET", async () => {
    const req = new Request(`http://localhost/api/admin/catalog/fabric-colors?fabricId=${testFabricId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const res = await getColors(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.colors)).toBe(true);
    const found = json.colors.find((c: { id: string }) => c.id === createdColorId);
    expect(found).toBeDefined();
  });

  it("Updates FabricColor details via PATCH", async () => {
    const req = new Request(`http://localhost/api/admin/catalog/fabric-colors/${createdColorId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        source: "SUPPLIER_VERIFIED",
        sortOrder: 99,
      }),
    });

    const res = await updateColor(req, { params: Promise.resolve({ id: createdColorId }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.color.source).toBe("SUPPLIER_VERIFIED");
    expect(json.color.sortOrder).toBe(99);
  });

  it("Creates a placeholder color and clears placeholders via bulk endpoint", async () => {
    // Create a placeholder color
    const createReq = new Request("http://localhost/api/admin/catalog/fabric-colors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fabricId: testFabricId,
        name: "Test Placeholder Color",
        hex: "#CCCCCC",
        source: "PLACEHOLDER",
      }),
    });

    const createRes = await createColor(createReq);
    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    placeholderColorId = createJson.color.id;

    // Clear placeholders for this fabric
    const clearReq = new Request(`http://localhost/api/admin/catalog/fabric-colors/clear-placeholders?fabricId=${testFabricId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const clearRes = await clearPlaceholders(clearReq);
    expect(clearRes.status).toBe(200);
    const clearJson = await clearRes.json();
    expect(clearJson.deletedCount).toBeGreaterThanOrEqual(1);

    // Verify it was deleted
    const check = await prisma.fabricColor.findUnique({ where: { id: placeholderColorId } });
    expect(check).toBeNull();
  });

  it("Rejects deletion with 409 when color is referenced in order lines (unless force=true)", async () => {
    // Create color
    const color = await prisma.fabricColor.create({
      data: {
        fabricId: testFabricId,
        name: "Test Referenced Color",
        hex: "#123456",
        source: "MANUAL",
      },
    });
    referencedColorId = color.id;

    // Create dummy company and order line referencing this color
    const company = await prisma.company.create({
      data: {
        name: "Test Reference Co",
        email: `ref-${Date.now()}@example.com`,
      },
    });

    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        status: "PENDING_REVIEW",
        lines: {
          create: {
            fabricId: testFabricId,
            colorId: referencedColorId,
            size: "L",
            quantity: 50,
            unitPriceCents: 2000,
          },
        },
      },
    });

    // Attempt delete without force
    const deleteReq = new Request(`http://localhost/api/admin/catalog/fabric-colors/${referencedColorId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const deleteRes = await deleteColor(deleteReq, { params: Promise.resolve({ id: referencedColorId }) });
    expect(deleteRes.status).toBe(409);
    const deleteJson = await deleteRes.json();
    expect(deleteJson.orderLineCount).toBe(1);

    // Delete with force=true
    const forceDeleteReq = new Request(`http://localhost/api/admin/catalog/fabric-colors/${referencedColorId}?force=true`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const forceDeleteRes = await deleteColor(forceDeleteReq, { params: Promise.resolve({ id: referencedColorId }) });
    expect(forceDeleteRes.status).toBe(200);

    // Cleanup dummy order & company
    await prisma.orderLine.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
    await prisma.company.delete({ where: { id: company.id } });
  });

  it("Deletes color via DELETE when no references exist", async () => {
    const req = new Request(`http://localhost/api/admin/catalog/fabric-colors/${createdColorId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const res = await deleteColor(req, { params: Promise.resolve({ id: createdColorId }) });
    expect(res.status).toBe(200);
  });
});
