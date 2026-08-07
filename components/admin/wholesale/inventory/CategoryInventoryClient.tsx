"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CategoryFilter, CategoryOption } from "./CategoryFilter";
import { ProductGrid } from "./ProductGrid";
import { ProductCard, InventoryGarmentProduct } from "./ProductCard";
import { ProductDetailModal } from "./ProductDetailModal";
import { AddWholesaleProductModal, SupplierOption } from "./AddWholesaleProductModal";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

export function CategoryInventoryClient() {
  const { t, language } = useAdminLanguage();
  const categories: CategoryOption[] = [
    { id: "cat-tops", name: "Tops", productCount: 45, supplierCount: 3 },
    { id: "cat-bottoms", name: "Bottoms", productCount: 32, supplierCount: 5 },
    { id: "cat-outerwear", name: "Outerwear", productCount: 18, supplierCount: 2 },
    { id: "cat-formal", name: "Formal Wear", productCount: 24, supplierCount: 4 },
  ];

  const suppliers: SupplierOption[] = [
    { id: "sup-1", firmName: "ABC Textile Co.", status: "ACTIVE" },
    { id: "sup-2", firmName: "XYZ Fabrics", status: "ACTIVE" },
    { id: "sup-3", firmName: "Premium Knit Ltd.", status: "ACTIVE" },
    { id: "sup-4", firmName: "Anadolu Garments A.Ş.", status: "PENDING_VERIFICATION" },
  ];

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const [products, setProducts] = useState<InventoryGarmentProduct[]>([
    {
      id: "prod-1",
      name: "Shawl Lapel Slim Fit Prom Blazer",
      categoryId: "cat-formal",
      categoryName: "Formal Wear",
      supplierId: "sup-1",
      supplierName: "ABC Textile Co.",
      supplierSku: "ABC-001-NAVY",
      wholesaleCostPriceUSD: 125.0,
      markupPercent: 20,
      sellPriceUSD: 150.0,
      stockLevel: 12,
      supplierNote: "High quality wool blend, 10 days delivery schedule.",
      sizeStockMatrix: { "36": 3, "38": 5, "40": 3, "42": 1 },
      images: [
        { id: "img-1", imageUrl: "/placeholder-blazer-1.jpg", imageOrder: 1 },
        { id: "img-2", imageUrl: "/placeholder-blazer-2.jpg", imageOrder: 2 },
        { id: "img-3", imageUrl: "/placeholder-blazer-3.jpg", imageOrder: 3 },
        { id: "img-4", imageUrl: "/placeholder-blazer-4.jpg", imageOrder: 4 },
      ],
    },
    {
      id: "prod-2",
      name: "Italian Poplin Cotton Dress Shirt",
      categoryId: "cat-tops",
      categoryName: "Tops",
      supplierId: "sup-2",
      supplierName: "XYZ Fabrics",
      supplierSku: "XYZ-045-WHT",
      wholesaleCostPriceUSD: 75.0,
      markupPercent: 20,
      sellPriceUSD: 90.0,
      stockLevel: 24,
      supplierNote: "Crisp non-iron cotton poplin. Fast dispatch.",
      sizeStockMatrix: { "36": 6, "38": 8, "40": 6, "42": 4 },
      images: [
        { id: "img-5", imageUrl: "/placeholder-shirt-1.jpg", imageOrder: 1 },
        { id: "img-6", imageUrl: "/placeholder-shirt-2.jpg", imageOrder: 2 },
        { id: "img-7", imageUrl: "/placeholder-shirt-3.jpg", imageOrder: 3 },
        { id: "img-8", imageUrl: "/placeholder-shirt-4.jpg", imageOrder: 4 },
      ],
    },
    {
      id: "prod-3",
      name: "Virgin Wool Double Breasted Overcoat",
      categoryId: "cat-outerwear",
      categoryName: "Outerwear",
      supplierId: "sup-3",
      supplierName: "Premium Knit Ltd.",
      supplierSku: "PK-089-BLK",
      wholesaleCostPriceUSD: 95.0,
      markupPercent: 20,
      sellPriceUSD: 114.0,
      stockLevel: 3,
      supplierNote: "Heavyweight 600gsm wool blend. Low stock.",
      sizeStockMatrix: { "36": 1, "38": 1, "40": 1, "42": 0 },
      images: [
        { id: "img-9", imageUrl: "/placeholder-coat-1.jpg", imageOrder: 1 },
        { id: "img-10", imageUrl: "/placeholder-coat-2.jpg", imageOrder: 2 },
        { id: "img-11", imageUrl: "/placeholder-coat-3.jpg", imageOrder: 3 },
        { id: "img-12", imageUrl: "/placeholder-coat-4.jpg", imageOrder: 4 },
      ],
    },
    {
      id: "prod-4",
      name: "Tailored Italian Wool Trousers",
      categoryId: "cat-bottoms",
      categoryName: "Bottoms",
      supplierId: "sup-1",
      supplierName: "ABC Textile Co.",
      supplierSku: "ABC-112-GRY",
      wholesaleCostPriceUSD: 85.0,
      markupPercent: 20,
      sellPriceUSD: 102.0,
      stockLevel: 0,
      supplierNote: "Out of stock. Restock scheduled for Aug 15.",
      sizeStockMatrix: { "36": 0, "38": 0, "40": 0, "42": 0 },
      images: [
        { id: "img-13", imageUrl: "/placeholder-[#F8FAFC].jpg", imageOrder: 1 },
        { id: "img-14", imageUrl: "/placeholder-[#F8FAFC].jpg", imageOrder: 2 },
        { id: "img-15", imageUrl: "/placeholder-[#F8FAFC].jpg", imageOrder: 3 },
        { id: "img-16", imageUrl: "/placeholder-[#F8FAFC].jpg", imageOrder: 4 },
      ],
    },
  ]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<InventoryGarmentProduct | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === "ALL") return products;
    return products.filter((p) => p.categoryId === selectedCategoryId);
  }, [products, selectedCategoryId]);

  const handleUpdateProduct = (updated: InventoryGarmentProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProduct(updated);
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] py-8 px-4 md:px-8 font-sans transition-colors">
      <div className="w-full max-w-container-max mx-auto space-y-6 relative">
        {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-none shadow-xl font-bold text-xs flex items-center gap-2 border transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
            {t.inventoryByCategory}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {t.inventoryByCategorySub}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_box</span>
            {t.addProduct}
          </button>
          <Link
            href="/admin/wholesale/suppliers"
            className="h-10 px-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">store</span>
            {t.manageSuppliers}
          </Link>
          <Link
            href="/admin/wholesale"
            className="h-10 px-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] text-xs font-bold uppercase tracking-wider rounded-none transition-colors inline-flex items-center gap-2"
          >
            {t.backToDashboard}
          </Link>
        </div>
      </div>

      {/* Controls Bar: Category Filter */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-none flex items-center justify-between">
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
        <div className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">
          {filteredProducts.length} {language === "tr" ? "Ürün Gösteriliyor" : "Products Showing"}
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={filteredProducts}
        onView={(p) => setSelectedProduct(p)}
        onEditMarkup={(p) => setSelectedProduct(p)}
      />

      {/* Product Detail & Photo Upload Modal */}
      <ProductDetailModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onUpdateProduct={handleUpdateProduct}
        showToast={showToast}
      />

      {/* Add Wholesale Product Modal */}
      <AddWholesaleProductModal
        isOpen={isAddModalOpen}
        suppliers={suppliers}
        categories={categories}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newProduct) => {
          showToast(`Added product ${newProduct.name || newProduct.sku}`, "success");
          // Map to local presentation format
          const formatted: InventoryGarmentProduct = {
            id: newProduct.id,
            name: newProduct.name || "New Garment Product",
            categoryId: newProduct.categoryId || "cat-formal",
            categoryName: categories.find((c) => c.id === newProduct.categoryId)?.name || "Formal Wear",
            supplierId: newProduct.supplierId || "sup-1",
            supplierName: suppliers.find((s) => s.id === newProduct.supplierId)?.firmName || "Supplier",
            supplierSku: newProduct.sku,
            wholesaleCostPriceUSD: (newProduct.costPriceCents || 12500) / 100,
            markupPercent: newProduct.markupPercent || 35,
            sellPriceUSD: (newProduct.sellPriceCents || 16875) / 100,
            stockLevel: 10,
            supplierNote: "Direct factory inventory",
            sizeStockMatrix: { "36": 2, "38": 3, "40": 3, "42": 2 },
            images: newProduct.images || [
              { id: "img-1", imageUrl: "/placeholder-blazer-1.jpg", imageOrder: 1 },
              { id: "img-2", imageUrl: "/placeholder-blazer-2.jpg", imageOrder: 2 },
            ],
          };
          setProducts((prev) => [formatted, ...prev]);
        }}
        showToast={showToast}
      />
      </div>
    </main>
  );
}
