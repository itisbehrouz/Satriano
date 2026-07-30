import { describe, expect, it } from "vitest";
import {
  DEFAULT_SIZE_QUANTITIES,
  parseQuantityInput,
  sumQuantities,
  toSizeQuantityArray,
} from "@/lib/configuratorLogic";

describe("parseQuantityInput", () => {
  it("parses a plain digit string", () => {
    expect(parseQuantityInput("50")).toBe(50);
  });

  it("treats an empty string as 0", () => {
    expect(parseQuantityInput("")).toBe(0);
  });

  it("clamps negative input to 0", () => {
    expect(parseQuantityInput("-5")).toBe(0);
  });

  it("truncates a decimal towards zero", () => {
    expect(parseQuantityInput("12.9")).toBe(12);
  });

  it("treats non-numeric input as 0", () => {
    expect(parseQuantityInput("abc")).toBe(0);
  });
});

describe("sumQuantities", () => {
  it("sums the mockup default size quantities to 300", () => {
    // configurator_polo_t_shirt/code.html defaults: S=50, M=100, L=100, XL=50
    expect(sumQuantities(DEFAULT_SIZE_QUANTITIES)).toBe(300);
  });

  it("sums to 0 when every size is 0", () => {
    expect(
      sumQuantities({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }),
    ).toBe(0);
  });
});

describe("toSizeQuantityArray", () => {
  it("orders sizes XS through XXL regardless of key insertion order", () => {
    const result = toSizeQuantityArray({
      XXL: 1,
      XL: 2,
      L: 3,
      M: 4,
      S: 5,
      XS: 6,
    });

    expect(result).toEqual([
      { size: "XS", quantity: 6 },
      { size: "S", quantity: 5 },
      { size: "M", quantity: 4 },
      { size: "L", quantity: 3 },
      { size: "XL", quantity: 2 },
      { size: "XXL", quantity: 1 },
    ]);
  });
});
