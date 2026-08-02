"use client";

import { ProductImageItem } from "../images/ProductImageUploader";

export interface InventoryGarmentProduct {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  supplierId: string;
  supplierName: string;
  supplierSku: string;
  wholesaleCostPriceUSD: number;
  markupPercent: number; // e.g. 20 for 20%
  sellPriceUSD: number;
  stockLevel: number;
  sizeStockMatrix: Record<string, number>;
  supplierNote: string;
  images: ProductImageItem[];
}

export interface ProductCardProps {
  product: InventoryGarmentProduct;
  onView: (product: InventoryGarmentProduct) => void;
  onEditMarkup: (product: InventoryGarmentProduct) => void;
}

export function ProductCard({ product, onView, onEditMarkup }: ProductCardProps) {
  const mainImage = product.images[0]?.imageUrl || "/placeholder-suit.jpg";
  const isOutOfStock = product.stockLevel === 0;
  const isLowStock = product.stockLevel > 0 && product.stockLevel <= 5;
  const isGoodStock = product.stockLevel > 5;

  const markupUSD = product.sellPriceUSD - product.wholesaleCostPriceUSD;

  return (
    <div className="bg-white border border-[#D0D5DD] hover:border-[#2E5AAC] rounded-md p-4 space-y-3 font-sans select-none transition-all shadow-xs flex flex-col justify-between">
      <div className="space-y-3">
        {/* Image & Photo Count */}
        <div className="relative aspect-3/4 bg-[#F8FAFC] rounded-xs border border-[#E2E8F0] overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-2 right-2 bg-[#111318]/80 text-white font-mono text-[10px] px-1.5 py-0.5 font-bold">
            📷 {product.images.length} Photos
          </span>
          <span className="absolute bottom-2 left-2 bg-[#2E5AAC] text-white font-mono text-[10px] px-1.5 py-0.5 font-bold uppercase">
            SKU: {product.supplierSku}
          </span>
        </div>

        {/* Product Info & Supplier */}
        <div>
          <h3 className="text-sm font-bold text-[#111318] line-clamp-1">
            {product.name}
          </h3>
          <div className="text-xs font-semibold text-[#2E5AAC]">
            by {product.supplierName}
          </div>
        </div>

        {/* Pricing Block */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-md space-y-1 text-xs font-mono">
          <div className="flex justify-between text-[#64748B]">
            <span>Wholesale Cost:</span>
            <span>${product.wholesaleCostPriceUSD.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#067647] font-bold text-[11px]">
            <span>Your Markup:</span>
            <span>+${markupUSD.toFixed(2)} ({product.markupPercent}%)</span>
          </div>
          <div className="flex justify-between font-bold text-[#0F172A] pt-1 border-t border-[#E2E8F0]">
            <span>Sell Price:</span>
            <span className="text-[#2E5AAC]">${product.sellPriceUSD.toFixed(2)}</span>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-mono font-bold">
            <span className="text-[#6B7280]">Total Stock:</span>
            {isGoodStock && (
              <span className="text-[#067647]">{product.stockLevel} units ✓</span>
            )}
            {isLowStock && (
              <span className="text-[#854F0B]">{product.stockLevel} units ⚠</span>
            )}
            {isOutOfStock && (
              <span className="text-[#C5221F]">0 units ✗</span>
            )}
          </div>

          <div className="text-[11px] text-[#64748B] line-clamp-1 italic">
            &quot;{product.supplierNote}&quot;
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#EAECF0]">
        <button
          type="button"
          onClick={() => onView(product)}
          className="flex-1 py-1.5 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase rounded-md transition-colors cursor-pointer text-center"
        >
          VIEW
        </button>
        <button
          type="button"
          onClick={() => onEditMarkup(product)}
          className="flex-1 py-1.5 bg-white border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] text-xs font-bold uppercase rounded-md transition-colors cursor-pointer text-center"
        >
          EDIT
        </button>
      </div>
    </div>
  );
}
