import { CompactSign, jwtVerify } from "jose";
import crypto from "crypto";

const DEFAULT_TEST_KEY =
  "4d8f5ca650f30cef990e8a69abfbdb3d9f6fc42bb1c21b69a7adf736b1bd3ed6";
const DEFAULT_TEST_JWT_SECRET =
  "9833f048bb00e1597a42664ddfadef5fae24f2f4220c11857477fa7fe92b1809";

export function getAdminAccessKey(): string {
  return process.env.ADMIN_ACCESS_KEY || DEFAULT_TEST_KEY;
}

export function getAdminJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || DEFAULT_TEST_JWT_SECRET;
  return Uint8Array.from(Buffer.from(secret, "utf-8"));
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
 * Creates a spec-compliant signed JWT token using audited `jose` library (CompactSign)
 */
export async function createAdminToken(): Promise<string> {
  const secret = getAdminJwtSecret();
  const payloadBytes = Uint8Array.from(
    Buffer.from(
      JSON.stringify({
        role: "admin",
        atelier: "satriano",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      }),
      "utf-8"
    )
  );

  const jws = new CompactSign(payloadBytes);
  jws.setProtectedHeader({ alg: "HS256" });
  return await jws.sign(secret);
}

/**
 * Verifies a signed JWT token using audited `jose` library (jwtVerify) with pinned HS256 algorithm
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  try {
    const secret = getAdminJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"], // Explicitly pin algorithm to prevent algorithm-confusion attacks
    });
    return (payload as any).role === "admin";
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
