import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifyAdminToken,
  verifyAdminKey,
  getAdminJwtSecret,
} from "@/lib/adminAuth";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authHeader = request.headers.get("authorization");
  const cookieToken = request.cookies.get("sat_admin_token")?.value;

  let isAuthenticated = false;

  // 1. Verify signed httpOnly cookie using jose with pinned HS256 algorithm
  if (cookieToken) {
    try {
      const secret = getAdminJwtSecret();
      const { payload } = await jwtVerify(cookieToken, secret, {
        algorithms: ["HS256"], // Pin algorithm explicitly
      });
      if (payload.role === "admin") {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 2. Verify Authorization Bearer token header if cookie is missing
  if (!isAuthenticated && authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (verifyAdminKey(token) || (await verifyAdminToken(token))) {
      isAuthenticated = true;
    }
  }

  // 3. Protect API routes: Return 401 Unauthorized for unauthenticated requests
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/login")
  ) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized access to Portal Console API." },
        { status: 401 }
      );
    }
  }

  // 4. Protect nested Admin Page subroutes (e.g. /admin/orders, /admin/product-settings)
  if (pathname.startsWith("/admin/") && pathname !== "/admin") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Temporary Site Maintenance / Password Gate (Only enabled if SITE_MAINTENANCE_LOCK is explicitly "true")
  const isMaintenanceLocked = process.env.SITE_MAINTENANCE_LOCK === "true";
  if (isMaintenanceLocked) {
    const isExempt =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api/admin") ||
      pathname.startsWith("/api/site-auth") ||
      pathname === "/under-development" ||
      pathname.startsWith("/_next") ||
      pathname.includes(".");

    if (!isExempt) {
      const sitePassCookie = request.cookies.get("satriano_site_pass")?.value;
      if (sitePassCookie !== "authenticated") {
        const lockUrl = new URL("/under-development", request.url);
        return NextResponse.rewrite(lockUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
