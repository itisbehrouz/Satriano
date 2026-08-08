import { NextResponse } from "next/server";
import { calculateInventoryForecast, checkReorderPoints } from "@/lib/inventoryForecasting";

export async function POST() {
  try {
    await calculateInventoryForecast();
    const alerts = await checkReorderPoints();
    return NextResponse.json({ success: true, alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
