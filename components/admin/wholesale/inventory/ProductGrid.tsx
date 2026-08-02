"use client";

import { ProductCard, InventoryGarmentProduct } from "./ProductCard";

export interface ProductGridProps {
  products: InventoryGarmentProduct[];
  onView: (product: InventoryGarmentProduct) => void;
  onEditMarkup: (product: InventoryGarmentProduct) => void;
}

export function ProductGrid({ products, onView, onEditMarkup }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-[#6B7280] bg-white rounded-md border border-[#EAECF0]">
        No ready-made products found for the selected category filter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onView={onView}
          onEditMarkup={onEditMarkup}
        />
      ))}
    </div>
  );
}
