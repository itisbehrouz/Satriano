import type { SizeQuantity } from "@/lib/pricing";

export const SIZE_CODES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export type SizeCode = (typeof SIZE_CODES)[number];

export type SizeQuantities = Record<SizeCode, number>;

// Mirrors the default quantities in configurator_polo_t_shirt/code.html.
export const DEFAULT_SIZE_QUANTITIES: SizeQuantities = {
  XS: 0,
  S: 50,
  M: 100,
  L: 100,
  XL: 50,
  XXL: 0,
};

export function parseQuantityInput(raw: string): number {
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.trunc(parsed));
}

export function sumQuantities(quantities: SizeQuantities): number {
  return SIZE_CODES.reduce((sum, size) => sum + quantities[size], 0);
}

export function toSizeQuantityArray(quantities: SizeQuantities): SizeQuantity[] {
  return SIZE_CODES.map((size) => ({ size, quantity: quantities[size] }));
}
