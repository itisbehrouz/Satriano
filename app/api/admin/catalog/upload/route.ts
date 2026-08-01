import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/adminAuth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const PRIMARY_BUCKET = "catalog-assets";
const FALLBACK_BUCKET = "catalog-images";

export async function POST(request: Request) {
  // 1. Verify Admin Session / Token
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // 2. Validate File Presence
    if (!file) {
      return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
    }

    // 3. Strict Server-Side Format & Size Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file format. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 2MB size limit." },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase storage is not configured." },
        { status: 503 }
      );
    }

    // 4. Prepare Buffer and Unique Filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const filename = `catalog/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // 5. Upload to Supabase Storage Bucket ('catalog-assets', falling back to 'catalog-images')
    let uploadRes = await supabase.storage
      .from(PRIMARY_BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    let activeBucket = PRIMARY_BUCKET;

    if (uploadRes.error && uploadRes.error.message.includes("not found")) {
      // Fallback to secondary bucket if primary is missing
      uploadRes = await supabase.storage
        .from(FALLBACK_BUCKET)
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: true,
        });
      activeBucket = FALLBACK_BUCKET;
    }

    if (uploadRes.error) {
      console.error("Supabase Storage upload error:", uploadRes.error);
      return NextResponse.json(
        { error: `Storage error: ${uploadRes.error.message}` },
        { status: 500 }
      );
    }

    // 6. Generate and Return Public URL
    const { data: publicUrlData } = supabase.storage
      .from(activeBucket)
      .getPublicUrl(uploadRes.data.path);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      filename,
      bucket: activeBucket,
    });
  } catch (error: unknown) {
    console.error("Catalog image upload handler error:", error);
    const message = error instanceof Error ? error.message : "Failed to process upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
