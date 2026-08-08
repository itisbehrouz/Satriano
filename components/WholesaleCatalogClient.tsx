"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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

// Ready-made Stock Catalog Items processed with fixed pricing, stock, SKUs, and fabric lines
interface ReadyStockProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string;
  categoryName: string;
  categorySlug: string;
  fabricLine: string;
  priceUSD: number;
  formattedPrice: string;
  stockCount: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export function WholesaleCatalogClient({
  products,
  categories,
  fits: _fits,
}: {
  products: ProductWithRelations[];
  categories: Category[];
  fits: Fit[];
}) {
  // 1. Process items into Ready-Made Wholesale Products with fixed pricing & stock
  const readyStockItems = useMemo<ReadyStockProduct[]>(() => {
    return products.map((prod, idx) => {
      // Deterministic SKU generation (CY-... for formal/outer/tops, CD-... for bottoms/sport/loungewear/acc)
      const catSlug = prod.subcategory?.category?.slug || "tops";
      const isCY = catSlug === "formal-wear" || catSlug === "outerwear" || catSlug === "tops";
      const skuCode = (idx * 47 + 104) % 899 + 100;
      const sku = isCY ? `CY-${skuCode}` : `CD-${skuCode}`;

      // Image selection
      const coverImg =
        prod.imageUrl ||
        CATEGORY_IMAGES[catSlug] ||
        "/images/catalog/tops.png";

      // Fabric Line
      const fabricLine = prod.fabrics?.[0]?.name || "Standard Cotton Blend";

      // Price USD (Fixed pricing for ready-made wholesale stock)
      // Map minCents or price points to realistic ready-made prices e.g. $89.50, $125.00, $145.00, $110.00
      const rawCents = prod.fabrics?.[0]?.priceMinCents || 12500;
      const rawDollars = rawCents / 100;
      const priceUSD = Math.max(10, Math.min(500, Math.round(rawDollars * 10) / 10));
      const formattedPrice = `$${priceUSD.toFixed(2)}`;

      // Stock levels: 75% In Stock, 20% Low Stock, 5% Out of Stock
      const stockPattern = [140, 45, 8, 220, 18, 5, 85, 320, 12, 95, 0, 175, 40, 9, 130, 60, 14, 210, 0, 80];
      const stockCount = stockPattern[idx % stockPattern.length];
      
      let stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" = "IN_STOCK";
      if (stockCount === 0) {
        stockStatus = "OUT_OF_STOCK";
      } else if (stockCount < 20) {
        stockStatus = "LOW_STOCK";
      }

      return {
        id: prod.id,
        sku,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        imageUrl: coverImg,
        categoryName: prod.subcategory?.category?.name || "Menswear",
        categorySlug: catSlug,
        fabricLine,
        priceUSD,
        formattedPrice,
        stockCount,
        stockStatus,
      };
    });
  }, [products]);

  // Extract all distinct fabric lines for the sidebar filter
  const allFabricLines = useMemo(() => {
    const set = new Set<string>();
    readyStockItems.forEach((item) => set.add(item.fabricLine));
    return Array.from(set).sort();
  }, [readyStockItems]);

  // Filter & Layout state management
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFabricLines, setSelectedFabricLines] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Sorting & Layout View Mode state ("list" | "grid-2" | "grid-3" | "grid-4")
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name-asc" | "stock-desc">("default");
  const [viewMode, setViewMode] = useState<"list" | "grid-2" | "grid-3" | "grid-4">("grid-4");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // Detect responsive screen size for pagination: 12 (desktop), 8 (tablet), 4 (mobile)
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setItemsPerPage(4);
      } else if (w < 1024) {
        setItemsPerPage(8);
      } else {
        setItemsPerPage(12);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Category toggle handler
  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
    setCurrentPage(1);
  };

  // Fabric Line toggle handler
  const toggleFabricLine = (fabric: string) => {
    setSelectedFabricLines((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedFabricLines([]);
    setSelectedGender(null);
    setSelectedAgeGroup(null);
    setMaxPrice(500);
    setInStockOnly(false);
    setSortBy("default");
    setCurrentPage(1);
  };

  // Filtered and Sorted Products computation
  const filteredProducts = useMemo(() => {
    const result = readyStockItems.filter((item) => {
      // Category filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(item.categorySlug)) {
          return false;
        }
      }

      // Fabric Line filter
      if (selectedFabricLines.length > 0) {
        if (!selectedFabricLines.includes(item.fabricLine)) {
          return false;
        }
      }

      // Price Range filter ($10 - maxPrice)
      if (item.priceUSD > maxPrice) {
        return false;
      }

      // In Stock Only toggle
      if (inStockOnly) {
        if (item.stockCount === 0 || item.stockStatus === "OUT_OF_STOCK") {
          return false;
        }
      }

      return true;
    });

    // Apply Sorting
    return result.sort((a, b) => {
      if (sortBy === "price-asc") {
        return a.priceUSD - b.priceUSD;
      }
      if (sortBy === "price-desc") {
        return b.priceUSD - a.priceUSD;
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "stock-desc") {
        return b.stockCount - a.stockCount;
      }
      return 0;
    });
  }, [readyStockItems, selectedCategories, selectedFabricLines, maxPrice, inStockOnly, sortBy]);

  // Paginated slices
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const activeFilterCount =
    selectedCategories.length +
    selectedFabricLines.length +
    (selectedGender ? 1 : 0) +
    (selectedAgeGroup ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  return (
    <div className="w-full font-sans antialiased text-[var(--color-text-primary)]">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT SIDEBAR — FILTERS (STICKY) */}
        <aside className="w-full lg:w-[280px] shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-5 lg:sticky lg:top-24 space-y-6 transition-colors">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              FILTER BY:
            </h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[var(--color-accent)] hover:underline font-medium min-h-[44px] flex items-center px-1"
              >
                Reset All
              </button>
            )}
          </div>

          {/* 1. Category (checkboxes) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Category
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isChecked = selectedCategories.includes(cat.slug);
                return (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2.5 text-xs text-[var(--color-text-primary)] cursor-pointer hover:text-[var(--color-accent)] transition-colors min-h-[36px]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat.slug)}
                      className="w-4 h-4 accent-[var(--color-accent)] rounded-none cursor-pointer"
                    />
                    <span className={isChecked ? "font-semibold text-[var(--color-accent)]" : "font-normal text-[var(--color-text-secondary)]"}>
                      {cat.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Fabric Line (checkboxes) */}
          <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Fabric Line
            </h3>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {allFabricLines.map((fabric) => {
                const isChecked = selectedFabricLines.includes(fabric);
                return (
                  <label
                    key={fabric}
                    className="flex items-center gap-2.5 text-xs text-[var(--color-text-primary)] cursor-pointer hover:text-[var(--color-accent)] transition-colors min-h-[36px]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleFabricLine(fabric)}
                      className="w-4 h-4 accent-[var(--color-accent)] rounded-none cursor-pointer"
                    />
                    <span className={`line-clamp-1 ${isChecked ? "font-semibold text-[var(--color-accent)]" : "font-normal text-[var(--color-text-secondary)]"}`}>
                      {fabric}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Price Range (slider) */}
          <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Price Range
              </h3>
              <span className="text-xs font-mono font-bold text-[var(--color-accent)] tabular-nums">
                $10 — ${maxPrice}
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-[var(--color-accent)] cursor-pointer h-2 bg-[var(--color-border)] rounded-none"
              />
              <div className="flex justify-between text-[11px] font-mono text-[var(--color-text-secondary)]">
                <span>$10</span>
                <span>$500</span>
              </div>
            </div>
          </div>

          {/* 4. In Stock Only [toggle] */}
          <div className="border-t border-[var(--color-border)] pt-4">
            <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                In Stock Only
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={inStockOnly}
                onClick={() => {
                  setInStockOnly(!inStockOnly);
                  setCurrentPage(1);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  inStockOnly ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-none bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    inStockOnly ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          </div>

        </aside>

        {/* RIGHT CONTENT — PRODUCT GRID & TOOLBAR */}
        <main className="flex-1 w-full space-y-6">
          
          {/* Active Toolbar & View Mode Controls */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
            
            {/* Left: Count */}
            <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
              <span>Showing <strong className="text-[var(--color-text-primary)] font-mono text-sm">{filteredProducts.length}</strong> ready-made stock garments</span>
              {activeFilterCount > 0 && (
                <span className="text-[11px] font-bold uppercase text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 border border-[var(--color-accent)]/20">
                  {activeFilterCount} Active {activeFilterCount === 1 ? "Filter" : "Filters"}
                </span>
              )}
            </div>

            {/* Right: Sort & Layout Controls */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="wholesale-sort-by" className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] whitespace-nowrap">
                  Sort By:
                </label>
                <select
                  id="wholesale-sort-by"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as typeof sortBy);
                    setCurrentPage(1);
                  }}
                  className="bg-[var(--color-bg)] text-[var(--color-text-primary)] text-xs font-medium border border-[var(--color-border)] rounded-none px-3 py-1.5 focus:outline-none focus:border-[var(--color-accent)] cursor-pointer min-h-[36px]"
                >
                  <option value="default">Default Order</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                  <option value="stock-desc">Stock: High to Low</option>
                </select>
              </div>

              {/* Divider */}
              <div className="h-4 w-px bg-[var(--color-border)] hidden sm:block" />

              {/* View Layout Controls (List, 2, 3, 4) */}
              <div className="flex items-center gap-1 bg-[var(--color-bg)] border border-[var(--color-border)] p-0.5">
                <span className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)] px-2">
                  View:
                </span>

                {/* List View Toggle */}
                <button
                  type="button"
                  title="List View"
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1 text-xs font-bold uppercase rounded-none transition-colors flex items-center gap-1 ${
                    viewMode === "list"
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm leading-none">view_list</span>
                  <span className="hidden sm:inline">List</span>
                </button>

                {/* Grid 2 Toggle */}
                <button
                  type="button"
                  title="2 Columns"
                  onClick={() => setViewMode("grid-2")}
                  className={`px-2.5 py-1 text-xs font-bold font-mono rounded-none transition-colors ${
                    viewMode === "grid-2"
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  2
                </button>

                {/* Grid 3 Toggle */}
                <button
                  type="button"
                  title="3 Columns"
                  onClick={() => setViewMode("grid-3")}
                  className={`px-2.5 py-1 text-xs font-bold font-mono rounded-none transition-colors ${
                    viewMode === "grid-3"
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  3
                </button>

                {/* Grid 4 Toggle */}
                <button
                  type="button"
                  title="4 Columns"
                  onClick={() => setViewMode("grid-4")}
                  className={`px-2.5 py-1 text-xs font-bold font-mono rounded-none transition-colors ${
                    viewMode === "grid-4"
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  4
                </button>
              </div>

            </div>

          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-12 text-center space-y-4">
              <span className="material-symbols-outlined text-4xl text-[var(--color-text-secondary)]">
                inventory_2
              </span>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                No ready-made products match your criteria
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
                Try expanding your price range or toggling off the &quot;In Stock Only&quot; filter to see all catalog items.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[var(--color-accent-hover)] transition-colors min-h-[44px]"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Product Grid / List Container */}
          <div
            className={
              viewMode === "list"
                ? "flex flex-col gap-4 w-full"
                : viewMode === "grid-2"
                ? "grid grid-cols-1 sm:grid-cols-2 gap-5 w-full"
                : viewMode === "grid-3"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full"
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 w-full"
            }
          >
            {currentProducts.map((product) => {
              // LIST VIEW RENDER
              if (viewMode === "list") {
                return (
                  <div
                    key={product.id}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[var(--color-accent)] transition-colors group"
                  >
                    {/* Thumbnail & Product Details */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-24 h-24 relative bg-[var(--color-bg)] overflow-hidden shrink-0 border border-[var(--color-border)]">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          sizes="96px"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-[var(--color-text-secondary)] font-medium">
                          SKU: {product.sku}
                        </span>
                        <h3 className="text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                          {product.name}
                        </h3>
                        <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                          <span>{product.categoryName}</span>
                          <span>•</span>
                          <span>{product.fabricLine}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price, Stock & Action Button */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--color-border)]">
                      {/* Price */}
                      <span className="text-xl font-bold font-mono text-[var(--color-accent)] tabular-nums">
                        {product.formattedPrice}
                      </span>

                      {/* Stock Status Badge */}
                      {product.stockStatus === "IN_STOCK" ? (
                        <span className="text-xs font-bold text-[var(--color-status-success)] bg-[var(--color-status-success-bg)] px-2.5 py-1 rounded-none border border-[var(--color-status-success)]/30">
                          ✓ In Stock ({product.stockCount})
                        </span>
                      ) : product.stockStatus === "LOW_STOCK" ? (
                        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-none border border-amber-500/30">
                          ⚠ Low Stock ({product.stockCount})
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[var(--color-text-secondary)] bg-[var(--color-bg)] px-2.5 py-1 rounded-none border border-[var(--color-border)]">
                          Out of Stock
                        </span>
                      )}

                      {/* Action Button */}
                      <Link
                        href={`/wholesale/${product.slug}`}
                        className="px-5 h-[40px] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center rounded-none transition-colors min-w-[130px]"
                      >
                        VIEW &amp; ORDER
                      </Link>
                    </div>
                  </div>
                );
              }

              // GRID VIEW RENDER (2, 3, 4 cols)
              return (
                <div
                  key={product.id}
                  className="w-full h-[380px] mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none flex flex-col justify-between overflow-hidden hover:border-[var(--color-accent)] transition-colors group"
                >
                  {/* Top Portion (Image + Info) */}
                  <div className="flex flex-col flex-1 overflow-hidden">
                    
                    {/* Image (height: 220px, object-fit: cover) */}
                    <div className="h-[220px] w-full relative bg-[var(--color-bg)] overflow-hidden shrink-0">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                      />
                    </div>

                    {/* Text Padding 16px (p-4) */}
                    <div className="p-4 flex flex-col justify-between flex-1 space-y-1">
                      
                      {/* SKU */}
                      <div className="text-[11px] font-mono text-[var(--color-text-secondary)] font-medium tracking-tight">
                        SKU: {product.sku}
                      </div>

                      {/* Name */}
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors leading-tight">
                        {product.name}
                      </h3>

                      {/* Price & Stock Badge Row */}
                      <div className="flex items-center justify-between pt-1">
                        {/* Price */}
                        <span className="text-[18px] font-bold font-mono tabular-nums text-[var(--color-accent)]">
                          {product.formattedPrice}
                        </span>

                        {/* Stock Badge */}
                        {product.stockStatus === "IN_STOCK" ? (
                          <span className="text-[11px] font-bold text-[var(--color-status-success)] bg-[var(--color-status-success-bg)] px-2 py-0.5 rounded-none flex items-center gap-1 border border-[var(--color-status-success)]/30">
                            ✓ In Stock
                          </span>
                        ) : product.stockStatus === "LOW_STOCK" ? (
                          <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-none flex items-center gap-1 border border-amber-500/30">
                            ⚠ Low Stock
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-[var(--color-text-secondary)] bg-[var(--color-bg)] px-2 py-0.5 rounded-none flex items-center gap-1 border border-[var(--color-border)]">
                            Out of Stock
                          </span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Button: "VIEW & ORDER" */}
                  <Link
                    href={`/wholesale/${product.slug}`}
                    className="w-full h-[40px] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center rounded-none transition-colors shrink-0"
                  >
                    VIEW &amp; ORDER
                  </Link>
                </div>
              );
            })}
          </div>

          {/* BOTTOM PAGINATION */}
          {totalPages > 1 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-4 flex flex-wrap items-center justify-between gap-4 mt-8">
              
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none border transition-colors flex items-center gap-1 ${
                  currentPage === 1
                    ? "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] cursor-not-allowed"
                    : "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
                }`}
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-mono font-bold rounded-none border transition-colors ${
                        isCurrent
                          ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                          : "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none border transition-colors flex items-center gap-1 ${
                  currentPage === totalPages
                    ? "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] cursor-not-allowed"
                    : "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
                }`}
              >
                Next →
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
