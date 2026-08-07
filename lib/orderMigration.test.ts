import { describe, it, expect } from "vitest";
import { convertLegacyToMultiMaterial } from "./orderMigration";
import { validateCreateOrderInputMultiMaterial } from "./orderValidation";
import type { CreateOrderInput } from "./orderValidation";

describe("Order Migration & Multi-Material Validation (lib/orderMigration.ts)", () => {
  it("converts legacy single-fabric payload to multi-material payload", () => {
    const legacyPayload: CreateOrderInput = {
      companyName: "Acme Corp",
      companyEmail: "order@acme.com",
      customerTargetPriceCents: 50000,
      items: [
        {
          fabricId: "fab_oxford",
          colorId: "col_blue",
          productId: "prod_shirt",
          fitId: "fit_regular",
          sizeQuantities: [
            { size: "M", quantity: 30 },
            { size: "L", quantity: 30 },
          ],
        },
      ],
    };

    const converted = convertLegacyToMultiMaterial(legacyPayload);
    expect(converted.companyName).toBe("Acme Corp");
    expect(converted.items).toHaveLength(1);
    expect(converted.items[0].materials).toHaveLength(1);
    expect(converted.items[0].materials[0].materialId).toBe("fab_oxford");
    expect(converted.items[0].materials[0].component).toBe("MAIN_FABRIC");
  });

  it("validates valid multi-material payload", () => {
    const payload = {
      companyName: "Satriano Luxury",
      companyEmail: "b2b@satriano.com",
      items: [
        {
          productId: "prod_blazer",
          selectedFit: "SLIM",
          materials: [
            {
              materialId: "fab_wool",
              colorId: "col_navy",
              component: "MAIN_FABRIC",
              composition: "100% Italian Wool",
              sizeQuantities: [{ size: "50", quantity: 50 }],
            },
            {
              materialId: "fab_viscose",
              colorId: "col_black",
              component: "LINING",
              composition: "100% Viscose",
              sizeQuantities: [{ size: "50", quantity: 50 }],
            },
          ],
        },
      ],
    };

    const result = validateCreateOrderInputMultiMaterial(payload);
    expect(result.success).toBe(true);
    expect(result.data?.items[0].materials).toHaveLength(2);
  });
});
