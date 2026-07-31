"use client";

import { useRef, useState } from "react";

interface CatalogImageUploaderProps {
  /** Current image URL (for preview of already-uploaded image) */
  imageUrl: string | null;
  /** Called with the public URL after a successful upload, or null to clear */
  onImageUrlChange: (url: string | null) => void;
  /** Label text above the uploader */
  label?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function CatalogImageUploader({
  imageUrl,
  onImageUrlChange,
  label = "Catalog Image",
}: CatalogImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(imageUrl);

  async function handleFileChange(file: File | null) {
    setError(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are accepted.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be under 5 MB.");
      return;
    }

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewSrc(localUrl);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/catalog/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Upload failed.");
        setPreviewSrc(imageUrl); // Revert preview
        return;
      }

      setPreviewSrc(json.url);
      onImageUrlChange(json.url);
    } catch {
      setError("Network error uploading image.");
      setPreviewSrc(imageUrl); // Revert preview
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setPreviewSrc(null);
    setError(null);
    onImageUrlChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1.5">
        {label}
      </label>

      {previewSrc ? (
        <div className="relative rounded-lg overflow-hidden border border-[#D1D5DB] bg-[#F5F7FA]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="Preview"
            className="w-full h-40 object-cover object-center"
          />
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <div className="text-xs font-semibold text-[#2E5AAC] animate-pulse">
                Uploading…
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="min-h-[32px] bg-white/90 hover:bg-white border border-[#D1D5DB] text-[#1A2233] text-[11px] font-semibold px-2 py-1 rounded shadow-sm disabled:opacity-50"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={uploading}
              className="min-h-[32px] bg-white/90 hover:bg-white border border-[#D1D5DB] text-[#A32D2D] text-[11px] font-semibold px-2 py-1 rounded shadow-sm disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[120px] ${
            uploading
              ? "border-[#2E5AAC] bg-[#E6F1FB]"
              : "border-[#D1D5DB] bg-[#F5F7FA] hover:border-[#2E5AAC]"
          }`}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <div className="text-xs font-semibold text-[#2E5AAC] animate-pulse">
              Uploading…
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined text-2xl text-[#5B6B85] mb-1.5">
                add_photo_alternate
              </span>
              <span className="text-xs text-[#5B6B85]">
                Click to upload JPG, PNG, or WebP (max 5 MB)
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />

      {error && (
        <p className="mt-1.5 text-xs text-[#C5221F] font-semibold">{error}</p>
      )}
    </div>
  );
}
