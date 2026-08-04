import { describe, it, expect, beforeEach } from "vitest";
import { POST as magicLinkPOST } from "@/app/api/portal/magic-link/route";
import { GET as verifyGET } from "@/app/portal/verify/route";
import { GET as ordersGET } from "@/app/api/portal/orders/route";
import { prisma } from "@/lib/prisma";
import { createCustomerToken } from "@/lib/customerAuth";

describe("B2B Customer Portal Auth & Orders API", () => {
  const testId = Date.now();
  const approvedEmail = `approved-client-${testId}@example.com`;
  const rejectedEmail = `rejected-client-${testId}@example.com`;
  const unknownEmail = `unknown-client-${testId}@example.com`;

  beforeEach(async () => {
    // Clean up test tokens and applications
    await prisma.magicLinkToken.deleteMany({
      where: { email: { in: [approvedEmail, rejectedEmail, unknownEmail] } },
    });
    await prisma.b2bApplication.deleteMany({
      where: { corpEmail: { in: [approvedEmail, rejectedEmail, unknownEmail] } },
    });
  });

  it("POST /api/portal/magic-link returns 400 for invalid email", async () => {
    const req = new Request("http://localhost/api/portal/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const res = await magicLinkPOST(req);
    expect(res.status).toBe(400);
  });

  it("POST /api/portal/magic-link creates token ONLY for APPROVED application", async () => {
    // Seed APPROVED application
    await prisma.b2bApplication.create({
      data: {
        companyName: "Approved Partner Co",
        fullName: "Approved Officer",
        corpEmail: approvedEmail,
        status: "APPROVED",
      },
    });

    const req = new Request("http://localhost/api/portal/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: approvedEmail }),
    });

    const res = await magicLinkPOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("If an approved account exists");

    const tokens = await prisma.magicLinkToken.findMany({ where: { email: approvedEmail } });
    expect(tokens.length).toBe(1);
    expect(tokens[0].usedAt).toBeNull();
  });

  it("POST /api/portal/magic-link creates NO token for REJECTED or UNKNOWN email, but returns IDENTICAL response", async () => {
    // Seed REJECTED application
    await prisma.b2bApplication.create({
      data: {
        companyName: "Rejected Partner Co",
        fullName: "Rejected Officer",
        corpEmail: rejectedEmail,
        status: "REJECTED",
      },
    });

    // Case B: REJECTED email request
    const reqRejected = new Request("http://localhost/api/portal/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: rejectedEmail }),
    });

    const resRejected = await magicLinkPOST(reqRejected);
    expect(resRejected.status).toBe(200);
    const jsonRejected = await resRejected.json();
    expect(jsonRejected.success).toBe(true);
    expect(jsonRejected.message).toBe("If an approved account exists for this email, we've sent a login link.");

    // Assert NO token created in DB for REJECTED application
    const rejectedTokens = await prisma.magicLinkToken.findMany({ where: { email: rejectedEmail } });
    expect(rejectedTokens.length).toBe(0);

    // Case C: UNKNOWN email request
    const reqUnknown = new Request("http://localhost/api/portal/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: unknownEmail }),
    });

    const resUnknown = await magicLinkPOST(reqUnknown);
    expect(resUnknown.status).toBe(200);
    const jsonUnknown = await resUnknown.json();
    expect(jsonUnknown.success).toBe(true);
    expect(jsonUnknown.message).toBe("If an approved account exists for this email, we've sent a login link.");

    // Assert IDENTICAL JSON response across cases
    expect(jsonRejected).toEqual(jsonUnknown);

    // Assert NO token created in DB for UNKNOWN application
    const unknownTokens = await prisma.magicLinkToken.findMany({ where: { email: unknownEmail } });
    expect(unknownTokens.length).toBe(0);
  });

  it("POST /api/portal/magic-link rate limits after 3 requests in 15 minutes", async () => {
    // Seed APPROVED application
    await prisma.b2bApplication.create({
      data: {
        companyName: "Approved Partner Co",
        fullName: "Approved Officer",
        corpEmail: approvedEmail,
        status: "APPROVED",
      },
    });

    for (let i = 0; i < 3; i++) {
      await prisma.magicLinkToken.create({
        data: {
          email: approvedEmail,
          token: `rate-limit-token-${i}-${Date.now()}`,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
    }

    const req = new Request("http://localhost/api/portal/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: approvedEmail }),
    });

    const res = await magicLinkPOST(req);
    expect(res.status).toBe(429);
  });

  it("GET /portal/verify re-verifies APPROVED status at verify time, enforces single-use, and sets session cookie", async () => {
    // Seed APPROVED application
    await prisma.b2bApplication.create({
      data: {
        companyName: "Approved Partner Co",
        fullName: "Approved Officer",
        corpEmail: approvedEmail,
        status: "APPROVED",
      },
    });

    const createdToken = await prisma.magicLinkToken.create({
      data: {
        email: approvedEmail,
        token: `verify-test-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // 1st request: valid token + APPROVED application
    const req1 = new Request(`http://localhost/portal/verify?token=${createdToken.token}`, {
      method: "GET",
    });

    const res1 = await verifyGET(req1);
    expect(res1.status).toBe(307);
    expect(res1.headers.get("location")).toBe("http://localhost/");
    const cookie = res1.headers.get("set-cookie");
    expect(cookie).toContain("sat_customer_token");

    // Verify token was marked used in DB
    const updated = await prisma.magicLinkToken.findUnique({ where: { id: createdToken.id } });
    expect(updated?.usedAt).not.toBeNull();

    // 2nd request: attempt single-use token reuse
    const req2 = new Request(`http://localhost/portal/verify?token=${createdToken.token}`, {
      method: "GET",
    });

    const res2 = await verifyGET(req2);
    expect(res2.status).toBe(307);
    expect(res2.headers.get("location")).toContain("link_expired_or_used");
  });

  it("GET /portal/verify rejects token if application status was revoked/rejected", async () => {
    // Seed REJECTED application (revoked after token creation)
    await prisma.b2bApplication.create({
      data: {
        companyName: "Revoked Partner Co",
        fullName: "Revoked Officer",
        corpEmail: rejectedEmail,
        status: "REJECTED",
      },
    });

    const tokenForRevoked = await prisma.magicLinkToken.create({
      data: {
        email: rejectedEmail,
        token: `revoked-test-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const req = new Request(`http://localhost/portal/verify?token=${tokenForRevoked.token}`, {
      method: "GET",
    });

    const res = await verifyGET(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("account_not_approved");
  });

  it("GET /api/portal/orders authorizes valid customer session and returns orders", async () => {
    const customerToken = await createCustomerToken(approvedEmail);

    const req = new Request("http://localhost/api/portal/orders", {
      method: "GET",
      headers: {
        Cookie: `sat_customer_token=${customerToken}`,
      },
    });

    const res = await ordersGET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.email).toBe(approvedEmail);
    expect(Array.isArray(json.orders)).toBe(true);
  });
});
