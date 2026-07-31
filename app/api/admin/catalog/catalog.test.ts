import { describe, it, expect, afterAll } from "vitest";
import { GET as getCatalog, POST as createCatalogItem, DELETE as deleteCatalogItem } from "@/app/api/admin/catalog/route";
import { createAdminToken } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

describe("Admin Catalog Management API (Category, Subcategory, Product Creation & Validation)", () => {
  let adminToken: string;
  let createdCatId: string | null = null;
  let createdSubId: string | null = null;
  let createdProdId: string | null = null;

  const testCatSlug = `test-cat-${Date.now()}`;
  const testSubSlug = `test-sub-${Date.now()}`;
  const testProdSlug = `test-prod-${Date.now()}`;

  it("Rejects unauthenticated requests to POST /api/admin/catalog with 401", async () => {
    const req = new Request("http://localhost/api/admin/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: "category", data: { name: "Test Cat", slug: "test-slug" } }),
    });

    const res = await createCatalogItem(req);
    expect(res.status).toBe(401);
  });

  it("Creates a Category via POST /api/admin/catalog", async () => {
    adminToken = await createAdminToken();

    const req = new Request("http://localhost/api/admin/catalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        target: "category",
        data: {
          name: "Test Outerwear Line",
          slug: testCatSlug,
          description: "Unit test category",
        },
      }),
    });

    const res = await createCatalogItem(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.category.name).toBe("Test Outerwear Line");
    expect(json.category.slug).toBe(testCatSlug);
    createdCatId = json.category.id;
  });

  it("Rejects duplicate Category slug with 400 error message", async () => {
    const req = new Request("http://localhost/api/admin/catalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        target: "category",
        data: {
          name: "Duplicate Category",
          slug: testCatSlug,
        },
      }),
    });

    const res = await createCatalogItem(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain(`Category slug '${testCatSlug}' already exists.`);
  });

  it("Creates a Subcategory via POST /api/admin/catalog", async () => {
    expect(createdCatId).not.toBeNull();

    const req = new Request("http://localhost/api/admin/catalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        target: "subcategory",
        data: {
          categoryId: createdCatId,
          name: "Test Jackets",
          slug: testSubSlug,
          description: "Unit test subcategory",
        },
      }),
    });

    const res = await createCatalogItem(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.subcategory.name).toBe("Test Jackets");
    expect(json.subcategory.slug).toBe(testSubSlug);
    createdSubId = json.subcategory.id;
  });

  it("Rejects duplicate Subcategory slug with 400 error message", async () => {
    const req = new Request("http://localhost/api/admin/catalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        target: "subcategory",
        data: {
          categoryId: createdCatId,
          name: "Duplicate Subcategory",
          slug: testSubSlug,
        },
      }),
    });

    const res = await createCatalogItem(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain(`Subcategory slug '${testSubSlug}' already exists.`);
  });

  it("Rejects Product creation missing initial fabric specification with 400", async () => {
    const req = new Request("http://localhost/api/admin/catalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        target: "product",
        data: {
          subcategoryId: createdSubId,
          name: "Invalid Product",
          slug: "invalid-prod-no-fabric",
        },
      }),
    });

    const res = await createCatalogItem(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Initial fabric specification (name, min price, max price) is required.");
  });

  it("Creates a Product via POST /api/admin/catalog with fabric line", async () => {
    expect(createdSubId).not.toBeNull();

    const req = new Request("http://localhost/api/admin/catalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        target: "product",
        data: {
          subcategoryId: createdSubId,
          name: "Test Trench Coat",
          slug: testProdSlug,
          leadTimeDays: 18,
          moqPerFabric: 40,
          initialFabric: {
            name: "Waterproof Wool Blend (320 GSM)",
            priceMinCents: 4500,
            priceMaxCents: 5800,
            setupFeeCents: 1000,
          },
        },
      }),
    });

    const res = await createCatalogItem(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.product.name).toBe("Test Trench Coat");
    expect(json.product.slug).toBe(testProdSlug);
    expect(json.product.fabrics[0].name).toBe("Waterproof Wool Blend (320 GSM)");
    createdProdId = json.product.id;
  });

  it("Rejects duplicate Product slug with 400 error message", async () => {
    const req = new Request("http://localhost/api/admin/catalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        target: "product",
        data: {
          subcategoryId: createdSubId,
          name: "Duplicate Product",
          slug: testProdSlug,
          initialFabric: {
            name: "Wool",
            priceMinCents: 1000,
            priceMaxCents: 2000,
          },
        },
      }),
    });

    const res = await createCatalogItem(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain(`Product slug '${testProdSlug}' already exists.`);
  });

  it("Deletes Product, Subcategory, and Category via DELETE /api/admin/catalog", async () => {
    if (createdProdId) {
      const delProdReq = new Request(`http://localhost/api/admin/catalog?target=product&id=${createdProdId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await deleteCatalogItem(delProdReq);
      expect(res.status).toBe(200);
    }

    if (createdSubId) {
      const delSubReq = new Request(`http://localhost/api/admin/catalog?target=subcategory&id=${createdSubId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await deleteCatalogItem(delSubReq);
      expect(res.status).toBe(200);
    }

    if (createdCatId) {
      const delCatReq = new Request(`http://localhost/api/admin/catalog?target=category&id=${createdCatId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await deleteCatalogItem(delCatReq);
      expect(res.status).toBe(200);
    }
  });

  afterAll(async () => {
    // Cleanup fallback safety
    if (createdProdId) {
      await prisma.productFit.deleteMany({ where: { productId: createdProdId } });
      await prisma.fabric.deleteMany({ where: { productId: createdProdId } });
      await prisma.product.deleteMany({ where: { id: createdProdId } });
    }
    if (createdSubId) {
      await prisma.subcategory.deleteMany({ where: { id: createdSubId } });
    }
    if (createdCatId) {
      await prisma.category.deleteMany({ where: { id: createdCatId } });
    }
  });
});
