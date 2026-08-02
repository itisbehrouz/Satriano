"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  moq: number | null;
  leadTimeDays: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  subcategories: Subcategory[];
}

const CATEGORY_IMAGES: Record<string, string> = {
  tops: "/images/catalog/tops.png",
  bottoms: "/images/catalog/bottoms.png",
  "formal-wear": "/images/catalog/formal_wear.png",
  outerwear: "/images/catalog/outerwear.png",
  sportswear: "/images/catalog/sportswear.png",
  "underwear-loungewear": "/images/catalog/loungewear.png",
  accessories: "/images/catalog/accessories.png",
};

export function CategoriesSearchFilter({ categories }: { categories: Category[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");

  const filteredCategories = categories
    .map((cat) => {
      const isCategoryMatch = activeCategorySlug === "all" || cat.slug === activeCategorySlug;
      if (!isCategoryMatch) return null;

      const matchingSubcategories = cat.subcategories.filter((sub) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          sub.name.toLowerCase().includes(q) ||
          (sub.description && sub.description.toLowerCase().includes(q))
        );
      });

      if (matchingSubcategories.length === 0 && searchQuery.trim()) return null;

      return {
        ...cat,
        subcategories: matchingSubcategories,
      };
    })
    .filter(Boolean) as Category[];

  return (
    <div className="space-y-10 font-sans">
      {/* Interactive Controls Bar: Category Filter Pills + Live Search */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search product lines (e.g. Shirts, Blazers)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-[var(--color-text-secondary)] font-medium">
            Showing <strong className="text-[var(--color-text-primary)]">{filteredCategories.length}</strong> categories
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[var(--color-border)] pt-4">
          <button
            onClick={() => setActiveCategorySlug("all")}
            className={`px-4 py-2 rounded-none text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeCategorySlug === "all"
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategorySlug(cat.slug)}
              className={`px-4 py-2 rounded-none text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeCategorySlug === cat.slug
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* No Results Fallback */}
      {filteredCategories.length === 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-12 text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-[var(--color-text-secondary)]">search_off</span>
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">No product lines found matching &quot;{searchQuery}&quot;</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">Try searching for a different keyword or reset filters.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategorySlug("all");
            }}
            className="px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-semibold rounded-none hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Reset Catalog Filters
          </button>
        </div>
      )}

      {/* Category Sections */}
      <div className="space-y-16">
        {filteredCategories.map((cat) => (
          <section key={cat.id} id={cat.slug} className="scroll-mt-28 space-y-6">
            {/* Category Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                    {cat.name}
                  </h2>
                  <span className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-semibold px-3 py-1 rounded-none font-mono border border-[var(--color-accent)]/20">
                    {cat.subcategories.length} Lines
                  </span>
                </div>
                <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-1 font-normal">
                  {cat.description || "European B2B garment manufacturing subcategories."}
                </p>
              </div>

              <Link
                href={`/categories/${cat.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline uppercase tracking-wider group whitespace-nowrap"
              >
                <span>View Category Details</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Subcategory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cat.subcategories.map((sub) => {
                const coverImg =
                  sub.imageUrl || cat.imageUrl || CATEGORY_IMAGES[cat.slug] || "/images/catalog/tops.png";

                return (
                  <div
                    key={sub.id}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-none overflow-hidden flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Image Thumbnail Box (Crisp & Un-faded) */}
                      <div className="aspect-[16/10] w-full relative overflow-hidden bg-[var(--color-bg)]">
                        <Image
                          src={coverImg}
                          alt={sub.name}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                          <span className="bg-[var(--color-bg)]/90 text-[var(--color-text-primary)] text-[11px] font-mono font-medium px-2.5 py-1 rounded-none backdrop-blur-sm border border-[var(--color-border)]">
                            MOQ {sub.moq ?? 50} Units
                          </span>
                          <span className="bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] text-[11px] font-mono font-medium px-2.5 py-1 rounded-none border border-[var(--color-status-success)]/30">
                            {sub.leadTimeDays ?? 14}d Lead
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-6 space-y-3">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                          {sub.description || "Precision white-label bespoke garment production line."}
                        </p>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-6 pt-0">
                      <Link
                        href={`/konfigurator/${sub.slug}`}
                        className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-none transition-all inline-flex items-center justify-center gap-2"
                      >
                        <span>Configure {sub.name} Spec</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
