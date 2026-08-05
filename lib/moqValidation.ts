export interface MoqValidationItem {
  fabricId: string;
  fabricName?: string;
  colorId?: string | null;
  colorName?: string | null;
  quantity: number;
  moqPerFabric?: number;
  moqPerColor?: number;
}

export type MoqValidationResult =
  | { valid: true }
  | {
      valid: false;
      error: string;
      code: "MOQ_COLOR_MINIMUM" | "MOQ_FABRIC_MINIMUM";
      fabricId: string;
      colorId?: string | null;
    };

/**
 * Validates two-threshold MOQ requirements across an order payload:
 * 1. moqPerFabric: total units across all selected colours of that fabric line must be >= moqPerFabric (default 50).
 * 2. moqPerColor: each selected colour with > 0 units must individually be >= moqPerColor (default 20).
 *
 * Items with colorId null/undefined (legacy orders) skip per-colour validation and enforce fabric MOQ alone.
 * Colours with 0 units are ignored and do not trigger a per-colour failure.
 */
export function validateOrderMoq(items: MoqValidationItem[]): MoqValidationResult {
  if (!items || items.length === 0) {
    return { valid: true };
  }

  // Map to store fabric aggregates: fabricId -> { totalUnits, moqPerFabric, moqPerColor, fabricName, colorTotals }
  const fabricMap = new Map<
    string,
    {
      totalUnits: number;
      moqPerFabric: number;
      moqPerColor: number;
      fabricName: string;
      colors: Map<string, { totalUnits: number; colorName: string }>;
    }
  >();

  for (const item of items) {
    if (item.quantity <= 0) continue;

    const fabricId = item.fabricId;
    const moqPerFabric = item.moqPerFabric ?? 50;
    const moqPerColor = item.moqPerColor ?? 20;
    const fabricName = item.fabricName || "This fabric line";

    if (!fabricMap.has(fabricId)) {
      fabricMap.set(fabricId, {
        totalUnits: 0,
        moqPerFabric,
        moqPerColor,
        fabricName,
        colors: new Map(),
      });
    }

    const fabricEntry = fabricMap.get(fabricId)!;
    fabricEntry.totalUnits += item.quantity;
    // Keep lowest/most restrictive config if passed per item
    fabricEntry.moqPerFabric = Math.max(fabricEntry.moqPerFabric, moqPerFabric);
    fabricEntry.moqPerColor = Math.max(fabricEntry.moqPerColor, moqPerColor);

    if (item.colorId) {
      const colorId = item.colorId;
      const colorName = item.colorName || "Selected colorway";
      if (!fabricEntry.colors.has(colorId)) {
        fabricEntry.colors.set(colorId, { totalUnits: 0, colorName });
      }
      const colorEntry = fabricEntry.colors.get(colorId)!;
      colorEntry.totalUnits += item.quantity;
    }
  }

  // Validate thresholds for each fabric line
  for (const [fabricId, fabricData] of fabricMap.entries()) {
    // 1. Validate total units for the fabric line
    if (fabricData.totalUnits < fabricData.moqPerFabric) {
      return {
        valid: false,
        code: "MOQ_FABRIC_MINIMUM",
        fabricId,
        error: `${fabricData.fabricName} requires at least ${fabricData.moqPerFabric} units total across all colours. Currently ${fabricData.totalUnits}.`,
      };
    }

    // 2. Validate per-colour minimum for each selected colour with > 0 units
    for (const [colorId, colorData] of fabricData.colors.entries()) {
      if (colorData.totalUnits > 0 && colorData.totalUnits < fabricData.moqPerColor) {
        return {
          valid: false,
          code: "MOQ_COLOR_MINIMUM",
          fabricId,
          colorId,
          error: `${colorData.colorName} requires at least ${fabricData.moqPerColor} units. Currently ${colorData.totalUnits}.`,
        };
      }
    }
  }

  return { valid: true };
}
