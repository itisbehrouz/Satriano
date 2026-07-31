import { describe, it, expect, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/applications/route";
import { prisma } from "@/lib/prisma";
import { getAdminAccessKey } from "@/lib/adminAuth";

describe("B2B Applications API", () => {
  beforeEach(async () => {
    // Clean up applications test data
    await prisma.b2bApplication.deleteMany({
      where: { corpEmail: { contains: "test-app" } },
    });
  });

  it("POST /api/applications creates a new application record", async () => {
    const req = new Request("http://localhost/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "Test Holdings LLC",
        website: "https://test.com",
        industry: "Wholesale Apparel",
        annualVolume: "500 - 2,000 units",
        fullName: "Test Executive",
        jobTitle: "Procurement Lead",
        corpEmail: "test-app-executive@example.com",
        phone: "+15550001111",
        needs: { bespokeTailoring: true },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.application.companyName).toBe("Test Holdings LLC");
    expect(data.application.status).toBe("SUBMITTED");
  });

  it("GET /api/applications returns 401 for unauthenticated requests", async () => {
    const req = new Request("http://localhost/api/applications", {
      method: "GET",
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("GET /api/applications returns applications list for authorized admin requests", async () => {
    // Seed test application
    await prisma.b2bApplication.create({
      data: {
        companyName: "Test Auth Corp",
        fullName: "Auth Person",
        corpEmail: "test-app-auth@example.com",
        status: "SUBMITTED",
      },
    });

    const validKey = getAdminAccessKey();
    const req = new Request("http://localhost/api/applications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${validKey}`,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.applications)).toBe(true);
    expect(data.applications.length).toBeGreaterThan(0);
  });

  it("PATCH /api/applications/[id] updates status to APPROVED and sets reviewedAt and reviewedBy", async () => {
    const { PATCH } = await import("@/app/api/applications/[id]/route");

    const created = await prisma.b2bApplication.create({
      data: {
        companyName: "Test Patch Corp",
        fullName: "Patch Contact",
        corpEmail: "test-app-patch@example.com",
        status: "SUBMITTED",
      },
    });

    const validKey = getAdminAccessKey();
    const req = new Request(`http://localhost/api/applications/${created.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${validKey}`,
      },
      body: JSON.stringify({
        status: "APPROVED",
        reviewedBy: "admin",
      }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: created.id }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.application.status).toBe("APPROVED");
    expect(data.application.reviewedBy).toBe("admin");
    expect(data.application.reviewedAt).not.toBeNull();
  });
});
