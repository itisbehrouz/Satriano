import { type LogoPlacement } from "@/app/generated/prisma/client";
import { MaterialSelection } from "@/components/configurator/MaterialComponentSelector";

export interface M2OCartItem {
  id: string;
  fabricId?: string;
  colorId?: string;
  productId?: string;
  fitId?: string;
  materials?: MaterialSelection[];
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

export interface M2oCart {
  items: M2OCartItem[];
  companyName?: string;
  companyEmail?: string;
  customerTargetPriceCents?: number;
  logoAssetId?: string;
  logoPlacement?: string;
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

export function convertM2oCartToOrderPayload(
  cart: M2oCart,
  useMultiMaterial: boolean
): Record<string, unknown> {
  if (useMultiMaterial && cart.items[0]?.materials) {
    return {
      companyName: cart.companyName,
      companyEmail: cart.companyEmail,
      orderType: "M2O",
      customerTargetPriceCents: cart.customerTargetPriceCents,
      items: cart.items.map((item) => ({
        productId: item.productId,
        selectedFit: item.fitId,
        materials: item.materials || [],
      })),
      logoAssetId: cart.logoAssetId,
      logoPlacement: cart.logoPlacement,
    };
  } else {
    return {
      companyName: cart.companyName,
      companyEmail: cart.companyEmail,
      orderType: "M2O",
      customerTargetPriceCents: cart.customerTargetPriceCents,
      items: cart.items.map((item) => ({
        productId: item.productId,
        fabricId: item.fabricId,
        colorId: item.colorId,
        fitId: item.fitId,
        sizeQuantities: item.sizeQuantities,
      })),
      logoAssetId: cart.logoAssetId,
      logoPlacement: cart.logoPlacement,
    };
  }
}
