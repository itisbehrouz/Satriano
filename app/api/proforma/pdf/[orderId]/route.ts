import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const proforma = await prisma.proforma.findUnique({
      where: { orderId },
    });

    if (!proforma) {
      return NextResponse.json({ error: "Proforma not found" }, { status: 404 });
    }

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
