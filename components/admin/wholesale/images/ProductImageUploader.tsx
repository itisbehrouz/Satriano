"use client";

import { useState } from "react";

export interface ProductImageItem {
  id: string;
  imageUrl: string;
  imageOrder: number;
}

export interface ProductImageUploaderProps {
  images: ProductImageItem[];
  onChangeImages: (newImages: ProductImageItem[]) => void;
}

export function ProductImageUploader({ images, onChangeImages }: ProductImageUploaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleRemove = (imageId: string) => {
    const updated = images
      .filter((img) => img.id !== imageId)
      .map((img, idx) => ({ ...img, imageOrder: idx + 1 }));
    onChangeImages(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    const reordered = newImages.map((img, idx) => ({ ...img, imageOrder: idx + 1 }));
    onChangeImages(reordered);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Type check (JPG, PNG, WebP)
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only JPG, PNG, and WebP images are accepted.");
      return;
    }

    // Validation: File size (Min 2MB, Max 5MB per spec)
    const minBytes = 2 * 1024 * 1024;
    const maxBytes = 5 * 1024 * 1024;
    if (file.size < minBytes || file.size > maxBytes) {
      setUploadError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) must be between 2MB and 5MB.`
      );
      return;
    }

    setUploadError(null);
    const mockUrl = URL.createObjectURL(file);
    const newImageItem: ProductImageItem = {
      id: `img-${Date.now()}`,
      imageUrl: mockUrl,
      imageOrder: images.length + 1,
    };
    onChangeImages([...images, newImageItem]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 font-sans select-none">
      <div className="flex items-center justify-between border-b border-[#EAECF0] pb-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#111318]">
            PRODUCT IMAGES ({images.length} Photos)
          </h4>
          <p className="text-[11px] text-[#6B7280]">
            Upload 4+ high-quality photos (JPG, PNG, WebP • 2MB–5MB each)
          </p>
        </div>
        {images.length < 4 && (
          <span className="text-[10px] font-mono font-bold text-[#854F0B] bg-[#FDF6E7] px-2 py-0.5 border border-[#F0B94A]/40">
            ⚠️ Minimum 4 images recommended ({4 - images.length} remaining)
          </span>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div
            key={img.id}
            className="relative border border-[#D0D5DD] bg-white rounded-md p-2 space-y-2 group shadow-xs"
          >
            <div className="relative aspect-3/4 bg-[#F8FAFC] overflow-hidden rounded-xs border border-[#E2E8F0]">
              <img
                src={img.imageUrl}
                alt={`Photo ${img.imageOrder}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1.5 left-1.5 bg-[#111318]/80 text-white font-mono text-[10px] px-1.5 py-0.5 font-bold">
                {idx === 0 ? "Main Image" : `Photo ${img.imageOrder}`}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "up")}
                  className="w-6 h-6 bg-[#F8FAFC] border border-[#CBD5E1] hover:bg-[#E2E8F0] text-xs font-bold rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  title="Move Left"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, "down")}
                  className="w-6 h-6 bg-[#F8FAFC] border border-[#CBD5E1] hover:bg-[#E2E8F0] text-xs font-bold rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  title="Move Right"
                >
                  →
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(img.id)}
                className="px-2 py-0.5 bg-white border border-[#F8B4B4] text-[#C5221F] hover:bg-[#FEE4E2] text-[10px] font-bold uppercase rounded cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setUploadError(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">add_a_photo</span>
          + ADD PHOTO
        </button>
      </div>

      {/* Upload Modal (PROMPT 3) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
          <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[460px] text-[#111318] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
                UPLOAD PRODUCT IMAGE
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#6B7280] hover:text-[#111318] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2E5AAC] rounded-md p-6 text-center space-y-3 bg-[#F8FAFC] transition-colors">
              <span className="material-symbols-outlined text-3xl text-[#2E5AAC]">
                cloud_upload
              </span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#0F172A]">
                  Drag & drop image file or browse
                </p>
                <p className="text-[11px] text-[#64748B] font-mono">
                  Accepted: JPG, PNG, WebP • 2MB min to 5MB max
                </p>
              </div>

              <label className="inline-block px-4 py-2 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase tracking-wider rounded-md cursor-pointer transition-colors shadow-xs">
                BROWSE FILES
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleSimulatedFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadError && (
              <div className="p-3 bg-[#FEE4E2] border border-[#F8B4B4] rounded-md text-[11px] text-[#C5221F] font-bold">
                ⚠️ {uploadError}
              </div>
            )}

            <div className="flex justify-end border-t border-[#EAECF0] pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white text-[#344054] border border-[#D0D5DD] rounded-md font-bold uppercase text-xs hover:bg-[#F9FAFB] cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
