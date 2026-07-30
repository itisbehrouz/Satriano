import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, verifyAdminKey } from "@/lib/adminAuth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin API routes
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/login")
  ) {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("sat_admin_token")?.value;

    let isAuthenticated = false;

    if (cookieToken && (await verifyAdminToken(cookieToken))) {
      isAuthenticated = true;
    }

    if (!isAuthenticated && authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (verifyAdminKey(token) || (await verifyAdminToken(token))) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized access to Portal Console API." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
