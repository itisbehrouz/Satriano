"use client";

import React, { useState, useEffect, useRef } from "react";

export interface SizeOption {
  id: string;
  label: string;
  sortOrder: number;
}

export interface SizeSystem {
  id: string;
  name: string;
  region: string;
  options: SizeOption[];
}

export interface SubcategoryWithSizeSystems {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  sizeSystems: Array<{ sizeSystem: SizeSystem }>;
}

interface RegionalSizeTreeProps {
  sizeSystems: SizeSystem[];
  subcategories: SubcategoryWithSizeSystems[];
  selectedSizeSystemId: string | null;
  onSelectSizeSystem: (sizeSystem: SizeSystem) => void;
}

export function RegionalSizeTree({
  sizeSystems,
  subcategories,
  selectedSizeSystemId,
  onSelectSizeSystem,
}: RegionalSizeTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
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

  // Multi-tier Client-Side Filtering
  const filteredSizeSystems = sizeSystems.filter((sys) => {
    if (!normalizedQuery) return true;

    const isNameMatch = sys.name.toLowerCase().includes(normalizedQuery);
    const isRegionMatch = sys.region.toLowerCase().includes(normalizedQuery);
    const isOptionMatch = sys.options.some((opt) =>
      opt.label.toLowerCase().includes(normalizedQuery)
    );

    // Check mapped subcategories
    const mappedSubcats = subcategories.filter((sub) =>
      sub.sizeSystems.some((ss) => ss.sizeSystem.id === sys.id)
    );
    const isSubcatMatch = mappedSubcats.some((sub) =>
      sub.name.toLowerCase().includes(normalizedQuery) ||
      sub.categoryName.toLowerCase().includes(normalizedQuery)
    );

    return isNameMatch || isRegionMatch || isOptionMatch || isSubcatMatch;
  });

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none overflow-hidden font-sans transition-colors">
      {/* Top Header / Bar */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-bg)]">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Regional CAD Size Systems &amp; Standards
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Manage regional CAD size matrices (Alpha, Waist, Chest) and assign them to product subcategories.
          </p>
        </div>

        {/* Active Search Bar Input (⌘K Enabled) */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-secondary)]">
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
            placeholder="Search size standards, regions, options... ⌘K"
            className="w-full pl-9 pr-14 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs px-1 font-bold cursor-pointer"
                title="Clear search filter"
              >
                ✕
              </button>
            ) : (
              <kbd className="px-1.5 py-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none text-[10px] font-mono text-[var(--color-text-secondary)] pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Size Systems Table View */}
      <div className="overflow-x-auto">
        {filteredSizeSystems.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-secondary)] space-y-2">
            <p className="font-semibold text-[var(--color-text-primary)]">No sizing standards match &quot;{searchQuery}&quot;</p>
            <p className="text-[var(--color-text-secondary)]">Try searching by region (EU, US), size name (Alpha, Waist), or size tag (M, 40R).</p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-2 inline-flex items-center px-3 py-1.5 bg-[var(--color-bg)] text-[var(--color-text-primary)] text-xs font-semibold rounded-none border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--color-bg)] text-[var(--color-text-primary)] font-semibold border-b border-[var(--color-border)] uppercase text-[11px]">
              <tr>
                <th className="py-3 px-5">Standard Name &amp; Region</th>
                <th className="py-3 px-5">Size Options Matrix</th>
                <th className="py-3 px-5">Assigned Subcategories</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-primary)]">
              {filteredSizeSystems.map((sys) => {
                const isSelected = sys.id === selectedSizeSystemId;
                const mappedSubcats = subcategories.filter((sub) =>
                  sub.sizeSystems.some((ss) => ss.sizeSystem.id === sys.id)
                );

                return (
                  <tr
                    key={sys.id}
                    onClick={() => onSelectSizeSystem(sys)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[var(--color-accent)]/10 border-l-4 border-l-[var(--color-accent)]"
                        : "hover:bg-[var(--color-bg)]/50"
                    }`}
                  >
                    {/* Standard Name & Region */}
                    <td className="py-4 px-5 align-top">
                      <div className="flex items-center gap-2">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />}
                        <span className="font-bold text-[var(--color-text-primary)] text-sm">{sys.name}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-none border border-[var(--color-accent)]/20">
                          {sys.region} Region
                        </span>
                      </div>
                    </td>

                    {/* Size Options Matrix Tags */}
                    <td className="py-4 px-5 align-top">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {sys.options.map((opt) => (
                          <span
                            key={opt.id}
                            className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-[11px] font-semibold px-2 py-0.5 rounded-none font-mono"
                          >
                            {opt.label}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Assigned Subcategories */}
                    <td className="py-4 px-5 align-top">
                      {mappedSubcats.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {mappedSubcats.map((sub) => (
                            <span
                              key={sub.id}
                              className="bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-[11px] font-medium px-2 py-0.5 rounded-none"
                            >
                              {sub.categoryName} &rarr; {sub.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-text-secondary)] italic">
                          No subcategories assigned
                        </span>
                      )}
                    </td>

                    {/* Action Trigger */}
                    <td className="py-4 px-5 text-right align-top">
                      <span
                        className={`text-xs font-semibold ${
                          isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                      >
                        {isSelected ? "Editing Mapping →" : "Edit Subcategories"}
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
