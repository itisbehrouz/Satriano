import { CreateOrderInput } from "./orderValidation";
import { CreateMultiMaterialOrderPayload } from "./types";

/**
 * Convert legacy single-fabric order payload to multi-material format
 * Ensures old API calls still work seamlessly across legacy integrations.
 */
export function convertLegacyToMultiMaterial(
  legacyPayload: CreateOrderInput
): CreateMultiMaterialOrderPayload {
  return {
    companyName: legacyPayload.companyName,
    companyEmail: legacyPayload.companyEmail,
    orderType: "M2O",
    customerTargetPriceCents: legacyPayload.customerTargetPriceCents,
    items: legacyPayload.items.map((item) => ({
      productId: item.productId || "",
      selectedFit: item.fitId,
      materials: [
        {
          materialId: item.fabricId,
          colorId: item.colorId || null,
          component: "MAIN_FABRIC",
          composition: undefined,
          ratio: undefined,
        },
      ],
      sizeQuantities: item.sizeQuantities,
    })),
  };
}
