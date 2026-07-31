import { describe, it, expect, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/applications/route";
import { GET as verifyEmailGET } from "@/app/portal/verify-email/route";
import { prisma } from "@/lib/prisma";
import { getAdminAccessKey } from "@/lib/adminAuth";

describe("B2B Applications API & Email Verification Flow", () => {
  beforeEach(async () => {
    // Clean up applications test data
    await prisma.b2bApplication.deleteMany({
      where: { corpEmail: { contains: "test-app" } },
    });
  });

  it("POST /api/applications creates application and EmailVerificationToken", async () => {
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
    expect(data.application.emailVerifiedAt).toBeNull();

    const token = await prisma.emailVerificationToken.findFirst({
      where: { applicationId: data.application.id },
    });
    expect(token).not.toBeNull();
    expect(token?.usedAt).toBeNull();
  });

  it("PATCH /api/applications/[id] REJECTS approval if emailVerifiedAt is null", async () => {
    const { PATCH } = await import("@/app/api/applications/[id]/route");

    const created = await prisma.b2bApplication.create({
      data: {
        companyName: "Unverified Corp",
        fullName: "Unverified Officer",
        corpEmail: "test-app-unverified@example.com",
        status: "SUBMITTED",
        emailVerifiedAt: null,
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
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Cannot approve or reject an application before");
  });

  it("GET /portal/verify-email verifies email, transitions status to UNDER_REVIEW, and allows admin approval", async () => {
    const { PATCH } = await import("@/app/api/applications/[id]/route");

    const app = await prisma.b2bApplication.create({
      data: {
        companyName: "Verify Transition Corp",
        fullName: "Transition Contact",
        corpEmail: "test-app-transition@example.com",
        status: "SUBMITTED",
        emailVerifiedAt: null,
      },
    });

    const tokenRecord = await prisma.emailVerificationToken.create({
      data: {
        applicationId: app.id,
        token: `verify-test-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Verify email
    const reqVerify = new Request(`http://localhost/portal/verify-email?token=${tokenRecord.token}`, {
      method: "GET",
    });

    const resVerify = await verifyEmailGET(reqVerify);
    expect(resVerify.status).toBe(307);
    expect(resVerify.headers.get("location")).toContain("/portal/email-verified");

    // Assert status updated in DB
    const updatedApp = await prisma.b2bApplication.findUnique({ where: { id: app.id } });
    expect(updatedApp?.emailVerifiedAt).not.toBeNull();
    expect(updatedApp?.status).toBe("UNDER_REVIEW");

    // Now test admin approval succeeds
    const validKey = getAdminAccessKey();
    const reqPatch = new Request(`http://localhost/api/applications/${app.id}`, {
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

    const resPatch = await PATCH(reqPatch, { params: Promise.resolve({ id: app.id }) });
    expect(resPatch.status).toBe(200);
    const dataPatch = await resPatch.json();
    expect(dataPatch.application.status).toBe("APPROVED");
  });
});
