import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("sat_customer_token");
  } catch {
    // Sync fallback
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("sat_customer_token");
  return response;
}
