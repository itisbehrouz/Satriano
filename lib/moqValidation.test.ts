import { describe, it, expect } from "vitest";
import { validateOrderMoq, validateMultiMaterialMoq, MoqValidationItem } from "./moqValidation";

describe("Two-Threshold MOQ Validation Engine (lib/moqValidation.ts)", () => {
  const fabricConfig = {
    fabricId: "fab_pique",
    fabricName: "Pique Cotton",
    moqPerFabric: 50,
    moqPerColor: 20,
  };

  it("Worked Example 1: 30 Navy + 30 White meets both fabric MOQ (60 >= 50) and per-colour MOQ (30 >= 20)", () => {
    const items: MoqValidationItem[] = [
      {
        ...fabricConfig,
        colorId: "col_navy",
        colorName: "Navy Blue",
        quantity: 30,
      },
      {
        ...fabricConfig,
        colorId: "col_white",
        colorName: "Crisp White",
        quantity: 30,
      },
    ];

    const result = validateOrderMoq(items);
    expect(result.valid).toBe(true);
  });

  it("Worked Example 2: 45 Navy + 5 White fails per-colour MOQ for Crisp White (5 < 20)", () => {
    const items: MoqValidationItem[] = [
      {
        ...fabricConfig,
        colorId: "col_navy",
        colorName: "Navy Blue",
        quantity: 45,
      },
      {
        ...fabricConfig,
        colorId: "col_white",
        colorName: "Crisp White",
        quantity: 5,
      },
    ];

    const result = validateOrderMoq(items);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("MOQ_COLOR_MINIMUM");
      expect(result.colorId).toBe("col_white");
      expect(result.error).toBe("Crisp White requires at least 20 units. Currently 5.");
    }
  });

  it("Worked Example 3: 20 Navy + 20 White meets per-colour MOQ (20 >= 20) but fails fabric MOQ (40 < 50)", () => {
    const items: MoqValidationItem[] = [
      {
        ...fabricConfig,
        colorId: "col_navy",
        colorName: "Navy Blue",
        quantity: 20,
      },
      {
        ...fabricConfig,
        colorId: "col_white",
        colorName: "Crisp White",
        quantity: 20,
      },
    ];

    const result = validateOrderMoq(items);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("MOQ_FABRIC_MINIMUM");
      expect(result.fabricId).toBe("fab_pique");
      expect(result.error).toBe("Pique Cotton requires at least 50 units total across all colours. Currently 40.");
    }
  });

  it("Single-colour order meeting both thresholds (50 Navy) is VALID", () => {
    const items: MoqValidationItem[] = [
      {
        ...fabricConfig,
        colorId: "col_navy",
        colorName: "Navy Blue",
        quantity: 50,
      },
    ];

    const result = validateOrderMoq(items);
    expect(result.valid).toBe(true);
  });

  it("Legacy order with colorId null is VALID under moqPerFabric alone (50 units)", () => {
    const items: MoqValidationItem[] = [
      {
        ...fabricConfig,
        colorId: null,
        colorName: null,
        quantity: 50,
      },
    ];

    const result = validateOrderMoq(items);
    expect(result.valid).toBe(true);
  });

  it("Colour with zero units present in payload is ignored and does NOT fail per-colour validation", () => {
    const items: MoqValidationItem[] = [
      {
        ...fabricConfig,
        colorId: "col_navy",
        colorName: "Navy Blue",
        quantity: 50,
      },
      {
        ...fabricConfig,
        colorId: "col_white",
        colorName: "Crisp White",
        quantity: 0,
      },
    ];

    const result = validateOrderMoq(items);
    expect(result.valid).toBe(true);
  });

  it("Exactly-at-threshold cases: fabric total exactly 50 and colour total exactly 20 are VALID", () => {
    // Exact fabric MOQ total (50)
    const exactFabricResult = validateOrderMoq([
      {
        ...fabricConfig,
        colorId: "col_navy",
        colorName: "Navy Blue",
        quantity: 50,
      },
    ]);
    expect(exactFabricResult.valid).toBe(true);

    // Exact per-colour MOQ (20 Navy + 30 White = 50 total)
    const exactColorResult = validateOrderMoq([
      {
        ...fabricConfig,
        colorId: "col_navy",
        colorName: "Navy Blue",
        quantity: 20,
      },
      {
        ...fabricConfig,
        colorId: "col_white",
        colorName: "Crisp White",
        quantity: 30,
      },
    ]);
    expect(exactColorResult.valid).toBe(true);
  });

  describe("Multi-Material MOQ Validation Engine", () => {
    it("validates multi-material items with sufficient quantity", () => {
      const items = [
        {
          materialId: "fab_wool",
          materialName: "Italian Wool Blend",
          colorId: "col_navy",
          component: "MAIN_FABRIC",
          quantity: 60,
          moqPerFabric: 50,
          moqPerColor: 20,
        },
        {
          materialId: "fab_viscose",
          materialName: "Viscose Lining",
          colorId: "col_black",
          component: "LINING",
          quantity: 60,
          moqPerFabric: 50,
          moqPerColor: 20,
        },
      ];

      const result = validateMultiMaterialMoq(items);
      expect(result.valid).toBe(true);
    });

    it("rejects multi-material item when quantity is below fabric MOQ", () => {
      const items = [
        {
          materialId: "fab_wool",
          materialName: "Italian Wool Blend",
          colorId: "col_navy",
          component: "MAIN_FABRIC",
          quantity: 30,
          moqPerFabric: 50,
          moqPerColor: 20,
        },
      ];

      const result = validateMultiMaterialMoq(items);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe("MOQ_FABRIC_MINIMUM");
        expect(result.materialId).toBe("fab_wool");
      }
    });

    it("evaluates combined multi-fabric MOQ when option provided", () => {
      const items = [
        {
          materialId: "fab_wool",
          component: "MAIN_FABRIC",
          quantity: 50,
          moqPerFabric: 50,
        },
        {
          materialId: "fab_viscose",
          component: "LINING",
          quantity: 50,
          moqPerFabric: 50,
        },
      ];

      const result = validateMultiMaterialMoq(items, { combinedMultiFabricMoq: 200 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe("MOQ_COMBINED_MULTI_FABRIC");
      }
    });
  });
});

