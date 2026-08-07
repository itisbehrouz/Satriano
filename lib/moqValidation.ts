export interface MoqValidationItem {
  fabricId: string;
  fabricName?: string;
  colorId?: string | null;
  colorName?: string | null;
  quantity: number;
  moqPerFabric?: number;
  moqPerColor?: number;
}

export interface MultiMaterialMoqItem {
  materialId: string;
  materialName?: string;
  colorId?: string | null;
  colorName?: string | null;
  component: string; // MaterialComponent enum value
  quantity: number;
  ratio?: number; // e.g., 0.80 for 80% of line item quantity
  moqPerFabric?: number;
  moqPerColor?: number;
}

export type MoqValidationResult =
  | { valid: true; warnings?: string[] }
  | {
      valid: false;
      error: string;
      code: "MOQ_FABRIC_MINIMUM" | "MOQ_COLOR_MINIMUM" | "MOQ_COMBINED_MULTI_FABRIC";
      fabricId?: string;
      colorId?: string | null;
      materialId?: string;
      component?: string;
    };

/**
 * Validates single-fabric two-threshold MOQ requirements across an order payload:
 * 1. moqPerFabric: total units across all selected colours of that fabric line must be >= moqPerFabric (default 50).
 * 2. moqPerColor: each selected colour with > 0 units must individually be >= moqPerColor (default 20).
 */
export function validateSingleFabricMoq(items: MoqValidationItem[]): MoqValidationResult {
  if (!items || items.length === 0) {
    return { valid: true };
  }

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

  for (const [fabricId, fabricData] of fabricMap.entries()) {
    if (fabricData.totalUnits < fabricData.moqPerFabric) {
      return {
        valid: false,
        code: "MOQ_FABRIC_MINIMUM",
        fabricId,
        materialId: fabricId,
        error: `${fabricData.fabricName} requires at least ${fabricData.moqPerFabric} units total across all colours. Currently ${fabricData.totalUnits}.`,
      };
    }

    for (const [colorId, colorData] of fabricData.colors.entries()) {
      if (colorData.totalUnits > 0 && colorData.totalUnits < fabricData.moqPerColor) {
        return {
          valid: false,
          code: "MOQ_COLOR_MINIMUM",
          fabricId,
          colorId,
          materialId: fabricId,
          error: `${colorData.colorName} requires at least ${fabricData.moqPerColor} units. Currently ${colorData.totalUnits}.`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Legacy alias for validateSingleFabricMoq
 */
export const validateOrderMoq = validateSingleFabricMoq;

/**
 * Multi-Material MOQ Validation
 * Supports component-level material specs with optional combined MOQ
 */
export function validateMultiMaterialMoq(
  items: MultiMaterialMoqItem[],
  options?: {
    combinedMultiFabricMoq?: number;
    strictComponentValidation?: boolean;
  }
): MoqValidationResult {
  if (!items || items.length === 0) {
    return {
      valid: false,
      error: "No material items to validate",
      code: "MOQ_FABRIC_MINIMUM",
    };
  }

  const itemsByMaterial = new Map<
    string,
    {
      total: number;
      moqPerFabric: number;
      moqPerColor: number;
      materialName: string;
      byColor: Map<string, { total: number; colorName: string }>;
      byComponent: Map<string, number>;
    }
  >();
  let combinedTotal = 0;

  for (const item of items) {
    if (item.quantity <= 0) continue;

    const materialId = item.materialId;
    const colorId = item.colorId || "unspecified";
    const component = item.component || "MAIN_FABRIC";
    const moqPerFabric = item.moqPerFabric ?? 50;
    const moqPerColor = item.moqPerColor ?? 20;
    const materialName = item.materialName || `Material ${materialId}`;
    const colorName = item.colorName || colorId;

    const effectiveQuantity = item.ratio ? Math.ceil(item.quantity * item.ratio) : item.quantity;
    combinedTotal += effectiveQuantity;

    if (!itemsByMaterial.has(materialId)) {
      itemsByMaterial.set(materialId, {
        total: 0,
        moqPerFabric,
        moqPerColor,
        materialName,
        byColor: new Map(),
        byComponent: new Map(),
      });
    }

    const matData = itemsByMaterial.get(materialId)!;
    matData.total += effectiveQuantity;
    matData.moqPerFabric = Math.max(matData.moqPerFabric, moqPerFabric);
    matData.moqPerColor = Math.max(matData.moqPerColor, moqPerColor);

    if (!matData.byColor.has(colorId)) {
      matData.byColor.set(colorId, { total: 0, colorName });
    }
    matData.byColor.get(colorId)!.total += effectiveQuantity;
    matData.byComponent.set(component, (matData.byComponent.get(component) ?? 0) + effectiveQuantity);
  }

  for (const [materialId, matData] of itemsByMaterial.entries()) {
    if (matData.total < matData.moqPerFabric) {
      return {
        valid: false,
        error: `${matData.materialName} requires minimum ${matData.moqPerFabric} units, got ${matData.total}`,
        code: "MOQ_FABRIC_MINIMUM",
        materialId,
        fabricId: materialId,
      };
    }

    for (const [colorId, colorData] of matData.byColor.entries()) {
      if (colorId !== "unspecified" && colorData.total > 0 && colorData.total < matData.moqPerColor) {
        return {
          valid: false,
          error: `Color ${colorData.colorName} for material ${matData.materialName} requires minimum ${matData.moqPerColor} units, got ${colorData.total}`,
          code: "MOQ_COLOR_MINIMUM",
          materialId,
          fabricId: materialId,
          colorId,
        };
      }
    }
  }

  if (options?.combinedMultiFabricMoq && combinedTotal < options.combinedMultiFabricMoq) {
    return {
      valid: false,
      error: `Combined material total requires minimum ${options.combinedMultiFabricMoq} units, got ${combinedTotal}`,
      code: "MOQ_COMBINED_MULTI_FABRIC",
    };
  }

  return { valid: true, warnings: [] };
}

/**
 * Hybrid Validation: checks both legacy single-fabric AND new multi-material specs
 */
export function validateHybridMoq(
  singleFabricItems?: MoqValidationItem[],
  multiMaterialItems?: MultiMaterialMoqItem[],
  options?: { combinedMultiFabricMoq?: number }
): MoqValidationResult {
  if (multiMaterialItems && multiMaterialItems.length > 0) {
    return validateMultiMaterialMoq(multiMaterialItems, options);
  }

  if (singleFabricItems && singleFabricItems.length > 0) {
    return validateSingleFabricMoq(singleFabricItems);
  }

  return { valid: false, error: "No items provided for validation", code: "MOQ_FABRIC_MINIMUM" };
}
