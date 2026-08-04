import { describe, expect, it } from "vitest";
import { computeOrderPricing } from "@/lib/pricing";

describe("computeOrderPricing", () => {
  it("computes estimated unit price ranges and totals: Pique Cotton ($15-$20), 300 units", () => {
    const result = computeOrderPricing({
      fabric: { priceMinCents: 1500, priceMaxCents: 2000 },
      sizeQuantities: [{ size: "M", quantity: 300 }],
    });

    expect(result.totalUnits).toBe(300);
    expect(result.estimatedSubtotalMinCents).toBe(450000);
    expect(result.estimatedSubtotalMaxCents).toBe(600000);
    expect(result.setupFeeCents).toBe(0);
    expect(result.estimatedTotalMinCents).toBe(450000);
    expect(result.estimatedTotalMaxCents).toBe(600000);
  });

  it("calculates multi-size ledger range without setup fee", () => {
    const result = computeOrderPricing({
      fabric: { priceMinCents: 4000, priceMaxCents: 5000 },
      sizeQuantities: [
        { size: "S", quantity: 150 },
        { size: "M", quantity: 300 },
        { size: "L", quantity: 250 },
        { size: "XL", quantity: 100 },
      ],
    });

    expect(result.totalUnits).toBe(800);
    expect(result.estimatedSubtotalMinCents).toBe(3200000);
    expect(result.estimatedSubtotalMaxCents).toBe(4000000);
    expect(result.estimatedTotalMinCents).toBe(3200000);
    expect(result.estimatedTotalMaxCents).toBe(4000000);
  });

  it("omits zero-quantity sizes from the line-item ledger", () => {
    const result = computeOrderPricing({
      fabric: { priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 },
      sizeQuantities: [
        { size: "XS", quantity: 0 },
        { size: "S", quantity: 50 },
        { size: "M", quantity: 100 },
        { size: "L", quantity: 100 },
        { size: "XL", quantity: 50 },
        { size: "XXL", quantity: 0 },
      ],
    });

    expect(result.lineItems.map((line) => line.size)).toEqual(["S", "M", "L", "XL"]);
    expect(result.totalUnits).toBe(300);
  });

  it("returns an all-zero result for an empty order (no setup fee charged)", () => {
    const result = computeOrderPricing({
      fabric: { priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 },
      sizeQuantities: [
        { size: "S", quantity: 0 },
        { size: "M", quantity: 0 },
      ],
    });

    expect(result.lineItems).toEqual([]);
    expect(result.totalUnits).toBe(0);
    expect(result.estimatedSubtotalMinCents).toBe(0);
    expect(result.estimatedSubtotalMaxCents).toBe(0);
    expect(result.setupFeeCents).toBe(0);
    expect(result.estimatedTotalMinCents).toBe(0);
    expect(result.estimatedTotalMaxCents).toBe(0);
  });

  it("throws on a negative quantity", () => {
    expect(() =>
      computeOrderPricing({
        fabric: { priceMinCents: 1500, priceMaxCents: 2000 },
        sizeQuantities: [{ size: "M", quantity: -1 }],
      }),
    ).toThrow(RangeError);
  });

  it("throws on a non-integer quantity", () => {
    expect(() =>
      computeOrderPricing({
        fabric: { priceMinCents: 1500, priceMaxCents: 2000 },
        sizeQuantities: [{ size: "M", quantity: 1.5 }],
      }),
    ).toThrow(RangeError);
  });
});
