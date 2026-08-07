import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const milestones = await prisma.productionMilestone.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(milestones);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const data = await req.json();
    const newMilestone = await prisma.productionMilestone.create({
      data: {
        orderId,
        stage: data.stage,
        status: data.status,
        notes: data.notes,
      },
    });
    return NextResponse.json(newMilestone, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create milestone", message: error.message }, { status: 500 });
  }
}