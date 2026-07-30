import { describe, it, expect, beforeEach } from "vitest";
import { GET as getOrders } from "@/app/api/admin/orders/route";
import { PATCH as updateOrder } from "@/app/api/admin/orders/[orderId]/route";
import { POST as loginAdmin } from "@/app/api/admin/login/route";
import { GET as getApplications } from "@/app/api/applications/route";
import { getAdminAccessKey } from "@/lib/adminAuth";

describe("Admin Authentication & Security Audit Test Suite", () => {
  const validAccessKey = getAdminAccessKey();

  it("Rejects unauthenticated requests to GET /api/admin/orders with 401", async () => {
    const req = new Request("http://localhost/api/admin/orders", { method: "GET" });
    const res = await getOrders(req);
    expect(res.status).toBe(401);
  });

  it("Rejects unauthenticated requests to PATCH /api/admin/orders/[id] with 401", async () => {
    const req = new Request("http://localhost/api/admin/orders/test-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "IN_PRODUCTION" }),
    });
    const res = await updateOrder(req, { params: Promise.resolve({ orderId: "test-id" }) });
    expect(res.status).toBe(401);
  });

  it("Rejects unauthenticated requests to GET /api/applications with 401", async () => {
    const req = new Request("http://localhost/api/applications", { method: "GET" });
    const res = await getApplications(req);
    expect(res.status).toBe(401);
  });

  it("Explicitly rejects compromised old literal key 'satriano2026' with 401", async () => {
    const req = new Request("http://localhost/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessKey: "satriano2026" }),
    });
    const res = await loginAdmin(req);
    expect(res.status).toBe(401);
  });

  it("Accepts valid secret ADMIN_ACCESS_KEY via login endpoint and sets signed httpOnly cookie", async () => {
    const req = new Request("http://localhost/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessKey: validAccessKey }),
    });
    const res = await loginAdmin(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("sat_admin_token=");
    expect(setCookie).toContain("HttpOnly");
  });

  it("Accepts authorized Bearer token on GET /api/admin/orders", async () => {
    const req = new Request("http://localhost/api/admin/orders", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${validAccessKey}`,
      },
    });
    const res = await getOrders(req);
    expect(res.status).toBe(200);
  });
});
