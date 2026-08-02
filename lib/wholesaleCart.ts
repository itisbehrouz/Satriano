export interface WholesaleCartItem {
  id: string;
  sku: string;
  name: string;
  unitPriceUSD: number;
  offeredPriceUSD?: number | null;
  sizeBreakdown: Record<string, number>; // e.g. { "36": 3, "38": 5, "40": 1, "44": 3 }
  totalUnits: number;
  subtotalUSD: number;
  discountUSD: number;
  totalPriceUSD: number;
}

const STORAGE_KEY = "satriano_wholesale_cart";

export function getWholesaleCart(): WholesaleCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getSampleDefaultCart();
  } catch (err) {
    console.error("Failed to read wholesale cart:", err);
    return getSampleDefaultCart();
  }
}

export function saveWholesaleCart(items: WholesaleCartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save wholesale cart:", err);
  }
}

export function addToWholesaleCart(item: WholesaleCartItem): void {
  const current = getWholesaleCart();
  const existingIndex = current.findIndex((i) => i.id === item.id || i.sku === item.sku);
  
  if (existingIndex >= 0) {
    current[existingIndex] = item;
  } else {
    current.push(item);
  }
  
  saveWholesaleCart(current);
}

export function clearWholesaleCart(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear wholesale cart:", err);
  }
}

// Sample default cart matching exact prompt layout specification
export function getSampleDefaultCart(): WholesaleCartItem[] {
  return [
    {
      id: "shawl-lapel-blazer",
      sku: "CY-1306-11",
      name: "Shawl Lapel Slim Fit Blazer Men Prom Blazer - Wessi",
      unitPriceUSD: 125.0,
      offeredPriceUSD: 100.0,
      sizeBreakdown: { "36": 3, "38": 5, "40": 1, "44": 3 },
      totalUnits: 12,
      subtotalUSD: 1500.0,
      discountUSD: 300.0,
      totalPriceUSD: 1200.0,
    },
  ];
}
