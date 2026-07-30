import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_JWT_SECRET ||
    "9833f048bb00e1597a42664ddfadef5fae24f2f4220c11857477fa7fe92b1809";
  return new TextEncoder().encode(secret);
}

function getAdminAccessKey(): string {
  return (
    process.env.ADMIN_ACCESS_KEY ||
    "4d8f5ca650f30cef990e8a69abfbdb3d9f6fc42bb1c21b69a7adf736b1bd3ed6"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authHeader = request.headers.get("authorization");
  const cookieToken = request.cookies.get("sat_admin_token")?.value;

  let isAuthenticated = false;

  // 1. Verify signed httpOnly cookie using jose with pinned HS256 algorithm
  if (cookieToken) {
    try {
      const { payload } = await jwtVerify(cookieToken, getJwtSecret(), {
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
    if (token === getAdminAccessKey()) {
      isAuthenticated = true;
    } else {
      try {
        const { payload } = await jwtVerify(token, getJwtSecret(), {
          algorithms: ["HS256"],
        });
        if (payload.role === "admin") {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
