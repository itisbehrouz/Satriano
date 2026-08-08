import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { dispatchZapierEvent } from "./zapierWebhook";
import { prisma } from "@/lib/prisma";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    externalWebhook: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("dispatchZapierEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should find active webhooks and send POST requests", async () => {
    // Setup
    (prisma.externalWebhook.findMany as any).mockResolvedValue([
      { id: "1", targetUrl: "https://zapier.com/hooks/1", event: "order.paid", active: true },
      { id: "2", targetUrl: "https://make.com/hooks/2", event: "order.paid", active: true },
    ]);

    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    // Execute
    await dispatchZapierEvent("order.paid", { orderId: "123" });

    // Assert
    expect(prisma.externalWebhook.findMany).toHaveBeenCalledWith({
      where: { event: "order.paid", active: true },
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith("https://zapier.com/hooks/1", expect.any(Object));
    expect(mockFetch).toHaveBeenCalledWith("https://make.com/hooks/2", expect.any(Object));

    // Verify lastTriggeredAt update
    expect(prisma.externalWebhook.update).toHaveBeenCalledTimes(2);
  });

  it("should handle fetch errors gracefully without failing others", async () => {
    (prisma.externalWebhook.findMany as any).mockResolvedValue([
      { id: "1", targetUrl: "https://zapier.com/hooks/1", event: "order.paid", active: true },
      { id: "2", targetUrl: "https://make.com/hooks/2", event: "order.paid", active: true },
    ]);

    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

    await dispatchZapierEvent("order.paid", { orderId: "123" });

    // The first one failed, the second one succeeded
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(prisma.externalWebhook.update).toHaveBeenCalledTimes(1); // Only for the successful one
  });
});
