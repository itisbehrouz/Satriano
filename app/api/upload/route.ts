import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/postscript",
  "application/illustrator",
  "application/x-illustrator",
  "application/vnd.adobe.illustrator",
  "image/eps",
  "image/x-eps",
  "application/octet-stream",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".pdf", ".ai", ".eps"];
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    const fileExt = path.extname(file.name || "").toLowerCase();
    const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtAllowed = ALLOWED_EXTENSIONS.includes(fileExt);

    if (!isMimeAllowed && !isExtAllowed) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed types: JPG, PNG, WebP, SVG, PDF, AI, EPS." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let originalName = file.name && file.name !== "blob" ? file.name : "logo.svg";
    if (file.name === "blob" && file.type) {
      if (file.type.includes("postscript") || file.type.includes("illustrator")) originalName = "logo.ai";
      else if (file.type.includes("eps")) originalName = "logo.eps";
    }
    const filename = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // If Supabase is configured, upload to Supabase Storage bucket 'logos'
    if (supabase) {
      const { data, error } = await supabase.storage
        .from("logos")
        .upload(filename, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("logos")
          .getPublicUrl(data.path);

        return NextResponse.json({
          url: publicUrlData.publicUrl,
          storageUrl: publicUrlData.publicUrl,
          filename: originalName,
        });
      }
    }

    // Fallback: Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      url: publicUrl,
      storageUrl: publicUrl,
      filename: originalName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
