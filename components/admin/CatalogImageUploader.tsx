"use client";

import React, { useRef, useState, useEffect } from "react";

export interface CatalogImageUploaderProps {
  /** Fired when an image is successfully uploaded to Supabase Storage */
  onUploadSuccess?: (url: string) => void;
  /** Current image URL for preview */
  currentImageUrl?: string | null;

  /** Backward-compatible prop aliases */
  imageUrl?: string | null;
  onImageUrlChange?: (url: string | null) => void;
  label?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export function CatalogImageUploader({
  onUploadSuccess,
  currentImageUrl,
  imageUrl,
  onImageUrlChange,
  label = "Catalog Image Asset",
}: CatalogImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reconcile effective current image URL from either prop format
  const activeImageUrl = currentImageUrl !== undefined ? currentImageUrl : imageUrl ?? null;
  const [previewUrl, setPreviewUrl] = useState<string | null>(activeImageUrl);

  useEffect(() => {
    setPreviewUrl(activeImageUrl);
  }, [activeImageUrl]);

  const notifySuccess = (url: string | null) => {
    if (url && onUploadSuccess) {
      onUploadSuccess(url);
    }
    if (onImageUrlChange) {
      onImageUrlChange(url);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 1. Pre-Flight Format Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid format. Only .jpg, .png, and .webp files are allowed.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // 2. Pre-Flight Size Validation (Strict 2MB limit)
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File size (${sizeMb} MB) exceeds maximum allowed size of 2.00 MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // 3. Set Immediate Local Blob Preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    // 4. Perform Multipart Upload
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/catalog/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setPreviewUrl(data.url);
      notifySuccess(data.url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error uploading image.";
      setError(message);
      setPreviewUrl(activeImageUrl); // Revert to prior image
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClearImage = () => {
    setPreviewUrl(null);
    setError(null);
    notifySuccess(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2 font-sans text-[#101828]">
      {/* Label & Spec Header */}
      <div className="flex justify-between items-center text-xs">
        <label className="font-bold uppercase tracking-wider text-[#344054]">
          {label}
        </label>
        <span className="text-[11px] font-mono text-[#667085]">
          Max 2.0MB (.jpg, .png, .webp)
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-2.5 bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[#B42318] hover:text-[#7A271A] font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Image Surface (Swiss Design 1px Flat Border, High Info Density) */}
      <div className="border border-[#D0D5DD] bg-[#F9FAFB] rounded-lg p-3 space-y-3">
        {previewUrl ? (
          <div className="space-y-3">
            {/* Image Preview Window */}
            <div className="relative w-full h-44 bg-[#EAECF0] rounded-md overflow-hidden border border-[#EAECF0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Catalog Item Preview"
                className="w-full h-full object-cover object-center"
              />

              {/* Uploading Overlay Loader */}
              {uploading && (
                <div className="absolute inset-0 bg-[#101828]/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Uploading to Supabase Storage…
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload New Image</span>
              </button>

              <button
                type="button"
                onClick={handleClearImage}
                disabled={uploading}
                className="bg-white hover:bg-[#F2F4F7] text-[#B42318] border border-[#D0D5DD] text-xs font-semibold px-3 py-2 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          /* Empty Drop Zone Surface */
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#D0D5DD] bg-white rounded-md space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#667085]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#101828]">
                Select a catalog asset to upload
              </p>
              <p className="text-[11px] text-[#667085]">
                Supported formats: JPEG, PNG, WebP up to 2MB
              </p>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="mt-2 bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload New Image</span>
            </button>
          </div>
        )}

        {/* Hidden Native File Input */}
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
