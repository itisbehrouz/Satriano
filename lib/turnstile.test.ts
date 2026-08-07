import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstileToken } from "@/lib/turnstile";

describe("verifyTurnstileToken", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("fails verification if token is missing or empty", async () => {
    process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
    const result = await verifyTurnstileToken("");
    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain("missing-input-response");
  });

  it("fails in production if TURNSTILE_SECRET_KEY is missing", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.TURNSTILE_SECRET_KEY;
    const result = await verifyTurnstileToken("dummy_token");
    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain("missing-input-secret");
  });

  it("bypasses check in development if TURNSTILE_SECRET_KEY is missing", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.TURNSTILE_SECRET_KEY;
    const result = await verifyTurnstileToken("dummy_token");
    expect(result.success).toBe(true);
    expect(result.hostname).toBe("localhost");
  });

  it("successfully calls Cloudflare siteverify endpoint when key and token are present", async () => {
    process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";

    const mockResponse = {
      success: true,
      hostname: "satriano.atelier",
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await verifyTurnstileToken("valid_turnstile_token", "127.0.0.1");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
    );

    expect(result.success).toBe(true);
    expect(result.hostname).toBe("satriano.atelier");
  });

  it("handles Cloudflare error response gracefully", async () => {
    process.env.TURNSTILE_SECRET_KEY = "2x0000000000000000000000000000000AB";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        "error-codes": ["invalid-input-response"],
      }),
    } as Response);

    const result = await verifyTurnstileToken("invalid_token");

    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain("invalid-input-response");
  });
});
