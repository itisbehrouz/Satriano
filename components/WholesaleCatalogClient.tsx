"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCents } from "@/lib/formatCurrency";

interface Fit {
  id: string;
  name: string;
  code: string;
}

interface Fabric {
  id: string;
  name: string;
  priceMinCents: number;
  priceMaxCents: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category: Category;
}

interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  moqPerFabric: number;
  leadTimeDays: number | null;
  subcategory: Subcategory;
  fits: { fit: Fit }[];
  fabrics: Fabric[];
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

export function WholesaleCatalogClient({
  products,
  categories,
  fits,
}: {
  products: ProductWithRelations[];
  categories: Category[];
  fits: Fit[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [maxMoqFilter, setMaxMoqFilter] = useState<number | "all">("all");
  const [priceTier, setPriceTier] = useState<"all" | "under20" | "20to40" | "40to70" | "70plus">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name-asc" | "moq-asc">("featured");

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const toggleFit = (fitCode: string) => {
    setSelectedFits((prev) =>
      prev.includes(fitCode) ? prev.filter((f) => f !== fitCode) : [...prev, fitCode]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedFits([]);
    setMaxMoqFilter("all");
    setPriceTier("all");
    setSortBy("featured");
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = prod.name.toLowerCase().includes(q);
          const matchDesc = prod.description?.toLowerCase().includes(q) || false;
          const matchSub = prod.subcategory.name.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSub) return false;
        }

        if (selectedCategories.length > 0) {
          if (!selectedCategories.includes(prod.subcategory.category.slug)) {
            return false;
          }
        }

        if (selectedFits.length > 0) {
          const productFitCodes = prod.fits.map((f) => f.fit.code);
          const hasFitMatch = selectedFits.some((code) => productFitCodes.includes(code));
          if (!hasFitMatch) return false;
        }

        if (maxMoqFilter !== "all") {
          if (prod.moqPerFabric > maxMoqFilter) return false;
        }

        if (priceTier !== "all" && prod.fabrics.length > 0) {
          const minCents = Math.min(...prod.fabrics.map((f) => f.priceMinCents));
          const minDollars = minCents / 100;
          if (priceTier === "under20" && minDollars >= 20) return false;
          if (priceTier === "20to40" && (minDollars < 20 || minDollars > 40)) return false;
          if (priceTier === "40to70" && (minDollars < 40 || minDollars > 70)) return false;
          if (priceTier === "70plus" && minDollars < 70) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          const minA = a.fabrics.length > 0 ? Math.min(...a.fabrics.map((f) => f.priceMinCents)) : 0;
          const minB = b.fabrics.length > 0 ? Math.min(...b.fabrics.map((f) => f.priceMinCents)) : 0;
          return minA - minB;
        }
        if (sortBy === "price-desc") {
          const minA = a.fabrics.length > 0 ? Math.min(...a.fabrics.map((f) => f.priceMinCents)) : 0;
          const minB = b.fabrics.length > 0 ? Math.min(...b.fabrics.map((f) => f.priceMinCents)) : 0;
          return minB - minA;
        }
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "moq-asc") {
          return a.moqPerFabric - b.moqPerFabric;
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategories, selectedFits, maxMoqFilter, priceTier, sortBy]);

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.length +
    selectedFits.length +
    (maxMoqFilter !== "all" ? 1 : 0) +
    (priceTier !== "all" ? 1 : 0);

  return (
    <div className="w-full font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR: FILTERS PANEL */}
        <aside className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-none p-6 shadow-sm space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0369A1]">filter_list</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                Menswear Filters
              </h2>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-none bg-[#0369A1] text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-[#0369A1] hover:text-[#0284C7] underline cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          {/* 1. Keyword Search */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Search Products
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search shirts, trousers, suits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-none text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0369A1]"
              />
            </div>
          </div>

          {/* 2. Category Filter */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Categories ({categories.length})
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.slug);
                return (
                  <label
                    key={cat.id}
                    className="flex items-center justify-between text-xs text-[#334155] hover:text-[#0F172A] cursor-pointer p-1.5 rounded-none hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(cat.slug)}
                        className="w-4 h-4 accent-[#0369A1] rounded-none cursor-pointer"
                      />
                      <span className={isSelected ? "font-bold text-[#0F172A]" : ""}>{cat.name}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Fit Filter */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Fit &amp; Cut Options ({fits.length})
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {fits.map((fit) => {
                const isSelected = selectedFits.includes(fit.code);
                return (
                  <button
                    key={fit.id}
                    onClick={() => toggleFit(fit.code)}
                    className={`px-3 py-1.5 rounded-none text-xs font-medium text-left border transition-all ${
                      isSelected
                        ? "bg-[#2E5AAC] text-white border-[#2E5AAC] shadow-sm font-semibold"
                        : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    {fit.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Price Tier Filter */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Wholesale Price Range
            </label>
            <div className="space-y-1.5 text-xs text-[#334155]">
              {[
                { id: "all", label: "All Wholesale Prices" },
                { id: "under20", label: "Under $20.00 / unit" },
                { id: "20to40", label: "$20.00 – $40.00 / unit" },
                { id: "40to70", label: "$40.00 – $70.00 / unit" },
                { id: "70plus", label: "$70.00+ / unit" },
              ].map((tier) => (
                <label
                  key={tier.id}
                  className="flex items-center gap-2 cursor-pointer p-1.5 rounded-none hover:bg-[#F8FAFC] transition-colors"
                >
                  <input
                    type="radio"
                    name="priceTier"
                    checked={priceTier === tier.id}
                    onChange={() => setPriceTier(tier.id as any)}
                    className="w-4 h-4 accent-[#0369A1] cursor-pointer"
                  />
                  <span>{tier.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. Minimum Order Quantity (MOQ) Filter */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              MOQ Threshold
            </label>
            <div className="flex gap-2">
              {[
                { label: "All MOQs", val: "all" },
                { label: "≤ 50 pcs", val: 50 },
                { label: "≤ 100 pcs", val: 100 },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => setMaxMoqFilter(m.val as any)}
                  className={`flex-1 py-1.5 px-2 rounded-none text-xs font-medium border text-center transition-all ${
                    maxMoqFilter === m.val
                      ? "bg-[#0369A1] text-white border-[#0369A1] font-semibold"
                      : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA: PRODUCT LISTING */}
        <main className="lg:col-span-8 space-y-6">
          {/* Top Bar: Count + Sort Dropdown */}
          <div className="bg-white border border-[#E2E8F0] rounded-none p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#475569]">
              Showing <strong className="text-[#0F172A] font-mono text-sm">{filteredProducts.length}</strong> of {products.length} wholesale products
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#64748B] uppercase font-semibold text-[11px]">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-none px-3 py-1.5 text-xs text-[#0F172A] font-semibold focus:outline-none focus:border-[#0369A1] cursor-pointer"
              >
                <option value="featured">Featured / Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="moq-asc">MOQ: Lowest First</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-white border border-[#E2E8F0] p-3 rounded-none text-xs">
              <span className="text-[#64748B] font-semibold text-[11px] uppercase mr-1">Active:</span>
              {searchQuery && (
                <span className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-none flex items-center gap-1 font-medium">
                  Keyword: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery("")} className="hover:text-red-500 font-bold ml-1">✕</button>
                </span>
              )}
              {selectedCategories.map((c) => (
                <span key={c} className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-none flex items-center gap-1 font-medium capitalize">
                  {c}
                  <button onClick={() => toggleCategory(c)} className="hover:text-red-500 font-bold ml-1">✕</button>
                </span>
              ))}
              {selectedFits.map((f) => (
                <span key={f} className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-none flex items-center gap-1 font-medium">
                  Fit: {f}
                  <button onClick={() => toggleFit(f)} className="hover:text-red-500 font-bold ml-1">✕</button>
                </span>
              ))}
              {priceTier !== "all" && (
                <span className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-none flex items-center gap-1 font-medium">
                  Price: {priceTier}
                  <button onClick={() => setPriceTier("all")} className="hover:text-red-500 font-bold ml-1">✕</button>
                </span>
              )}
            </div>
          )}

          {/* No Products Found */}
          {filteredProducts.length === 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-none p-12 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-[#94A3B8]">inventory_2</span>
              <h3 className="text-base font-bold text-[#0F172A]">No menswear products match your current filters</h3>
              <p className="text-xs text-[#64748B]">Try expanding your price range or resetting selected fits.</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[#0369A1] text-white text-xs font-semibold rounded-none hover:bg-[#0284C7] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const coverImg =
                product.imageUrl ||
                CATEGORY_IMAGES[product.subcategory.category.slug] ||
                "/images/catalog/tops.png";

              const minPrice =
                product.fabrics.length > 0
                  ? Math.min(...product.fabrics.map((f) => f.priceMinCents))
                  : 1800;
              const maxPrice =
                product.fabrics.length > 0
                  ? Math.max(...product.fabrics.map((f) => f.priceMaxCents))
                  : 3200;

              return (
                <Link
                  key={product.id}
                  href={`/konfigurator/${product.slug}`}
                  className="bg-white border border-[#E2E8F0] hover:border-[#0F172A] rounded-none overflow-hidden flex flex-col justify-between transition-all shadow-sm hover:shadow-lg group"
                >
                  <div>
                    {/* Image Header */}
                    <div className="aspect-[4/3] w-full relative overflow-hidden bg-[#0F172A]">
                      <Image
                        src={coverImg}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                        <span className="bg-[#0B1E3D]/90 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-none backdrop-blur-sm border border-white/10">
                          MOQ {product.moqPerFabric} Pcs
                        </span>
                        <span className="bg-emerald-500/90 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-none backdrop-blur-sm">
                          {product.leadTimeDays ?? 14}d Delivery
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-3">
                      {/* Subcategory & Category Badge */}
                      <div className="text-[11px] font-semibold text-[#0369A1] uppercase tracking-wider">
                        {product.subcategory.category.name} • {product.subcategory.name}
                      </div>

                      {/* Product Title */}
                      <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#0369A1] transition-colors leading-snug">
                        {product.name}
                      </h3>

                      {/* Fit Badges */}
                      {product.fits.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {product.fits.slice(0, 3).map((f) => (
                            <span
                              key={f.fit.id}
                              className="text-[10px] px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] rounded-none font-medium"
                            >
                              {f.fit.name}
                            </span>
                          ))}
                          {product.fits.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-[#64748B]">
                              +{product.fits.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price Range Display */}
                      <div className="pt-2 border-t border-[#E2E8F0] flex justify-between items-end">
                        <div>
                          <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Wholesale Price</span>
                          <span className="text-sm font-bold font-mono text-[#0F172A]">
                            {formatCents(minPrice)} – {formatCents(maxPrice)}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#0369A1] group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
