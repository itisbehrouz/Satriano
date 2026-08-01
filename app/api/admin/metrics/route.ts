import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { getAdminDashboardMetrics } from "@/lib/adminMetrics";

export async function GET(request: Request) {
  try {
    const isAuth = await verifyAdminRequest(request);
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized access to admin metrics API." },
        { status: 401 }
      );
    }

    const metricsData = await getAdminDashboardMetrics();

    return NextResponse.json({
      metrics: metricsData,
    });
  } catch (error: any) {
    console.error("Fetch admin metrics error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load operational metrics." },
      { status: 500 }
    );
  }
}
