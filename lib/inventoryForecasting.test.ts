import { expect, test, vi } from "vitest";

// Mock prisma client
vi.mock("./prisma", () => ({
  prisma: {
    inventoryPolicy: {
      findMany: vi.fn().mockResolvedValue([
        {
          reorderPoint: 10,
          product: {
            sku: "TEST-SKU",
            stock: [{ size: "M", quantity: 5 }]
          }
        }
      ])
    }
  }
}));

import { checkReorderPoints } from "./inventoryForecasting";

test("checkReorderPoints detects low stock", async () => {
  const alerts = await checkReorderPoints();
  expect(alerts.length).toBe(1);
  expect(alerts[0].sku).toBe("TEST-SKU");
  expect(alerts[0].size).toBe("M");
});
