import { type LogoPlacement } from "@/app/generated/prisma/enums";

export interface M2OCartItem {
  id: string;
  fabricId: string;
  colorId?: string;
  productId?: string;
  fitId?: string;
  sizeQuantities: { size: string; quantity: number; priceMinCents?: number }[];
  logoUrl?: string;
  logoPlacement?: LogoPlacement;
  
  // UI Display fields
  fabricName: string;
  colorName?: string;
  productName: string;
  fitName?: string;
  totalUnits: number;
}

const STORAGE_KEY = "satriano_m2o_cart";

export function getM2OCart(): M2OCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read M2O cart:", err);
    return [];
  }
}

export function saveM2OCart(items: M2OCartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("m2o-cart-updated"));
  } catch (err) {
    console.error("Failed to save M2O cart:", err);
  }
}

export function addToM2OCart(item: M2OCartItem): void {
  const current = getM2OCart();
  current.push(item);
  saveM2OCart(current);
}

export function removeFromM2OCart(itemId: string): void {
  const current = getM2OCart();
  saveM2OCart(current.filter(i => i.id !== itemId));
}

export function clearM2OCart(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("m2o-cart-updated"));
  } catch (err) {
    console.error("Failed to clear M2O cart:", err);
  }
}
