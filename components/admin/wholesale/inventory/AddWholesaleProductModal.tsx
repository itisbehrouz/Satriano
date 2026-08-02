"use client";

import { useState, useEffect } from "react";
import { ProductImageUploader, ProductImageItem } from "../images/ProductImageUploader";

export interface SupplierOption {
  id: string;
  firmName: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING_VERIFICATION";
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface AddWholesaleProductModalProps {
  isOpen: boolean;
  prefilledSupplierId?: string;
  suppliers: SupplierOption[];
  categories: CategoryOption[];
  onClose: () => void;
  onSuccess: (newProduct: any) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function AddWholesaleProductModal({
  isOpen,
  prefilledSupplierId,
  suppliers,
  categories,
  onClose,
  onSuccess,
  showToast,
}: AddWholesaleProductModalProps) {
  // Tab State: 'basic' | 'pricing'
  const [activeTab, setActiveTab] = useState<"basic" | "pricing">("basic");

  // Form State
  const [supplierId, setSupplierId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  
  // Pricing State
  const [costPriceUSD, setCostPriceUSD] = useState<string>("");
  const [markupPercent, setMarkupPercent] = useState<string>("35");
  const [isOverrideSellPrice, setIsOverrideSellPrice] = useState<boolean>(false);
  const [overrideSellPriceUSD, setOverrideSellPriceUSD] = useState<string>("");
  
  // Images & Status
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // Stock Matrix State
  const defaultSizes = ["36", "38", "40", "42", "44", "46", "48", "50"];
  const [stockMatrix, setStockMatrix] = useState<
    Record<string, { quantity: number; lowStockThreshold: number }>
  >({});

  // Confirm negative margin state
  const [hasNegativeMarginConfirmed, setHasNegativeMarginConfirmed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("basic");
      setSupplierId(prefilledSupplierId || (suppliers.find((s) => s.status === "ACTIVE")?.id || ""));
      setCategoryId(categories[0]?.id || "");
      setName("");
      setSku("");
      setDescription("");
      setIsDescriptionExpanded(false);
      setCostPriceUSD("125.00");
      setMarkupPercent("35");
      setIsOverrideSellPrice(false);
      setOverrideSellPriceUSD("");
      setStatus("ACTIVE");
      setHasNegativeMarginConfirmed(false);
      setError(null);

      // Initialize default stock matrix
      const initStock: Record<string, { quantity: number; lowStockThreshold: number }> = {};
      defaultSizes.forEach((sz) => {
        initStock[sz] = { quantity: 0, lowStockThreshold: 3 };
      });
      setStockMatrix(initStock);

      // Initialize default placeholder images
      setImages([
        { id: "img-1", imageUrl: "/placeholder-suit.jpg", imageOrder: 1 },
        { id: "img-2", imageUrl: "/placeholder-suit.jpg", imageOrder: 2 },
        { id: "img-3", imageUrl: "/placeholder-suit.jpg", imageOrder: 3 },
        { id: "img-4", imageUrl: "/placeholder-suit.jpg", imageOrder: 4 },
      ]);
    }
  }, [isOpen, prefilledSupplierId, suppliers, categories]);

  if (!isOpen) return null;

  // Computed sell price ($)
  const parsedCostUSD = parseFloat(costPriceUSD) || 0;
  const parsedMarkup = parseFloat(markupPercent) || 0;
  const formulaSellPriceUSD = parsedCostUSD * (1 + parsedMarkup / 100);

  const finalSellPriceUSD = isOverrideSellPrice
    ? parseFloat(overrideSellPriceUSD) || formulaSellPriceUSD
    : formulaSellPriceUSD;

  const isNegativeMargin = finalSellPriceUSD < parsedCostUSD;

  const handleStockQtyChange = (size: string, delta: number) => {
    setStockMatrix((prev) => {
      const current = prev[size]?.quantity || 0;
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        [size]: { ...prev[size], quantity: next },
      };
    });
  };

  const handleStockQtyInput = (size: string, valStr: string) => {
    const val = parseInt(valStr, 10);
    const valid = isNaN(val) ? 0 : Math.max(0, val);
    setStockMatrix((prev) => ({
      ...prev,
      [size]: { ...prev[size], quantity: valid },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation 1: Required basic info fields
    if (!name.trim() || !sku.trim() || !supplierId || !categoryId) {
      setActiveTab("basic");
      setError("Product Name, SKU, Supplier, and Category are required.");
      return;
    }

    // Validation 2: Cost price
    if (parsedCostUSD <= 0) {
      setActiveTab("pricing");
      setError("Cost price must be greater than $0.00.");
      return;
    }

    // Validation 3: Negative margin warning
    if (isNegativeMargin && !hasNegativeMarginConfirmed) {
      setActiveTab("pricing");
      setError("⚠️ Negative margin detected! Customer Sell Price is lower than Wholesale Cost. Click 'CREATE PRODUCT' again to confirm.");
      setHasNegativeMarginConfirmed(true);
      return;
    }

    const stockList = Object.entries(stockMatrix).map(([sz, val]) => ({
      size: sz,
      quantity: val.quantity,
      lowStockThreshold: val.lowStockThreshold,
    }));

    if (stockList.length === 0) {
      setActiveTab("pricing");
      setError("At least one size row is required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        supplierId,
        categoryId,
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim() || null,
        costPriceCents: Math.round(parsedCostUSD * 100),
        markupPercent: parsedMarkup,
        sellPriceCents: Math.round(finalSellPriceUSD * 100),
        status,
        images: images.map((img) => ({ url: img.imageUrl, sortOrder: img.imageOrder })),
        stock: stockList,
      };

      const res = await fetch("/api/admin/wholesale/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create wholesale product.");
      }

      showToast(`Successfully created wholesale product ${sku}`, "success");
      onSuccess(data.product);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[720px] max-h-[min(85vh,720px)] text-[#111318] shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Modal Header (Fixed Top) */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#EAECF0] flex-shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
            ADD NEW WHOLESALE PRODUCT (Supplier-Linked)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111318] text-lg font-bold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Header (Fixed Top) */}
        <div className="flex items-center border-b border-[#EAECF0] bg-[#F7F8FA] px-6 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "basic"
                ? "border-[#2E5AAC] text-[#2E5AAC] bg-white font-bold"
                : "border-transparent text-[#6B7280] hover:text-[#111318]"
            }`}
          >
            <span className="material-symbols-outlined text-base">info</span>
            <span>Basic Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "pricing"
                ? "border-[#2E5AAC] text-[#2E5AAC] bg-white font-bold"
                : "border-transparent text-[#6B7280] hover:text-[#111318]"
            }`}
          >
            <span className="material-symbols-outlined text-base">payments</span>
            <span>Pricing &amp; Stock</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              {/* Supplier & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
                    Supplier *
                  </label>
                  <select
                    required
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] font-bold rounded-md focus:border-[#2E5AAC] focus:outline-none cursor-pointer"
                  >
                    {suppliers.map((sup) => {
                      const isPending = sup.status === "PENDING_VERIFICATION";
                      return (
                        <option
                          key={sup.id}
                          value={sup.id}
                          disabled={isPending}
                          className={isPending ? "text-[#94A3B8]" : "text-[#111318]"}
                        >
                          {sup.firmName} {isPending ? "(Pending Verification 🔒)" : "✓"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] font-bold rounded-md focus:border-[#2E5AAC] focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Shawl Lapel Slim Fit Prom Blazer"
                    className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] rounded-md focus:border-[#2E5AAC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
                    SKU (Supplier / Atelier Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="e.g., CY-1306-NAVY"
                    className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] font-mono font-bold rounded-md focus:border-[#2E5AAC] focus:outline-none uppercase"
                  />
                </div>
              </div>

              {/* Description (Optional - Collapsible) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold uppercase tracking-wider text-[#344054]">
                    Description (Optional)
                  </label>
                  {!isDescriptionExpanded && (
                    <button
                      type="button"
                      onClick={() => setIsDescriptionExpanded(true)}
                      className="text-[11px] font-bold text-[#2E5AAC] hover:underline cursor-pointer"
                    >
                      + Add Description
                    </button>
                  )}
                </div>
                {isDescriptionExpanded && (
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Garment details, fabric composition, features..."
                    className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] rounded-md focus:border-[#2E5AAC] focus:outline-none resize-none"
                  />
                )}
              </div>

              {/* Compact Product Images Uploader */}
              <ProductImageUploader images={images} onChangeImages={setImages} />
            </div>
          )}

          {/* TAB 2: PRICING & STOCK */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              {/* Pricing & Margin Calculator */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-md space-y-4 font-mono text-xs">
                <div className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] pb-1 border-b border-[#E2E8F0]">
                  PRICING & FORMULA CALCULATOR
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-[#344054] mb-1">
                      Wholesale Cost ($ USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[#64748B] font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={costPriceUSD}
                        onChange={(e) => setCostPriceUSD(e.target.value)}
                        placeholder="125.00"
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-[#D0D5DD] font-bold text-[#0F172A] rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#344054] mb-1">
                      Markup (%) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="300"
                        required
                        value={markupPercent}
                        onChange={(e) => setMarkupPercent(e.target.value)}
                        placeholder="35"
                        className="w-full px-3 py-1.5 bg-white border border-[#D0D5DD] font-bold text-[#0F172A] rounded-md"
                      />
                      <span className="absolute right-2.5 top-2 text-[#64748B] font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-[#344054]">
                        Computed Sell Price:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOverrideSellPrice(!isOverrideSellPrice);
                          if (!isOverrideSellPrice) {
                            setOverrideSellPriceUSD(formulaSellPriceUSD.toFixed(2));
                          }
                        }}
                        className="text-[10px] text-[#2E5AAC] hover:underline cursor-pointer"
                      >
                        {isOverrideSellPrice ? "Use Formula" : "Override"}
                      </button>
                    </div>

                    {isOverrideSellPrice ? (
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-[#64748B] font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={overrideSellPriceUSD}
                          onChange={(e) => setOverrideSellPriceUSD(e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 bg-white border border-[#2E5AAC] font-bold text-[#2E5AAC] rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="py-1.5 px-3 bg-white border border-[#E2E8F0] font-bold text-[#2E5AAC] text-sm rounded-md tabular-nums">
                        ${formulaSellPriceUSD.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {isNegativeMargin && (
                  <div className="p-3 bg-[#FEE4E2] border border-[#F8B4B4] rounded-md text-[11px] text-[#C5221F] font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">warning</span>
                    <span>⚠️ Negative Margin Warning: Sell price (${finalSellPriceUSD.toFixed(2)}) is lower than wholesale cost (${parsedCostUSD.toFixed(2)}).</span>
                  </div>
                )}
              </div>

              {/* Size / Stock Matrix */}
              <div className="border border-[#EAECF0] p-4 rounded-md space-y-3 font-sans">
                <div className="font-bold text-[#111318] uppercase tracking-wider text-xs pb-1 border-b border-[#EAECF0]">
                  INITIAL SIZE & STOCK MATRIX
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(stockMatrix).map(([sz, data]) => (
                    <div
                      key={sz}
                      className="p-2.5 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] flex flex-col justify-between gap-2"
                    >
                      <div className="flex justify-between items-center font-mono">
                        <span className="font-bold text-xs uppercase text-[#0F172A]">SIZE {sz}</span>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            data.quantity > 0 ? "text-[#067647]" : "text-[#94A3B8]"
                          }`}
                        >
                          {data.quantity > 0 ? `${data.quantity} in st` : "0"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => handleStockQtyChange(sz, -1)}
                          className="w-6 h-6 bg-white border border-[#CBD5E1] hover:bg-[#E2E8F0] text-xs font-bold rounded flex items-center justify-center cursor-pointer min-h-[26px]"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={data.quantity}
                          onChange={(e) => handleStockQtyInput(sz, e.target.value)}
                          className="w-12 h-6 bg-white border border-[#2E5AAC] font-mono text-center text-xs font-bold text-[#0F172A] rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockQtyChange(sz, 1)}
                          className="w-6 h-6 bg-white border border-[#CBD5E1] hover:bg-[#E2E8F0] text-xs font-bold rounded flex items-center justify-center cursor-pointer min-h-[26px]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-md font-mono text-xs">
                <div>
                  <span className="font-bold uppercase text-[#111318]">GARMENT STATUS:</span>
                  <span className="text-[#64748B] text-[11px] block">
                    {status === "ACTIVE"
                      ? "Active (Visible on public /wholesale catalog)"
                      : "Inactive (Saved but hidden from public catalog)"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {(["ACTIVE", "INACTIVE"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`px-3 py-1.5 font-bold uppercase rounded-md text-xs transition-colors cursor-pointer border ${
                        status === st
                          ? st === "ACTIVE"
                            ? "bg-[#067647] text-white border-[#067647]"
                            : "bg-[#C5221F] text-white border-[#C5221F]"
                          : "bg-white text-[#64748B] border-[#D0D5DD]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-[#C5221F] font-bold text-xs">{error}</p>}
        </div>

        {/* Modal Footer (Fixed Bottom) */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#EAECF0] bg-[#F7F8FA] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-[#344054] border border-[#D0D5DD] rounded-md font-bold uppercase tracking-wider text-xs hover:bg-[#F9FAFB] cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white rounded-md font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {submitting ? "CREATING..." : "CREATE PRODUCT"}
          </button>
        </div>
      </form>
    </div>
  );
}
