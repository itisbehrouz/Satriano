"use client";

import React, { useState, useEffect, useRef } from "react";

export interface FabricItem {
  id: string;
  productId: string | null;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  colorway?: string | null;
  priceMinCents: number;
  priceMaxCents: number;
  setupFeeCents: number;
  active: boolean;
  productName?: string;
  categoryName?: string;
  subcategoryName?: string;
}

interface FabricPricingTreeProps {
  fabrics: FabricItem[];
  selectedFabricId: string | null;
  onSelectFabric: (fabric: FabricItem) => void;
  onToggleActive: (fabricId: string, currentActive: boolean) => Promise<void>;
}

export function FabricPricingTree({
  fabrics,
  selectedFabricId,
  onSelectFabric,
  onToggleActive,
}: FabricPricingTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K keyboard listener to focus search input
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

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Multi-tier Client-Side Filtering (Name, Colorway, Price Range, Product/Category name)
  const filteredFabrics = fabrics.filter((fab) => {
    if (!normalizedQuery) return true;

    const isNameMatch = fab.name.toLowerCase().includes(normalizedQuery);
    const isColorwayMatch = fab.colorway?.toLowerCase().includes(normalizedQuery) ?? false;
    const isProductMatch = fab.productName?.toLowerCase().includes(normalizedQuery) ?? false;
    const isSubcategoryMatch = fab.subcategoryName?.toLowerCase().includes(normalizedQuery) ?? false;
    const isCategoryMatch = fab.categoryName?.toLowerCase().includes(normalizedQuery) ?? false;

    // Price query matching (e.g. searching "$45" or "45")
    const minDollar = (fab.priceMinCents / 100).toFixed(0);
    const maxDollar = (fab.priceMaxCents / 100).toFixed(0);
    const isPriceMatch = minDollar.includes(normalizedQuery) || maxDollar.includes(normalizedQuery);

    return (
      isNameMatch ||
      isColorwayMatch ||
      isProductMatch ||
      isSubcategoryMatch ||
      isCategoryMatch ||
      isPriceMatch
    );
  });

  const handleToggleClick = async (e: React.MouseEvent, fab: FabricItem) => {
    e.stopPropagation();
    setTogglingId(fab.id);
    try {
      await onToggleActive(fab.id, fab.active);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-white border border-[#D0D5DD] rounded-lg shadow-sm overflow-hidden font-sans">
      {/* Top Header / Bar */}
      <div className="p-4 sm:p-5 border-b border-[#EAECF0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div>
          <h2 className="text-base font-semibold text-[#101828]">
            Fabric Cost Tiering &amp; Setup Fee Configuration
          </h2>
          <p className="text-xs text-[#475467] mt-0.5">
            Configure volume price ranges, setup fee structures, and active availability for all catalog fabric lines.
          </p>
        </div>

        {/* Active Search Bar Input (⌘K Enabled) */}
        <div className="relative w-full sm:w-80">
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
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fabrics, colorways, prices, products... ⌘K"
            className="w-full pl-9 pr-14 py-2 bg-white border border-[#D0D5DD] rounded-md text-xs text-[#101828] placeholder-[#667085] focus:outline-none focus:ring-1 focus:ring-[#2E5AAC] focus:border-[#2E5AAC] transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[#667085] hover:text-[#101828] text-xs px-1 font-bold cursor-pointer"
                title="Clear search filter"
              >
                ✕
              </button>
            ) : (
              <kbd className="px-1.5 py-0.5 bg-[#F2F4F7] border border-[#D0D5DD] rounded text-[10px] font-mono text-[#667085] pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Fabric Table List */}
      <div className="overflow-x-auto">
        {filteredFabrics.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#667085] space-y-2">
            <p className="font-semibold text-[#101828]">No fabric lines match &quot;{searchQuery}&quot;</p>
            <p className="text-[#667085]">Try searching by fabric name (e.g. Egyptian Cotton), colorway, or product title.</p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-2 inline-flex items-center px-3 py-1.5 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] text-xs font-semibold rounded border border-[#D0D5DD] transition-colors cursor-pointer"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F9FAFB] text-[#475467] font-semibold border-b border-[#EAECF0]">
              <tr>
                <th className="py-3 px-5">Fabric Line &amp; Variant</th>
                <th className="py-3 px-5">Associated Product Spec</th>
                <th className="py-3 px-5">Unit Price Tiering</th>
                <th className="py-3 px-5">Setup Fee</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {filteredFabrics.map((fab) => {
                const isSelected = fab.id === selectedFabricId;
                const isToggling = togglingId === fab.id;

                return (
                  <tr
                    key={fab.id}
                    onClick={() => onSelectFabric(fab)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#F0F5FF] border-l-4 border-l-[#2E5AAC]"
                        : "bg-white hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {/* Fabric Line & Variant */}
                    <td className="py-4 px-5 align-top">
                      <div className="flex items-center gap-2">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#2E5AAC]" />}
                        <div>
                          <span className="font-bold text-[#101828] text-sm block">{fab.name}</span>
                          {fab.colorway && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#F2F4F7] text-[#344054] rounded border border-[#D0D5DD] inline-block mt-0.5">
                              {fab.colorway}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Associated Product Spec */}
                    <td className="py-4 px-5 align-top text-[#475467]">
                      {fab.productName ? (
                        <div>
                          <span className="font-semibold text-[#101828] block">{fab.productName}</span>
                          {fab.subcategoryName && (
                            <span className="text-[11px] text-[#667085] font-mono block">
                              {fab.categoryName} &rarr; {fab.subcategoryName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#98A2B3] italic">Global Fabric Option</span>
                      )}
                    </td>

                    {/* Unit Price Tiering */}
                    <td className="py-4 px-5 align-top font-mono">
                      <span className="font-bold text-[#101828]">
                        ${(fab.priceMinCents / 100).toFixed(2)} - ${(fab.priceMaxCents / 100).toFixed(2)}
                      </span>
                      <span className="text-[11px] text-[#667085] block font-sans">per unit</span>
                    </td>

                    {/* Setup Fee */}
                    <td className="py-4 px-5 align-top font-mono">
                      <span className="font-semibold text-[#101828]">
                        ${(fab.setupFeeCents / 100).toFixed(2)}
                      </span>
                    </td>

                    {/* Status Badge & Toggle */}
                    <td className="py-4 px-5 align-top text-center">
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={(e) => handleToggleClick(e, fab)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                          fab.active
                            ? "bg-[#ECFDF3] text-[#027A48] border-[#ABE5C6] hover:bg-[#D1FADF]"
                            : "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] hover:bg-[#FEE4E2]"
                        }`}
                        title={fab.active ? "Click to deactivate fabric" : "Click to activate fabric"}
                      >
                        {isToggling ? "..." : fab.active ? "Active" : "Off"}
                      </button>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right align-top">
                      <span
                        className={`text-xs font-semibold ${
                          isSelected ? "text-[#2E5AAC]" : "text-[#667085] hover:text-[#101828]"
                        }`}
                      >
                        {isSelected ? "Editing Tiering →" : "Edit Tiering & Fees"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
