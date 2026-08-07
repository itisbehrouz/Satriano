"use client";

import React, { useState, useEffect, useRef } from "react";

export interface FabricColorItem {
  id: string;
  fabricId: string;
  name: string;
  hex: string | null;
  source: "PLACEHOLDER" | "SUPPLIER_VERIFIED" | "MANUAL";
  active: boolean;
  sortOrder: number;
}

export interface FabricWithColors {
  id: string;
  productId: string;
  name: string;
  description?: string | null;
  colorway?: string | null;
  priceMinCents: number;
  priceMaxCents: number;
  setupFeeCents?: number;
  active: boolean;
  colors?: FabricColorItem[];
}

export interface ProductWithColors {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  active: boolean;
  fabrics: FabricWithColors[];
  [key: string]: unknown;
}

export interface SubcategoryWithColors {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  products: ProductWithColors[];
  [key: string]: unknown;
}

export interface CategoryWithColors {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  subcategories: SubcategoryWithColors[];
  [key: string]: unknown;
}

interface FabricColorTreeProps {
  categories: CategoryWithColors[];
  selectedFabricId: string | null;
  onSelectFabric: (
    fabric: FabricWithColors,
    productName: string,
    categoryName: string,
    subcategoryName: string
  ) => void;
}

export function FabricColorTree({
  categories,
  selectedFabricId,
  onSelectFabric,
}: FabricColorTreeProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const renderRatioBadge = (colors: FabricColorItem[] = []) => {
    const total = colors.length;
    if (total === 0) {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
          0 colors
        </span>
      );
    }

    const placeholderCount = colors.filter((c) => c.source === "PLACEHOLDER").length;
    const verifiedCount = colors.filter((c) => c.source === "SUPPLIER_VERIFIED" || c.source === "MANUAL").length;

    if (placeholderCount === total) {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30">
          {placeholderCount}/{total} placeholder
        </span>
      );
    } else if (verifiedCount === total) {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
          {total} verified
        </span>
      );
    } else {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/30">
          {verifiedCount}/{total} verified
        </span>
      );
    }
  };

  return (
    <div className="bg-[#F7F8FA] border border-[#EAECF0] rounded-md p-4 space-y-4">
      {/* Search Header */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter categories, products or fabrics... (⌘K)"
          className="w-full px-3 py-2 bg-white border border-[#EAECF0] rounded-md text-xs text-[#1A2233] placeholder:text-[#5B6B85] focus:outline-none focus:border-[#2E5AAC]"
        />
      </div>

      {/* Categories Tree */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const isCollapsed = Boolean(collapsedCategories[cat.id]);

          // Filter matching subcategories/products/fabrics
          const filteredSubcategories = cat.subcategories
            .map((sub) => {
              const filteredProducts = sub.products
                .map((prod) => {
                  const filteredFabrics = prod.fabrics.filter((fab) => {
                    if (!normalizedQuery) return true;
                    return (
                      fab.name.toLowerCase().includes(normalizedQuery) ||
                      prod.name.toLowerCase().includes(normalizedQuery) ||
                      sub.name.toLowerCase().includes(normalizedQuery) ||
                      cat.name.toLowerCase().includes(normalizedQuery)
                    );
                  });
                  return { ...prod, fabrics: filteredFabrics };
                })
                .filter((prod) => prod.fabrics.length > 0);
              return { ...sub, products: filteredProducts };
            })
            .filter((sub) => sub.products.length > 0);

          if (normalizedQuery && filteredSubcategories.length === 0) return null;

          return (
            <div
              key={cat.id}
              className="bg-white border border-[#EAECF0] rounded-md overflow-hidden"
            >
              {/* Category Header Bar */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-[#F9FAFB] hover:bg-[#F2F4F7] transition-colors border-b border-[#EAECF0] text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5B6B85]">
                    {isCollapsed && !normalizedQuery ? "▶" : "▼"}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1A2233]">
                    {cat.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#5B6B85]">
                  {cat.subcategories.reduce(
                    (acc, sub) => acc + sub.products.reduce((pAcc, p) => pAcc + p.fabrics.length, 0),
                    0
                  )}{" "}
                  fabrics
                </span>
              </button>

              {/* Category Body */}
              {(!isCollapsed || Boolean(normalizedQuery)) && (
                <div className="p-3 space-y-3">
                  {filteredSubcategories.map((sub) => (
                    <div key={sub.id} className="space-y-2 pl-2 border-l-2 border-[#EAECF0]">
                      <div className="text-[11px] font-bold text-[#5B6B85] uppercase tracking-wider">
                        {sub.name}
                      </div>

                      <div className="space-y-2">
                        {sub.products.map((prod) => (
                          <div key={prod.id} className="space-y-1 pl-2">
                            <div className="text-xs font-semibold text-[#1A2233]">
                              {prod.name}
                            </div>

                            <div className="space-y-1 pt-1">
                              {prod.fabrics.map((fab) => {
                                const isSelected = selectedFabricId === fab.id;
                                const colorCount = fab.colors?.length ?? 0;

                                return (
                                  <button
                                    key={fab.id}
                                    type="button"
                                    onClick={() =>
                                      onSelectFabric(fab, prod.name, cat.name, sub.name)
                                    }
                                    className={`w-full flex items-center justify-between p-2 rounded-md border text-left transition-colors ${
                                      isSelected
                                        ? "bg-[#2E5AAC]/10 border-[#2E5AAC] text-[#2E5AAC]"
                                        : "bg-white border-[#EAECF0] hover:border-[#D0D5DD] text-[#1A2233]"
                                    }`}
                                  >
                                    <div className="space-y-0.5">
                                      <div className="text-xs font-medium">{fab.name}</div>
                                      <div className="text-[10px] font-mono text-[#5B6B85]">
                                        ${(fab.priceMinCents / 100).toFixed(2)} - $
                                        {(fab.priceMaxCents / 100).toFixed(2)}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-mono font-bold text-[#1A2233]">
                                        {colorCount} colors
                                      </span>
                                      {renderRatioBadge(fab.colors)}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
