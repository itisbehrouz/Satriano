import { describe, expect, it } from "vitest";
import { generateProformaPdf } from "@/lib/pdfGenerator";

describe("lib/pdfGenerator", () => {
  it("generates a non-empty PDF byte array", async () => {
    const pdfBytes = await generateProformaPdf({
      refNo: "PRO-2026-0001",
      orderId: "ord_123",
      companyName: "Acme Corp",
      companyEmail: "acme@example.com",
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 86400 * 1000),
      lines: [
        { fabricName: "Pique Cotton", size: "M", quantity: 100, unitPriceCents: 1850 },
      ],
      setupFeeCents: 0,
      totalCents: 185000,
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(100);
  });
});
