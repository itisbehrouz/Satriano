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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 font-sans select-none text-[13px] text-[#8DA0C4]">
      {/* Info text */}
      <div>
        Showing <span className="font-mono font-bold text-[#E8ECF3]">{startItem}–{endItem}</span> of{" "}
        <span className="font-mono font-bold text-[#E8ECF3]">{totalOrders}</span> orders
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
              ? "border-[#1E3A8A] text-[#8DA0C4]/40 cursor-not-allowed"
              : "border-[#2E5AAC] text-[#8DA0C4] hover:text-[#E8ECF3] hover:bg-[#1A3A5C]"
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
                  ? "bg-[#2E5AAC] text-white border-[#2E5AAC]"
                  : "bg-[#132A52] border-[#1E3A8A] text-[#8DA0C4] hover:text-[#E8ECF3] hover:border-[#2E5AAC]"
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
              ? "border-[#1E3A8A] text-[#8DA0C4]/40 cursor-not-allowed"
              : "border-[#2E5AAC] text-[#8DA0C4] hover:text-[#E8ECF3] hover:bg-[#1A3A5C]"
          }`}
          aria-label="Next Page"
        >
          →
        </button>
      </div>
    </div>
  );
}
