import type { SizeQuantity } from "@/lib/pricing";

export interface CreateOrderInput {
  fabricId: string;
  companyName: string;
  companyEmail: string;
  sizeQuantities: SizeQuantity[];
  logoUrl?: string;
  logoPlacement?: "LEFT_CHEST" | "RIGHT_SLEEVE";
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

  const { fabricId, companyName, companyEmail, sizeQuantities, logoUrl, logoPlacement } =
    body as Record<string, unknown>;

  if (typeof fabricId !== "string" || fabricId.trim() === "") {
    return { valid: false, error: "fabricId is required" };
  }

  if (typeof companyName !== "string" || companyName.trim() === "") {
    return { valid: false, error: "companyName is required" };
  }

  if (typeof companyEmail !== "string" || !EMAIL_PATTERN.test(companyEmail.trim())) {
    return { valid: false, error: "companyEmail must be a valid email address" };
  }

  if (!Array.isArray(sizeQuantities) || sizeQuantities.length === 0) {
    return { valid: false, error: "sizeQuantities must be a non-empty array" };
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

  return {
    valid: true,
    data: {
      fabricId: fabricId.trim(),
      companyName: companyName.trim(),
      companyEmail: companyEmail.trim().toLowerCase(),
      sizeQuantities,
      logoUrl: validatedLogoUrl,
      logoPlacement: validatedPlacement,
    },
  };
}
