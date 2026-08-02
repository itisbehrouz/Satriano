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
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  const handleRemove = (imageId: string) => {
    const updated = images
      .filter((img) => img.id !== imageId)
      .map((img, idx) => ({ ...img, imageOrder: idx + 1 }));
    onChangeImages(updated);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const newImages = [...images];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
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
    <div className="space-y-3 font-sans select-none">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            PRODUCT IMAGES ({images.length} Photos)
          </h4>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Upload 4+ high-quality photos (JPG, PNG, WebP • 2MB–5MB each)
          </p>
        </div>
        {images.length < 4 && (
          <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 border border-amber-500/30">
            ⚠️ Min 4 photos recommended
          </span>
        )}
      </div>

      {/* Horizontal Strip (80x80px thumbnails + hover controls + error fallback) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {images.map((img, idx) => {
          const isFailed = failedImageIds[img.id];
          return (
            <div
              key={img.id}
              className="relative w-[80px] h-[80px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none overflow-hidden group shrink-0 shadow-xs"
            >
              {isFailed ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                  <span className="material-symbols-outlined text-xl">photo_camera</span>
                  <span className="text-[9px] font-mono font-bold uppercase">Img {img.imageOrder}</span>
                </div>
              ) : (
                <img
                  src={img.imageUrl}
                  alt={`Photo ${img.imageOrder}`}
                  onError={() => setFailedImageIds((prev) => ({ ...prev, [img.id]: true }))}
                  className="w-full h-full object-cover object-center"
                />
              )}

              {/* Order Badge */}
              <span className="absolute top-1 left-1 bg-black/80 text-white font-mono text-[9px] px-1 font-bold rounded-xs pointer-events-none">
                {idx === 0 ? "Main" : `#${img.imageOrder}`}
              </span>

              {/* Hover Overlay Controls (Reorder & Delete) */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "left")}
                  className="w-6 h-6 bg-white/20 hover:bg-white/40 text-white font-bold text-xs rounded-none flex items-center justify-center disabled:opacity-20 cursor-pointer"
                  title="Move Left"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-none flex items-center justify-center cursor-pointer"
                  title="Delete"
                >
                  ✕
                </button>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, "right")}
                  className="w-6 h-6 bg-white/20 hover:bg-white/40 text-white font-bold text-xs rounded-none flex items-center justify-center disabled:opacity-20 cursor-pointer"
                  title="Move Right"
                >
                  →
                </button>
              </div>
            </div>
          );
        })}

        {/* 80x80px Square "+ Add Photo" CTA Button */}
        <button
          type="button"
          onClick={() => {
            setUploadError(null);
            setIsModalOpen(true);
          }}
          className="w-[80px] h-[80px] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg)] text-[var(--color-accent)] rounded-none flex flex-col items-center justify-center transition-colors cursor-pointer shrink-0"
          title="Add Photo"
        >
          <span className="material-symbols-outlined text-xl">add_a_photo</span>
          <span className="text-[10px] font-bold uppercase mt-0.5">+ PHOTO</span>
        </button>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[460px] text-[var(--color-text-primary)] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                UPLOAD PRODUCT IMAGE
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-none p-6 text-center space-y-3 bg-[var(--color-bg)] transition-colors">
              <span className="material-symbols-outlined text-3xl text-[var(--color-accent)]">
                cloud_upload
              </span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[var(--color-text-primary)]">
                  Drag & drop image file or browse
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                  Accepted: JPG, PNG, WebP • 2MB min to 5MB max
                </p>
              </div>

              <label className="inline-block px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors shadow-xs">
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
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-none text-[11px] text-red-500 font-bold">
                ⚠️ {uploadError}
              </div>
            )}

            <div className="flex justify-end border-t border-[var(--color-border)] pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none font-bold uppercase text-xs hover:bg-[var(--color-surface)] cursor-pointer"
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
