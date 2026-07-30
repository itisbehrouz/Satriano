import crypto from "crypto";

const DEFAULT_TEST_KEY =
  "4d8f5ca650f30cef990e8a69abfbdb3d9f6fc42bb1c21b69a7adf736b1bd3ed6";
const DEFAULT_TEST_JWT_SECRET =
  "9833f048bb00e1597a42664ddfadef5fae24f2f4220c11857477fa7fe92b1809";

export function getAdminAccessKey(): string {
  return process.env.ADMIN_ACCESS_KEY || DEFAULT_TEST_KEY;
}

export function getAdminJwtSecret(): string {
  return process.env.ADMIN_JWT_SECRET || DEFAULT_TEST_JWT_SECRET;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Timing-safe string comparison to prevent side-channel timing attacks
 */
export function verifyAdminKey(inputKey: string): boolean {
  if (!inputKey || typeof inputKey !== "string") return false;

  const expectedKey = getAdminAccessKey();
  const inputBuffer = Buffer.from(inputKey.trim());
  const expectedBuffer = Buffer.from(expectedKey.trim());

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}

/**
 * Creates a signed JWT token for httpOnly session cookies
 */
export async function createAdminToken(): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      role: "admin",
      atelier: "satriano",
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  );
  const secret = getAdminJwtSecret();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * Verifies a signed JWT token
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  const secret = getAdminJwtSecret();
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  if (signature !== expectedSig) return false;

  try {
    const parsedPayload = JSON.parse(base64UrlDecode(payload));
    if (parsedPayload.role !== "admin") return false;
    if (parsedPayload.exp && Math.floor(Date.now() / 1000) > parsedPayload.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Universal server-side verification helper for API route handlers and middleware
 */
export async function verifyAdminRequest(req: Request): Promise<boolean> {
  // 1. Check Authorization header (Bearer <ADMIN_ACCESS_KEY> or Bearer <JWT_TOKEN>)
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const tokenOrKey = authHeader.substring(7).trim();
    if (verifyAdminKey(tokenOrKey)) {
      return true;
    }
    if (await verifyAdminToken(tokenOrKey)) {
      return true;
    }
  }

  // 2. Check httpOnly Cookie (sat_admin_token)
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );

    const token = cookies["sat_admin_token"];
    if (token && (await verifyAdminToken(token))) {
      return true;
    }
  }

  return false;
}
