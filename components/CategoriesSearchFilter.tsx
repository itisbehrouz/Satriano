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
      <div className="bg-white border border-[#E2E8F0] rounded-none p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search product lines (e.g. Shirts, Blazers)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-none text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0369A1] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#0F172A]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-[#64748B] font-medium">
            Showing <strong className="text-[#0F172A]">{filteredCategories.length}</strong> categories
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#E2E8F0] pt-4">
          <button
            onClick={() => setActiveCategorySlug("all")}
            className={`px-4 py-2 rounded-none text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeCategorySlug === "all"
                ? "bg-[#2E5AAC] text-white shadow-md shadow-[#2E5AAC]/20"
                : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] border border-[#CBD5E1]"
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
                  ? "bg-[#2E5AAC] text-white shadow-md shadow-[#2E5AAC]/20"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] border border-[#CBD5E1]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* No Results Fallback */}
      {filteredCategories.length === 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-none p-12 text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-[#94A3B8]">search_off</span>
          <h3 className="text-base font-bold text-[#0F172A]">No product lines found matching &quot;{searchQuery}&quot;</h3>
          <p className="text-xs text-[#64748B]">Try searching for a different keyword or reset filters.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategorySlug("all");
            }}
            className="px-4 py-2 bg-[#0369A1] text-white text-xs font-semibold rounded-none hover:bg-[#0284C7] transition-colors"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#0F172A] pb-4 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
                    {cat.name}
                  </h2>
                  <span className="bg-[#E0F2FE] text-[#0369A1] text-xs font-semibold px-3 py-1 rounded-none font-mono">
                    {cat.subcategories.length} Lines
                  </span>
                </div>
                <p className="text-xs md:text-sm text-[#475569] mt-1 font-normal">
                  {cat.description || "European B2B garment manufacturing subcategories."}
                </p>
              </div>

              <Link
                href={`/categories/${cat.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0369A1] hover:text-[#0284C7] uppercase tracking-wider group whitespace-nowrap"
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
                    className="bg-white border border-[#E2E8F0] hover:border-[#0F172A] rounded-none overflow-hidden flex flex-col justify-between transition-all shadow-sm hover:shadow-lg group"
                  >
                    <div>
                      {/* Image Thumbnail Box */}
                      <div className="aspect-[16/10] w-full relative overflow-hidden bg-[#0F172A]">
                        <Image
                          src={coverImg}
                          alt={sub.name}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                          <span className="bg-[#0B1E3D]/90 text-white text-[11px] font-mono font-medium px-2.5 py-1 rounded-none backdrop-blur-sm border border-white/10">
                            MOQ {sub.moq ?? 50} Units
                          </span>
                          <span className="bg-emerald-500/90 text-white text-[11px] font-mono font-medium px-2.5 py-1 rounded-none backdrop-blur-sm">
                            {sub.leadTimeDays ?? 14}d Lead
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-6 space-y-3">
                        <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#0369A1] transition-colors">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
                          {sub.description || "Precision white-label bespoke garment production line."}
                        </p>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-6 pt-0">
                      <Link
                        href={`/konfigurator/${sub.slug}`}
                        className="w-full bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-none transition-all inline-flex items-center justify-center gap-2 shadow-md shadow-[#2E5AAC]/20"
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
