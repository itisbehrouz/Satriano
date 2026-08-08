import { NextRequest, NextResponse } from "next/server";
import { getRevenueMetrics } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const revenue = await getRevenueMetrics(startDate, endDate);

    return NextResponse.json({
      period: `Last ${period} days`,
      dateRange: { startDate, endDate },
      revenue,
    });
  } catch (error: any) {
    console.error("Revenue analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch revenue analytics" },
      { status: 500 }
    );
  }
}
