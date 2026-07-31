import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { verifyCustomerRequest } from "@/lib/customerAuth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { company: true, proforma: true },
    });

    if (!order || !order.proforma) {
      return NextResponse.json({ error: "Proforma not found" }, { status: 404 });
    }

    const isAdmin = await verifyAdminRequest(request);
    const customerSession = await verifyCustomerRequest(request);

    // Authorize if admin OR customer owning this company email
    if (!isAdmin) {
      if (!customerSession || customerSession.email !== order.company.email) {
        return NextResponse.json(
          { error: "Unauthorized access to proforma PDF." },
          { status: 401 }
        );
      }
    }

    const proforma = order.proforma;
    const filename = `${proforma.refNo}.pdf`;

    if (supabase) {
      // Create a fresh 60-minute signed URL from private bucket 'proformas'
      const { data, error } = await supabase.storage
        .from("proformas")
        .createSignedUrl(filename, 3600);

      if (!error && data?.signedUrl) {
        return NextResponse.redirect(data.signedUrl, 307);
      }

      // Fallback: try proformas path in logos bucket if used earlier
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from("logos")
        .createSignedUrl(`proformas/${filename}`, 3600);

      if (!fallbackError && fallbackData?.signedUrl) {
        return NextResponse.redirect(fallbackData.signedUrl, 307);
      }
    }

    // Local filesystem fallback for dev
    const localUrl = new URL(`/proformas/${filename}`, request.url);
    return NextResponse.redirect(localUrl, 307);
  } catch (error) {
    console.error("Proforma PDF download error:", error);
    return NextResponse.json(
      { error: "Failed to fetch proforma PDF link" },
      { status: 500 }
    );
  }
}
