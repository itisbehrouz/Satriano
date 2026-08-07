import type { SizeQuantity } from "@/lib/pricing";

export interface CreateOrderInputItem {
  fabricId: string;
  colorId?: string;
  productId?: string;
  fitId?: string;
  sizeQuantities: SizeQuantity[];
  logoUrl?: string;
  logoPlacement?: "LEFT_CHEST" | "RIGHT_SLEEVE";
}

export interface CreateOrderInput {
  companyName: string;
  companyEmail: string;
  customerTargetPriceCents?: number;
  items: CreateOrderInputItem[];
}

export type CreateOrderValidationResult =
  | { valid: true; data: CreateOrderInput }
  | { valid: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidSizeQuantity(entry: unknown): entry is SizeQuantity {
  if (typeof entry !== "object" || entry === null) return false;
  const { size, quantity } = entry as Record<string, unknown>;
  return (
    typeof size === "string" &&
    size.trim() !== "" &&
    typeof quantity === "number" &&
    Number.isInteger(quantity) &&
    quantity >= 0
  );
}

export function validateCreateOrderInput(body: unknown): CreateOrderValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Request body must be an object" };
  }

  const {
    companyName,
    companyEmail,
    customerTargetPriceCents,
    items,
  } = body as Record<string, unknown>;

  if (typeof companyName !== "string" || companyName.trim() === "") {
    return { valid: false, error: "companyName is required" };
  }

  if (typeof companyEmail !== "string" || !EMAIL_PATTERN.test(companyEmail.trim())) {
    return { valid: false, error: "companyEmail must be a valid email address" };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, error: "Order must contain at least one item" };
  }

  const validatedItems: CreateOrderInputItem[] = [];

  for (const item of items) {
    if (typeof item !== "object" || item === null) {
      return { valid: false, error: "Each item must be an object" };
    }

    const {
      fabricId,
      colorId,
      productId,
      fitId,
      sizeQuantities,
      logoUrl,
      logoPlacement,
    } = item as Record<string, unknown>;

    if (typeof fabricId !== "string" || fabricId.trim() === "") {
      return { valid: false, error: "fabricId is required for all items" };
    }

    if (!Array.isArray(sizeQuantities) || sizeQuantities.length === 0) {
      return { valid: false, error: "sizeQuantities must be a non-empty array for all items" };
    }

    if (!sizeQuantities.every(isValidSizeQuantity)) {
      return {
        valid: false,
        error: "sizeQuantities entries must have a string size and a non-negative integer quantity",
      };
    }

    let validatedLogoUrl: string | undefined = undefined;
    if (typeof logoUrl === "string" && logoUrl.trim() !== "") {
      validatedLogoUrl = logoUrl.trim();
    }

    let validatedPlacement: "LEFT_CHEST" | "RIGHT_SLEEVE" | undefined = undefined;
    if (logoPlacement === "LEFT_CHEST" || logoPlacement === "RIGHT_SLEEVE") {
      validatedPlacement = logoPlacement;
    }

    validatedItems.push({
      fabricId: fabricId.trim(),
      colorId: typeof colorId === "string" && colorId.trim() !== "" ? colorId.trim() : undefined,
      productId: typeof productId === "string" && productId.trim() !== "" ? productId.trim() : undefined,
      fitId: typeof fitId === "string" && fitId.trim() !== "" ? fitId.trim() : undefined,
      sizeQuantities,
      logoUrl: validatedLogoUrl,
      logoPlacement: validatedPlacement,
    });
  }

  let validatedTargetPrice: number | undefined = undefined;
  if (typeof customerTargetPriceCents === "number" && customerTargetPriceCents > 0) {
    validatedTargetPrice = Math.round(customerTargetPriceCents);
  }

  return {
    valid: true,
    data: {
      companyName: companyName.trim(),
      companyEmail: companyEmail.trim().toLowerCase(),
      customerTargetPriceCents: validatedTargetPrice,
      items: validatedItems,
    },
  };
}

export interface CreateOrderInputMultiMaterial {
  companyName: string;
  companyEmail: string;
  customerTargetPriceCents?: number;
  items: Array<{
    productId: string;
    materials: Array<{
      materialId: string;
      colorId?: string | null;
      component: string; // MaterialComponent enum value
      composition?: string;
      ratio?: number;
      sizeQuantities: Array<{ size: string; quantity: number }>;
    }>;
    selectedFit?: string;
  }>;
}

/**
 * Validate multi-material order payload
 */
export function validateCreateOrderInputMultiMaterial(payload: unknown): {
  success: boolean;
  data?: CreateOrderInputMultiMaterial;
  error?: string;
} {
  if (!payload || typeof payload !== "object") {
    return { success: false, error: "Payload must be an object" };
  }

  const p = payload as Record<string, any>;

  // Basic company validation
  if (!p.companyName || typeof p.companyName !== "string" || !p.companyName.trim()) {
    return { success: false, error: "companyName is required and must be non-empty string" };
  }

  if (!p.companyEmail || typeof p.companyEmail !== "string" || !EMAIL_PATTERN.test(p.companyEmail.trim())) {
    return { success: false, error: `Invalid companyEmail: ${p.companyEmail}` };
  }

  // Validate items array
  if (!Array.isArray(p.items) || p.items.length === 0) {
    return { success: false, error: "items must be a non-empty array" };
  }

  for (const item of p.items) {
    if (!item.productId || typeof item.productId !== "string") {
      return { success: false, error: "Each item must have a valid productId" };
    }

    if (!Array.isArray(item.materials) || item.materials.length === 0) {
      return { success: false, error: `Item ${item.productId} must have at least one material` };
    }

    for (const mat of item.materials) {
      if (!mat.materialId || typeof mat.materialId !== "string") {
        return { success: false, error: "Each material must have a valid materialId" };
      }

      if (!mat.component || typeof mat.component !== "string") {
        return { success: false, error: `Material ${mat.materialId} must specify a component` };
      }

      if (mat.colorId && typeof mat.colorId !== "string") {
        return { success: false, error: `Material ${mat.materialId} colorId must be a string` };
      }

      if (!Array.isArray(mat.sizeQuantities) || mat.sizeQuantities.length === 0) {
        return { success: false, error: `Material ${mat.materialId} must have size quantities` };
      }

      for (const sq of mat.sizeQuantities) {
        if (typeof sq.quantity !== "number" || sq.quantity <= 0) {
          return { success: false, error: `Size ${sq.size} quantity must be > 0` };
        }
      }
    }
  }

  return {
    success: true,
    data: p as CreateOrderInputMultiMaterial,
  };
}

