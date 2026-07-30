import { describe, expect, it } from "vitest";
import { computeOrderPricing } from "@/lib/pricing";

describe("computeOrderPricing", () => {
  it("matches the configurator mockup: Pique Cotton, 300 units, single size", () => {
    // stitch_satriano_atelier_b2b_platform/configurator_polo_t_shirt: $18.50/unit,
    // $150.00 setup, 300 total units -> $5,700.00 estimated total.
    const result = computeOrderPricing({
      fabric: { unitPriceCents: 1850, setupFeeCents: 15000 },
      sizeQuantities: [{ size: "M", quantity: 300 }],
    });

    expect(result.totalUnits).toBe(300);
    expect(result.subtotalCents).toBe(555000);
    expect(result.setupFeeCents).toBe(15000);
    expect(result.totalCents).toBe(570000);
  });

  it("matches the proforma mockup: multi-size ledger with setup & digitization", () => {
    // stitch_satriano_atelier_b2b_platform/proforma_review: €45.00/unit,
    // €250.00 setup, S150/M300/L250/XL100 -> €36,000 subtotal, €36,250 total.
    const result = computeOrderPricing({
      fabric: { unitPriceCents: 4500, setupFeeCents: 25000 },
      sizeQuantities: [
        { size: "S", quantity: 150 },
        { size: "M", quantity: 300 },
        { size: "L", quantity: 250 },
        { size: "XL", quantity: 100 },
      ],
    });

    expect(result.totalUnits).toBe(800);
    expect(result.subtotalCents).toBe(3600000);
    expect(result.totalCents).toBe(3625000);
    expect(result.lineItems).toEqual([
      { size: "S", quantity: 150, unitPriceCents: 4500, lineTotalCents: 675000 },
      { size: "M", quantity: 300, unitPriceCents: 4500, lineTotalCents: 1350000 },
      { size: "L", quantity: 250, unitPriceCents: 4500, lineTotalCents: 1125000 },
      { size: "XL", quantity: 100, unitPriceCents: 4500, lineTotalCents: 450000 },
    ]);
  });

  it("omits zero-quantity sizes from the line-item ledger", () => {
    // Configurator table always sends all six sizes (XS..XXL); untouched
    // sizes stay at 0 and shouldn't produce a ledger row (matches proforma
    // mockup, which only lists S/M/L/XL — no XS/XXL rows).
    const result = computeOrderPricing({
      fabric: { unitPriceCents: 1850, setupFeeCents: 15000 },
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
      fabric: { unitPriceCents: 1850, setupFeeCents: 15000 },
      sizeQuantities: [
        { size: "S", quantity: 0 },
        { size: "M", quantity: 0 },
      ],
    });

    expect(result.lineItems).toEqual([]);
    expect(result.totalUnits).toBe(0);
    expect(result.subtotalCents).toBe(0);
    expect(result.setupFeeCents).toBe(0);
    expect(result.totalCents).toBe(0);
  });

  it("throws on a negative quantity", () => {
    expect(() =>
      computeOrderPricing({
        fabric: { unitPriceCents: 1850, setupFeeCents: 15000 },
        sizeQuantities: [{ size: "M", quantity: -1 }],
      }),
    ).toThrow(RangeError);
  });

  it("throws on a non-integer quantity", () => {
    expect(() =>
      computeOrderPricing({
        fabric: { unitPriceCents: 1850, setupFeeCents: 15000 },
        sizeQuantities: [{ size: "M", quantity: 1.5 }],
      }),
    ).toThrow(RangeError);
  });
});
