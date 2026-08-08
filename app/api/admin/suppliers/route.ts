import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newSupplier = await prisma.supplier.create({
      data: {
        firmName: data.firmName || data.name || "Unnamed Supplier",
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        website: data.website,
        notes: data.notes,
        country: data.country,
        leadTimeDays: data.leadTimeDays ? parseInt(data.leadTimeDays.toString(), 10) : null,
        active: data.active ?? true,
        status: data.status || "PENDING_VERIFICATION",
      },
    });
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create supplier", message: error.message }, { status: 500 });
  }
}