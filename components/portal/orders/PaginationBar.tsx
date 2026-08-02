"use client";

import React from "react";

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalOrders,
  limit,
  onPageChange,
}: PaginationBarProps) {
  if (totalOrders === 0 || totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalOrders);

  // Generate page numbers
  const pages: number[] = [];
  for (let p = 1; p <= totalPages; p++) {
    pages.push(p);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 font-sans select-none text-[13px] text-[var(--color-text-secondary)]">
      {/* Info text */}
      <div>
        Showing <span className="font-mono font-bold text-[var(--color-text-primary)]">{startItem}–{endItem}</span> of{" "}
        <span className="font-mono font-bold text-[var(--color-text-primary)]">{totalOrders}</span> orders
      </div>

      {/* Page Controls */}
      <div className="flex items-center gap-2 font-mono text-xs">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`px-3 py-1.5 border rounded-none cursor-pointer transition-colors ${
            currentPage <= 1
              ? "border-[var(--color-border)] text-[var(--color-text-secondary)]/40 cursor-not-allowed"
              : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
          }`}
          aria-label="Previous Page"
        >
          ←
        </button>

        {/* Page Numbers */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`px-3 py-1.5 font-bold border rounded-none cursor-pointer transition-colors ${
                isActive
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`px-3 py-1.5 border rounded-none cursor-pointer transition-colors ${
            currentPage >= totalPages
              ? "border-[var(--color-border)] text-[var(--color-text-secondary)]/40 cursor-not-allowed"
              : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
          }`}
          aria-label="Next Page"
        >
          →
        </button>
      </div>
    </div>
  );
}
