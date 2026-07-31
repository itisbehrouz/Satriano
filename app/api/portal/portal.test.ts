import { describe, it, expect, beforeEach } from "vitest";
import { POST as magicLinkPOST } from "@/app/api/portal/magic-link/route";
import { GET as verifyGET } from "@/app/portal/verify/route";
import { GET as ordersGET } from "@/app/api/portal/orders/route";
import { prisma } from "@/lib/prisma";
import { createCustomerToken } from "@/lib/customerAuth";

describe("B2B Customer Portal Auth & Orders API", () => {
  const testEmail = "portal-test-client@example.com";

  beforeEach(async () => {
    // Clean up test data
    await prisma.magicLinkToken.deleteMany({
      where: { email: testEmail },
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

  it("POST /api/portal/magic-link creates token and returns generic success message", async () => {
    const req = new Request("http://localhost/api/portal/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });

    const res = await magicLinkPOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("If an account exists");

    const tokens = await prisma.magicLinkToken.findMany({ where: { email: testEmail } });
    expect(tokens.length).toBe(1);
    expect(tokens[0].usedAt).toBeNull();
  });

  it("POST /api/portal/magic-link rate limits after 3 requests in 15 minutes", async () => {
    // Create 3 existing tokens created recently
    for (let i = 0; i < 3; i++) {
      await prisma.magicLinkToken.create({
        data: {
          email: testEmail,
          token: `rate-limit-token-${i}-${Date.now()}`,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
    }

    const req = new Request("http://localhost/api/portal/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });

    const res = await magicLinkPOST(req);
    expect(res.status).toBe(429);
  });

  it("GET /portal/verify enforces single-use token and sets customer session cookie", async () => {
    const createdToken = await prisma.magicLinkToken.create({
      data: {
        email: testEmail,
        token: `verify-test-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // 1st request: valid token
    const req1 = new Request(`http://localhost/portal/verify?token=${createdToken.token}`, {
      method: "GET",
    });

    const res1 = await verifyGET(req1);
    expect(res1.status).toBe(307);
    expect(res1.headers.get("location")).toContain("/portal/orders");
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

  it("GET /portal/verify rejects expired token", async () => {
    const expiredToken = await prisma.magicLinkToken.create({
      data: {
        email: testEmail,
        token: `expired-token-${Date.now()}`,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      },
    });

    const req = new Request(`http://localhost/portal/verify?token=${expiredToken.token}`, {
      method: "GET",
    });

    const res = await verifyGET(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("link_expired_or_used");
  });

  it("GET /api/portal/orders authorizes valid customer session and returns orders", async () => {
    const customerToken = await createCustomerToken(testEmail);

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
    expect(json.email).toBe(testEmail);
    expect(Array.isArray(json.orders)).toBe(true);
  });
});
