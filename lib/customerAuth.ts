import { CompactSign, jwtVerify } from "jose";

export function getCustomerJwtSecret(): Uint8Array {
  const secret = process.env.CUSTOMER_JWT_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY FAILURE: CUSTOMER_JWT_SECRET or ADMIN_JWT_SECRET environment variable is not configured."
      );
    }
    // Safe dev default only in non-production
    return Uint8Array.from(
      new TextEncoder().encode("satriano-customer-dev-secret-key-32-chars-min!")
    );
  }
  return Uint8Array.from(new TextEncoder().encode(secret.trim()));
}

export async function createCustomerToken(email: string): Promise<string> {
  const secret = getCustomerJwtSecret();
  const payloadBytes = Uint8Array.from(
    new TextEncoder().encode(
      JSON.stringify({
        email: email.toLowerCase().trim(),
        role: "customer",
        atelier: "satriano",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400, // 24h
      })
    )
  );

  const jws = new CompactSign(payloadBytes);
  jws.setProtectedHeader({ alg: "HS256" });
  return await jws.sign(secret);
}

export async function verifyCustomerToken(token: string): Promise<{ email: string } | null> {
  if (!token || typeof token !== "string") return null;
  try {
    const secret = getCustomerJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const p = payload as Record<string, unknown>;
    const email = p.email;
    const role = p.role;
    if (role === "customer" && email && typeof email === "string") {
      return { email };
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyCustomerRequest(req: Request): Promise<{ email: string } | null> {
  // 1. Check Authorization header (Bearer <token>)
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const verified = await verifyCustomerToken(token);
    if (verified) return verified;
  }

  // 2. Check httpOnly Cookie (sat_customer_token)
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );

    const token = cookies["sat_customer_token"];
    if (token) {
      const verified = await verifyCustomerToken(token);
      if (verified) return verified;
    }
  }

  return null;
}
