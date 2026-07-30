import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const authenticated = await verifyAdminRequest(req);
  if (!authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
