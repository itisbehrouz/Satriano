import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    supplier: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Suppliers API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET should return suppliers", async () => {
    const mockSuppliers = [{ id: "1", name: "Supplier A" }];
    (prisma.supplier.findMany as any).mockResolvedValue(mockSuppliers);

    const req = new NextRequest("http://localhost/api/admin/suppliers");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(mockSuppliers);
  });

  it("POST should create a supplier", async () => {
    const mockSupplier = { id: "1", name: "New Supplier" };
    (prisma.supplier.create as any).mockResolvedValue(mockSupplier);

    const req = new NextRequest("http://localhost/api/admin/suppliers", {
      method: "POST",
      body: JSON.stringify({ name: "New Supplier", email: "test@test.com" }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toEqual(mockSupplier);
  });
});