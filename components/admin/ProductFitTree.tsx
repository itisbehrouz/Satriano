"use client";

import React, { useState } from "react";

export interface FitDef {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Fabric {
  id: string;
  name: string;
  priceMinCents: number;
  priceMaxCents: number;
  setupFeeCents: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  leadTimeDays?: number;
  moq?: number;
  moqPerFabric?: number;
  moqCombinedMultiFabric?: number | null;
  active: boolean;
  fabrics: Fabric[];
  fits: Array<{ fit: FitDef }>;
  updatedAt?: string | Date;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  products: Product[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  subcategories: Subcategory[];
}

interface ProductFitTreeProps {
  categories: Category[];
  totalFitsCount?: number;
  selectedProductId: string | null;
  onSelectProduct: (product: Product, categoryName: string, subcategoryName: string) => void;
}

export function ProductFitTree({
  categories,
  totalFitsCount = 8,
  selectedProductId,
  onSelectProduct,
}: ProductFitTreeProps) {
  // Accordion open state per category (default: all expanded)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const getBadgeStyle = (linkedCount: number, total: number) => {
    if (linkedCount === total && total > 0) {
      return "bg-[#F2F4F7] text-[#344054] border-[#D0D5DD]";
    } else if (linkedCount > 0) {
      return "bg-[#FEF0C7] text-[#DC6803] border-[#FDE272]";
    } else {
      return "bg-[#FEE4E2] text-[#D92D20] border-[#FECDCA]";
    }
  };

  return (
    <div className="bg-white border border-[#D0D5DD] rounded-lg shadow-sm overflow-hidden font-sans">
      {/* Top Header / Bar */}
      <div className="p-4 sm:p-5 border-b border-[#EAECF0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div>
          <h2 className="text-base font-semibold text-[#101828]">
            Garment Fits Catalog &amp; Product Mapping
          </h2>
          <p className="text-xs text-[#475467] mt-0.5">
            Manage fit availability per product. Click any product to edit allowed fit options.
          </p>
        </div>

        {/* Visual Search Bar Placeholder (Search... ⌘K) */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search... ⌘K"
            className="w-full pl-9 pr-12 py-1.5 bg-white border border-[#D0D5DD] rounded-md text-xs text-[#101828] placeholder-[#667085] focus:outline-none focus:ring-1 focus:ring-[#2E5AAC] focus:border-[#2E5AAC] transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[10px] font-medium text-[#98A2B3]">
            <kbd className="px-1.5 py-0.5 bg-[#F2F4F7] border border-[#D0D5DD] rounded text-[#667085]">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Accordion Tree List */}
      <div className="divide-y divide-[#EAECF0]">
        {categories.map((cat) => {
          const isCollapsed = collapsedCategories[cat.id];
          const filteredSubcategories = cat.subcategories.map((sub) => ({
            ...sub,
            products: sub.products.filter((p) =>
              searchQuery
                ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sub.name.toLowerCase().includes(searchQuery.toLowerCase())
                : true
            ),
          })).filter((sub) => (searchQuery ? sub.products.length > 0 : true));

          if (searchQuery && filteredSubcategories.length === 0) return null;

          return (
            <div key={cat.id} className="bg-white">
              {/* Category Accordion Header */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#F9FAFB] hover:bg-[#F2F4F7] transition-colors text-left border-b border-[#EAECF0]"
              >
                <div className="flex items-center gap-2.5">
                  <svg
                    className={`w-4 h-4 text-[#667085] transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#344054]">
                    Category: {cat.name}
                  </span>
                  <span className="text-[11px] font-medium text-[#667085] bg-[#EAECF0] px-2 py-0.5 rounded-full">
                    {cat.subcategories.length} subcategories
                  </span>
                </div>
              </button>

              {/* Subcategories & Products */}
              {!isCollapsed && (
                <div className="divide-y divide-[#EAECF0]">
                  {filteredSubcategories.map((sub) => (
                    <div key={sub.id} className="p-4 sm:p-5 bg-white space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#475467]">
                          Subcategory:
                        </span>
                        <span className="text-xs font-bold text-[#101828] bg-[#F2F4F7] px-2 py-0.5 rounded">
                          {sub.name}
                        </span>
                      </div>

                      {/* Products Table */}
                      <div className="overflow-x-auto border border-[#EAECF0] rounded-md">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F9FAFB] text-[#475467] font-semibold border-b border-[#EAECF0]">
                            <tr>
                              <th className="py-2.5 px-4">Product Name</th>
                              <th className="py-2.5 px-4">Category</th>
                              <th className="py-2.5 px-4">Subcategory</th>
                              <th className="py-2.5 px-4 text-center">Linked Fits</th>
                              <th className="py-2.5 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EAECF0]">
                            {sub.products.map((prod) => {
                              const isSelected = prod.id === selectedProductId;
                              const linkedFitCount = prod.fits.length;

                              return (
                                <tr
                                  key={prod.id}
                                  onClick={() => onSelectProduct(prod, cat.name, sub.name)}
                                  className={`cursor-pointer transition-colors ${
                                    isSelected
                                      ? "bg-[#F0F5FF] border-l-4 border-l-[#2E5AAC]"
                                      : "bg-white hover:bg-[#F9FAFB]"
                                  }`}
                                >
                                  <td className="py-3 px-4 font-semibold text-[#101828]">
                                    <div className="flex items-center gap-2">
                                      {isSelected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E5AAC]" />
                                      )}
                                      {prod.name}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-[#475467]">{cat.name}</td>
                                  <td className="py-3 px-4 text-[#475467]">{sub.name}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeStyle(
                                        linkedFitCount,
                                        totalFitsCount
                                      )}`}
                                    >
                                      {linkedFitCount}/{totalFitsCount} linked
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <span
                                      className={`text-xs font-semibold ${
                                        isSelected ? "text-[#2E5AAC]" : "text-[#667085] hover:text-[#101828]"
                                      }`}
                                    >
                                      {isSelected ? "Editing →" : "Edit Fits"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
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
