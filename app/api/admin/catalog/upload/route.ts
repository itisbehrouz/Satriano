import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/adminAuth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "catalog-images";

export async function POST(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are accepted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    if (!supabase) {
      return NextResponse.json(
        { error: "Storage service is not configured." },
        { status: 503 }
      );
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      filename,
    });
  } catch (error) {
    console.error("Catalog image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image." }, { status: 500 });
  }
}
