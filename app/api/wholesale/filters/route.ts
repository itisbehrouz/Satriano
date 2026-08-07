import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const gendersRaw = await prisma.wholesaleProduct.findMany({
      where: { status: "ACTIVE" },
      distinct: ["gender"],
      select: { gender: true },
    });

    const ageGroupsRaw = await prisma.wholesaleProduct.findMany({
      where: { status: "ACTIVE" },
      distinct: ["ageGroup"],
      select: { ageGroup: true },
    });

    const genders = gendersRaw.map((g) => g.gender).filter((g): g is string => Boolean(g));
    const ageGroups = ageGroupsRaw.map((a) => a.ageGroup).filter((a): a is string => Boolean(a));

    return NextResponse.json({
      genders,
      ageGroups,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch wholesale filters" },
      { status: 500 }
    );
  }
}
