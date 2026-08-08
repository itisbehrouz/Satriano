// High-performance in-memory cache engine with TTL support
const memoryCache = new Map<string, { value: string; expiry: number }>();

export async function getCached<T>(key: string): Promise<T | null> {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return null;
  }
  try {
    return JSON.parse(item.value) as T;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
  const stringValue = JSON.stringify(value);
  memoryCache.set(key, {
    value: stringValue,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export async function invalidateCache(pattern: string): Promise<void> {
  const regexPattern = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  for (const key of memoryCache.keys()) {
    if (regexPattern.test(key)) {
      memoryCache.delete(key);
    }
  }
}

export const CACHE_KEYS = {
  PRODUCTS: "products:*",
  FABRICS: "fabrics:*",
  PRICE_ESTIMATE: "estimate:*",
  WHOLESALE_CATALOG: "wholesale:catalog",
};
