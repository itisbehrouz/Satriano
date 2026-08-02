"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

export interface SizeStockItem {
  size: string;
  inStock: number;
}

export interface WholesaleProductDetailData {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  priceUSD: number;
  categoryName: string;
  categorySlug: string;
  images: string[];
  sizesStock: SizeStockItem[];
}

export function WholesaleProductDetailClient({
  product,
}: {
  product: WholesaleProductDetailData;
}) {
  // 1. Image Selection State
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // 2. Order Mode State: 'open-pack' vs 'pre-pack'
  const [orderMode, setOrderMode] = useState<"open-pack" | "pre-pack">("open-pack");

  // 3. Open Pack Quantities State: Map of size -> selected quantity
  const [openPackQty, setOpenPackQty] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    product.sizesStock.forEach((item) => {
      initial[item.size] = 0;
    });
    return initial;
  });

  // 4. Pre-Pack Selected Option State
  const [prePackOption, setPrePackOption] = useState<"1-pack" | "2-packs" | "all">("1-pack");

  // 5. Price Negotiation State
  const [suggestedPrice, setSuggestedPrice] = useState<string>("");

  // 6. Cart Notification Modal / Message
  const [addedToCartSuccess, setAddedToCartSuccess] = useState<boolean>(false);

  // Calculate total stock available across all sizes
  const totalAvailableStock = useMemo(() => {
    return product.sizesStock.reduce((acc, item) => acc + item.inStock, 0);
  }, [product.sizesStock]);

  // Compute Open Pack total units and price
  const openPackTotalUnits = useMemo(() => {
    return Object.values(openPackQty).reduce((acc, qty) => acc + qty, 0);
  }, [openPackQty]);

  // Compute Pre-Pack total units and price
  const prePackTotalUnits = useMemo(() => {
    if (prePackOption === "1-pack") return Math.min(5, totalAvailableStock);
    if (prePackOption === "2-packs") return Math.min(10, totalAvailableStock);
    return totalAvailableStock;
  }, [prePackOption, totalAvailableStock]);

  // Current active total units & price based on orderMode
  const activeTotalUnits = orderMode === "open-pack" ? openPackTotalUnits : prePackTotalUnits;
  const activeTotalPriceUSD = activeTotalUnits * product.priceUSD;

  // Stock status classification per prompt requirement:
  // Green: "✓ In Stock" (>5 units)
  // Amber: "⚠ Limited Stock" (1–5 units)
  // Red: "✗ Out of Stock" (0 units)
  const stockBadgeInfo = useMemo(() => {
    if (totalAvailableStock > 5) {
      return {
        label: `✓ IN STOCK (${totalAvailableStock} units available)`,
        colorClass: "bg-[#5DCAA5]/10 text-[#0F6E56] border-[#5DCAA5]/40",
      };
    } else if (totalAvailableStock >= 1) {
      return {
        label: `⚠ LIMITED STOCK (${totalAvailableStock} units available)`,
        colorClass: "bg-[#F0B94A]/10 text-[#854F0B] border-[#F0B94A]/40",
      };
    } else {
      return {
        label: "✗ OUT OF STOCK",
        colorClass: "bg-[#FCEBEB] text-[#A32D2D] border-[#FCEBEB]",
      };
    }
  }, [totalAvailableStock]);

  // Open Pack quantity increment/decrement handlers
  const updateSizeQty = (size: string, delta: number, maxStock: number) => {
    setOrderMode("open-pack");
    setOpenPackQty((prev) => {
      const current = prev[size] || 0;
      const updated = Math.max(0, Math.min(maxStock, current + delta));
      return { ...prev, [size]: updated };
    });
  };

  const setSizeQtyDirect = (size: string, valStr: string, maxStock: number) => {
    setOrderMode("open-pack");
    const parsed = parseInt(valStr, 10);
    const validVal = isNaN(parsed) ? 0 : Math.max(0, Math.min(maxStock, parsed));
    setOpenPackQty((prev) => ({ ...prev, [size]: validVal }));
  };

  // Add to Cart Action
  const handleAddToCart = () => {
    if (activeTotalUnits <= 0) return;

    // Calculate size breakdown & price offer details
    let sizeBreakdown: Record<string, number> = {};
    if (orderMode === "open-pack") {
      Object.entries(openPackQty).forEach(([s, q]) => {
        if (q > 0) sizeBreakdown[s] = q;
      });
    } else {
      // Pre-pack mixed size assortment breakdown e.g. 36(3) 38(5) 40(1) 44(3)
      sizeBreakdown = { "36": 3, "38": 5, "40": 1, "44": 3 };
    }

    const offeredPriceUSD = suggestedPrice ? parseFloat(suggestedPrice.replace(/[^0-9.]/g, "")) : undefined;
    const effectiveUnitPrice = offeredPriceUSD && !isNaN(offeredPriceUSD) ? offeredPriceUSD : product.priceUSD;
    const subtotalUSD = activeTotalUnits * product.priceUSD;
    const totalPriceUSD = activeTotalUnits * effectiveUnitPrice;
    const discountUSD = Math.max(0, subtotalUSD - totalPriceUSD);

    const cartItem = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      unitPriceUSD: product.priceUSD,
      offeredPriceUSD: offeredPriceUSD && !isNaN(offeredPriceUSD) ? offeredPriceUSD : null,
      sizeBreakdown,
      totalUnits: activeTotalUnits,
      subtotalUSD,
      discountUSD,
      totalPriceUSD,
    };

    try {
      const { addToWholesaleCart } = require("@/lib/wholesaleCart");
      addToWholesaleCart(cartItem);
    } catch (e) {
      console.error(e);
    }

    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 5000);
  };

  const currentMainImage = product.images[activeImageIndex] || product.images[0] || "/images/catalog/formal_wear.png";

  return (
    <div className="w-full font-sans antialiased text-[var(--color-text-primary)]">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-6">
        <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/wholesale" className="hover:text-[var(--color-accent)] transition-colors">
          Wholesale Catalog
        </Link>
        <span>/</span>
        <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-md">
          {product.name}
        </span>
      </nav>

      {/* Main 2-Column Product Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT — PRODUCT IMAGES */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Large Image Display */}
          <div className="w-full aspect-[4/5] relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none overflow-hidden">
            <Image
              src={currentMainImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Thumbnail Grid Below */}
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((imgUrl, idx) => {
              const isActive = idx === activeImageIndex;
              return (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-full aspect-square relative bg-[var(--color-surface)] border rounded-none overflow-hidden transition-all min-h-[44px] ${
                    isActive
                      ? "border-2 border-[var(--color-accent)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-text-secondary)]"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.name} view ${idx + 1}`}
                    fill
                    className="object-cover object-center"
                    sizes="120px"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — PRODUCT DETAILS & ORDERING MATRIX */}
        <div className="lg:col-span-6 space-y-6 bg-[var(--color-surface)] border border-[var(--color-border)] p-6 lg:p-8 rounded-none transition-colors">
          
          {/* Header Info: SKU, Name, Price, Stock Badge */}
          <div className="space-y-3 border-b border-[var(--color-border)] pb-5">
            {/* SKU */}
            <div className="text-xs font-mono font-semibold text-[var(--color-text-secondary)]">
              SKU: {product.sku}
            </div>

            {/* Name */}
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Fixed Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-[var(--color-accent)] tabular-nums">
                  ${product.priceUSD.toFixed(2)}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  (FIXED)
                </span>
              </div>

              {/* Stock Badge */}
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 border rounded-none flex items-center gap-1.5 ${stockBadgeInfo.colorClass}`}
              >
                {stockBadgeInfo.label}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2 border-b border-[var(--color-border)] pb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              DESCRIPTION
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              &quot;{product.description}&quot;
            </p>
          </div>

          {/* OPEN PACK ORDER Section */}
          <div className="space-y-4 border-b border-[var(--color-border)] pb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                OPEN PACK ORDER
              </h2>
              {orderMode === "open-pack" && openPackTotalUnits > 0 && (
                <span className="text-xs font-mono font-bold text-[var(--color-accent)]">
                  Selected: {openPackTotalUnits} units (${(openPackTotalUnits * product.priceUSD).toFixed(2)})
                </span>
              )}
            </div>

            {/* Size Picker with Stock Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {product.sizesStock.map((item) => {
                const qty = openPackQty[item.size] || 0;
                const isOutOfStock = item.inStock === 0;

                return (
                  <div
                    key={item.size}
                    className={`border p-2.5 rounded-none flex flex-col justify-between items-center space-y-2 transition-colors ${
                      qty > 0
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                        : isOutOfStock
                        ? "border-[var(--color-border)] bg-[var(--color-bg)] opacity-60"
                        : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)]"
                    }`}
                  >
                    {/* Header: Size label */}
                    <div className="text-xs font-bold text-[var(--color-text-primary)]">
                      Size {item.size}
                    </div>

                    {/* Stepper + Quantity Input */}
                    <div className="flex items-center justify-center gap-1 w-full">
                      {/* Decrement Button */}
                      <button
                        type="button"
                        onClick={() => updateSizeQty(item.size, -1, item.inStock)}
                        disabled={qty <= 0 || isOutOfStock}
                        className="w-8 h-8 flex items-center justify-center bg-[var(--color-surface)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-sm border border-[var(--color-border)] rounded-none disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[32px]"
                      >
                        -
                      </button>

                      {/* Qty Display Input */}
                      <input
                        type="text"
                        value={`Qty: ${qty}`}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setSizeQtyDirect(item.size, val, item.inStock);
                        }}
                        disabled={isOutOfStock}
                        className="w-16 h-8 text-center text-xs font-mono font-bold text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none focus:outline-none focus:border-[var(--color-accent)]"
                      />

                      {/* Increment Button */}
                      <button
                        type="button"
                        onClick={() => updateSizeQty(item.size, 1, item.inStock)}
                        disabled={qty >= item.inStock || isOutOfStock}
                        className="w-8 h-8 flex items-center justify-center bg-[var(--color-surface)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-sm border border-[var(--color-border)] rounded-none disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[32px]"
                      >
                        +
                      </button>
                    </div>

                    {/* In-Stock Count */}
                    <div className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                      {item.inStock} in stock
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRE-PACK ORDER Section */}
          <div className="space-y-3 border-b border-[var(--color-border)] pb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              PRE-PACK ORDER
            </h2>

            <div className="space-y-2 text-xs">
              {/* Option 1: 1 Pack */}
              <label
                className={`flex items-center justify-between p-3 border rounded-none cursor-pointer transition-colors min-h-[44px] ${
                  orderMode === "pre-pack" && prePackOption === "1-pack"
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 font-semibold"
                    : "border-[var(--color-border)] bg-[var(--color-bg)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="prePackOption"
                    checked={orderMode === "pre-pack" && prePackOption === "1-pack"}
                    onChange={() => {
                      setOrderMode("pre-pack");
                      setPrePackOption("1-pack");
                    }}
                    className="w-4 h-4 accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span>Add 1 Pack (5 units mixed sizes)</span>
                </div>
                <span className="font-mono font-bold text-[var(--color-accent)] text-xs">
                  ${(Math.min(5, totalAvailableStock) * product.priceUSD).toFixed(2)}
                </span>
              </label>

              {/* Option 2: 2 Packs */}
              <label
                className={`flex items-center justify-between p-3 border rounded-none cursor-pointer transition-colors min-h-[44px] ${
                  orderMode === "pre-pack" && prePackOption === "2-packs"
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 font-semibold"
                    : "border-[var(--color-border)] bg-[var(--color-bg)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="prePackOption"
                    checked={orderMode === "pre-pack" && prePackOption === "2-packs"}
                    onChange={() => {
                      setOrderMode("pre-pack");
                      setPrePackOption("2-packs");
                    }}
                    className="w-4 h-4 accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span>Add 2 Packs (10 units)</span>
                </div>
                <span className="font-mono font-bold text-[var(--color-accent)] text-xs">
                  ${(Math.min(10, totalAvailableStock) * product.priceUSD).toFixed(2)}
                </span>
              </label>

              {/* Option 3: All Available */}
              <label
                className={`flex items-center justify-between p-3 border rounded-none cursor-pointer transition-colors min-h-[44px] ${
                  orderMode === "pre-pack" && prePackOption === "all"
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 font-semibold"
                    : "border-[var(--color-border)] bg-[var(--color-bg)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="prePackOption"
                    checked={orderMode === "pre-pack" && prePackOption === "all"}
                    onChange={() => {
                      setOrderMode("pre-pack");
                      setPrePackOption("all");
                    }}
                    className="w-4 h-4 accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span>Add All Available ({totalAvailableStock} units)</span>
                </div>
                <span className="font-mono font-bold text-[var(--color-accent)] text-xs">
                  ${(totalAvailableStock * product.priceUSD).toFixed(2)}
                </span>
              </label>
            </div>
          </div>

          {/* PRICE OFFER (Optional) Section */}
          {(activeTotalUnits >= 10 || suggestedPrice.length > 0) && (
            <div className="space-y-2 border-b border-[var(--color-border)] pb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                PRICE OFFER (Optional)
              </h2>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Suggest a price:
                </label>
                <input
                  type="text"
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(e.target.value)}
                  placeholder="Enter your offer (e.g., $110 per unit)"
                  className="w-full px-3 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] rounded-none focus:outline-none focus:border-[var(--color-accent)] placeholder-[var(--color-text-secondary)]"
                />
                <p className="text-[11px] text-[var(--color-text-secondary)] italic">
                  Help us negotiate better pricing for bulk orders — submit your offer for admin review
                </p>
              </div>
            </div>
          )}

          {/* Summary & Primary Action Buttons */}
          <div className="space-y-4 pt-2">
            
            {/* Total Units & Price Summary Bar */}
            <div className="flex items-center justify-between p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none">
              <div className="text-xs text-[var(--color-text-secondary)]">
                Order Summary ({orderMode === "open-pack" ? "Open Pack" : "Pre-Pack"})
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[var(--color-text-primary)] font-mono">
                  {activeTotalUnits} Units Total
                </div>
                <div className="text-base font-bold text-[var(--color-accent)] font-mono tabular-nums">
                  ${activeTotalPriceUSD.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Cart Success Alert */}
            {addedToCartSuccess && (
              <div className="p-3 bg-[var(--color-status-success-bg)] border border-[var(--color-status-success)] text-[var(--color-status-success)] text-xs font-semibold rounded-none flex items-center justify-between">
                <span>✓ Added {activeTotalUnits} units to your wholesale cart!</span>
                <Link href="/wholesale/checkout" className="underline font-bold text-[var(--color-accent)]">
                  Proceed to Checkout →
                </Link>
              </div>
            )}

            {/* Action Buttons: [ADD TO CART] & [CONTINUE SHOPPING] */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={activeTotalUnits <= 0}
                className="w-full min-h-[44px] h-[48px] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                ADD TO CART
              </button>

              <Link
                href="/wholesale"
                className="w-full min-h-[44px] h-[48px] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                CONTINUE SHOPPING
              </Link>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
