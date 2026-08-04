import type { SizeQuantity } from "@/lib/pricing";

export const SIZE_CODES = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"] as const;

export type SizeCode = string;

export type SizeQuantities = Record<string, number>;

export const DEFAULT_SIZE_QUANTITIES: Record<string, number> = {
  XS: 0,
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
  "2XL": 0,
  "3XL": 0,
};

export function parseQuantityInput(raw: string): number {
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.trunc(parsed));
}

export function sumQuantities(quantities: Record<string, number>): number {
  return Object.values(quantities).reduce((sum, qty) => sum + (qty || 0), 0);
}

export function toSizeQuantityArray(quantities: Record<string, number>): SizeQuantity[] {
  const knownKeys = SIZE_CODES.filter((code) => code in quantities);
  const otherKeys = Object.keys(quantities).filter((k) => !(SIZE_CODES as readonly string[]).includes(k));
  const orderedKeys = [...knownKeys, ...otherKeys];

  return orderedKeys
    .filter((size) => (quantities[size] ?? 0) > 0)
    .map((size) => ({ size, quantity: quantities[size] }));
}
