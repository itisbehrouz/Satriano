import { describe, expect, it } from "vitest";
import { validateCreateOrderInput } from "@/lib/orderValidation";

const validBody = {
  companyName: "Atelier Holdings LLC",
  companyEmail: "buyer@atelier-holdings.com",
  items: [
    {
      fabricId: "fabric-pique",
      sizeQuantities: [
        { size: "S", quantity: 50 },
        { size: "M", quantity: 100 },
      ],
    },
  ],
};

describe("validateCreateOrderInput", () => {
  it("accepts a well-formed body and trims/lowercases the email", () => {
    const result = validateCreateOrderInput({
      ...validBody,
      companyEmail: "  Buyer@Atelier-Holdings.com  ",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.companyEmail).toBe("buyer@atelier-holdings.com");
      expect(result.data.items[0].fabricId).toBe("fabric-pique");
      expect(result.data.items[0].sizeQuantities).toHaveLength(2);
    }
  });

  it("rejects a non-object body", () => {
    const result = validateCreateOrderInput(null);
    expect(result.valid).toBe(false);
  });

  it("rejects a missing fabricId", () => {
    const result = validateCreateOrderInput({
      ...validBody,
      items: [
        {
          fabricId: "",
          sizeQuantities: [{ size: "S", quantity: 50 }],
        },
      ],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/fabricId/i);
  });

  it("rejects a missing companyName", () => {
    const result = validateCreateOrderInput({ ...validBody, companyName: "  " });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/companyName/i);
  });

  it("rejects an invalid email", () => {
    const result = validateCreateOrderInput({ ...validBody, companyEmail: "not-an-email" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/email/i);
  });

  it("rejects an empty sizeQuantities array", () => {
    const result = validateCreateOrderInput({
      ...validBody,
      items: [
        {
          fabricId: "fabric-pique",
          sizeQuantities: [],
        },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it("rejects a sizeQuantities entry with a negative quantity", () => {
    const result = validateCreateOrderInput({
      ...validBody,
      items: [
        {
          fabricId: "fabric-pique",
          sizeQuantities: [{ size: "M", quantity: -1 }],
        },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it("rejects a sizeQuantities entry with a non-integer quantity", () => {
    const result = validateCreateOrderInput({
      ...validBody,
      items: [
        {
          fabricId: "fabric-pique",
          sizeQuantities: [{ size: "M", quantity: 1.5 }],
        },
      ],
    });
    expect(result.valid).toBe(false);
  });
});
