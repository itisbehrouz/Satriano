"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CatalogImageUploader } from "@/components/admin/CatalogImageUploader";
import { ProductFitTree } from "@/components/admin/ProductFitTree";
import { GarmentFitsPanel } from "@/components/admin/GarmentFitsPanel";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

interface SizeOption {
  id: string;
  label: string;
  sortOrder: number;
}

interface SizeSystem {
  id: string;
  name: string;
  region: string;
  options: SizeOption[];
}

interface FitDef {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface Fabric {
  id: string;
  name: string;
  priceMinCents: number;
  priceMaxCents: number;
  setupFeeCents: number;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  leadTimeDays?: number;
  moq?: number;
  moqPerFabric?: number;
  moqCombinedMultiFabric?: number | null;
  active: boolean;
  fabrics: Fabric[];
  fits: Array<{ fit: FitDef }>;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  sizeSystems: Array<{ sizeSystem: SizeSystem }>;
  products: Product[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  subcategories: Subcategory[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminProductSettingsPage() {
  const { isAuthenticated } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizeSystems, setSizeSystems] = useState<SizeSystem[]>([]);
  const [allFits, setAllFits] = useState<FitDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit MOQ state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editMoqPerFabric, setEditMoqPerFabric] = useState<number>(50);
  const [editMoqCombined, setEditMoqCombined] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"catalog" | "sizing" | "fits" | "fabrics">("catalog");

  // Garment Fits Slide-Over Panel Context State
  const [selectedFitProductContext, setSelectedFitProductContext] = useState<{
    product: Product;
    categoryName: string;
    subcategoryName: string;
  } | null>(null);

  useEffect(() => {
    if (selectedFitProductContext) {
      for (const cat of categories) {
        for (const sub of cat.subcategories) {
          const found = sub.products.find((p) => p.id === selectedFitProductContext.product.id);
          if (found) {
            setSelectedFitProductContext({
              product: found,
              categoryName: cat.name,
              subcategoryName: sub.name,
            });
            return;
          }
        }
      }
    }
  }, [categories]);

  // Modal visibility states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [addSubcategoryCategory, setAddSubcategoryCategory] = useState<Category | null>(null);
  const [addProductContext, setAddProductContext] = useState<{ cat: Category; sub: Subcategory } | null>(null);

  // Modal form fields: Category
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImageUrl, setCatImageUrl] = useState<string | null>(null);
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // Modal form fields: Subcategory
  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [subSizeSystemIds, setSubSizeSystemIds] = useState<string[]>([]);
  const [subImageUrl, setSubImageUrl] = useState<string | null>(null);
  const [subSubmitting, setSubSubmitting] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  // Modal form fields: Product
  const [prodName, setProdName] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodLeadTime, setProdLeadTime] = useState<number>(14);
  const [prodMoqPerFabric, setProdMoqPerFabric] = useState<number>(50);
  const [prodMoqCombined, setProdMoqCombined] = useState<string>("");
  const [prodFabricName, setProdFabricName] = useState("");
  const [prodPriceMinDollars, setProdPriceMinDollars] = useState<string>("19.50");
  const [prodPriceMaxDollars, setProdPriceMaxDollars] = useState<string>("24.00");
  const [prodSetupFeeDollars, setProdSetupFeeDollars] = useState<string>("0.00");
  const [prodFitIds, setProdFitIds] = useState<string[]>([]);
  const [prodImageUrl, setProdImageUrl] = useState<string | null>(null);
  const [prodSubmitting, setProdSubmitting] = useState(false);
  const [prodError, setProdError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCatalog();
    }
  }, [isAuthenticated]);

  async function fetchCatalog() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/catalog");
      if (res.ok) {
        const json = await res.json();
        setCategories(json.categories || []);
        setSizeSystems(json.sizeSystems || []);
        setAllFits(json.fits || []);
      } else {
        setError("Failed to load catalog settings");
      }
    } catch {
      setError("Network error loading catalog");
    } finally {
      setLoading(false);
    }
  }

  // --- CATEGORY CREATION ---
  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCatError(null);
    if (!catName.trim() || !catSlug.trim()) {
      setCatError("Category name and slug are required.");
      return;
    }

    setCatSubmitting(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "category",
          data: {
            name: catName,
            slug: catSlug,
            description: catDesc,
            imageUrl: catImageUrl,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setCatError(json.error || "Failed to create category.");
        return;
      }

      // Reset and close
      setCatName("");
      setCatSlug("");
      setCatDesc("");
      setCatImageUrl(null);
      setShowAddCategoryModal(false);
      fetchCatalog();
    } catch {
      setCatError("Network error creating category.");
    } finally {
      setCatSubmitting(false);
    }
  }

  // --- SUBCATEGORY CREATION ---
  async function handleCreateSubcategory(e: React.FormEvent) {
    e.preventDefault();
    if (!addSubcategoryCategory) return;
    setSubError(null);

    if (!subName.trim() || !subSlug.trim()) {
      setSubError("Subcategory name and slug are required.");
      return;
    }

    setSubSubmitting(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "subcategory",
          data: {
            categoryId: addSubcategoryCategory.id,
            name: subName,
            slug: subSlug,
            description: subDesc,
            sizeSystemIds: subSizeSystemIds,
            imageUrl: subImageUrl,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setSubError(json.error || "Failed to create subcategory.");
        return;
      }

      setSubName("");
      setSubSlug("");
      setSubDesc("");
      setSubSizeSystemIds([]);
      setSubImageUrl(null);
      setAddSubcategoryCategory(null);
      fetchCatalog();
    } catch {
      setSubError("Network error creating subcategory.");
    } finally {
      setSubSubmitting(false);
    }
  }

  // --- PRODUCT CREATION ---
  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!addProductContext) return;
    setProdError(null);

    if (!prodName.trim() || !prodSlug.trim()) {
      setProdError("Product name and slug are required.");
      return;
    }

    if (!prodFabricName.trim()) {
      setProdError("Initial fabric name is required.");
      return;
    }

    const priceMinCents = Math.round(parseFloat(prodPriceMinDollars) * 100);
    const priceMaxCents = Math.round(parseFloat(prodPriceMaxDollars) * 100);
    const setupFeeCents = Math.round((parseFloat(prodSetupFeeDollars) || 0) * 100);

    if (isNaN(priceMinCents) || isNaN(priceMaxCents) || priceMinCents <= 0 || priceMaxCents <= 0) {
      setProdError("Valid positive fabric prices are required.");
      return;
    }

    if (priceMinCents > priceMaxCents) {
      setProdError("Fabric min price cannot exceed max price.");
      return;
    }

    const combinedVal = prodMoqCombined.trim() === "" ? null : parseInt(prodMoqCombined, 10);

    setProdSubmitting(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "product",
          data: {
            subcategoryId: addProductContext.sub.id,
            name: prodName,
            slug: prodSlug,
            description: prodDesc,
            imageUrl: prodImageUrl,
            leadTimeDays: prodLeadTime,
            moqPerFabric: prodMoqPerFabric,
            moqCombinedMultiFabric: isNaN(combinedVal as number) ? null : combinedVal,
            fitIds: prodFitIds,
            initialFabric: {
              name: prodFabricName,
              priceMinCents,
              priceMaxCents,
              setupFeeCents,
            },
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setProdError(json.error || "Failed to create product.");
        return;
      }

      setProdName("");
      setProdSlug("");
      setProdDesc("");
      setProdFabricName("");
      setProdFitIds([]);
      setProdImageUrl(null);
      setAddProductContext(null);
      fetchCatalog();
    } catch {
      setProdError("Network error creating product.");
    } finally {
      setProdSubmitting(false);
    }
  }

  async function toggleProductActive(prodId: string, currentActive: boolean) {
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "product",
          id: prodId,
          data: { active: !currentActive },
        }),
      });
      if (res.ok) fetchCatalog();
    } catch (e) {
      console.error(e);
    }
  }

  async function saveProductMoqs(prodId: string) {
    const combinedVal = editMoqCombined.trim() === "" ? null : parseInt(editMoqCombined, 10);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "product",
          id: prodId,
          data: {
            moqPerFabric: editMoqPerFabric,
            moqCombinedMultiFabric: isNaN(combinedVal as number) ? null : combinedVal,
          },
        }),
      });
      if (res.ok) {
        setEditingProductId(null);
        fetchCatalog();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveProductFits(productId: string, fitIds: string[]) {
    const res = await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "productFits",
        id: productId,
        data: { fitIds },
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Failed to update product fits");
    }
    await fetchCatalog();
  }

  async function toggleProductFitLink(productId: string, currentFitIds: string[], targetFitId: string) {
    const isLinked = currentFitIds.includes(targetFitId);
    const newFitIds = isLinked
      ? currentFitIds.filter((id) => id !== targetFitId)
      : [...currentFitIds, targetFitId];

    try {
      const res = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "productFits",
          id: productId,
          data: { fitIds: newFitIds },
        }),
      });
      if (res.ok) fetchCatalog();
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleFabricActive(fabricId: string, currentActive: boolean) {
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "fabric",
          id: fabricId,
          data: { active: !currentActive },
        }),
      });
      if (res.ok) fetchCatalog();
    } catch (e) {
      console.error(e);
    }
  }

  if (isAuthenticated === false) {
    return (
      <main className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-[#1A2233] mb-2">Admin Access Required</h1>
          <p className="text-sm text-[#5B6B85] mb-6">
            Please authenticate via the Corporate Access Gate at /admin to manage catalog settings.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded"
          >
            Go to Admin Login →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow bg-[#F5F7FA] text-[#1A2233] font-sans">
        <div className="w-full max-w-container-max mx-auto px-4 md:px-8 py-10">
          {/* Header */}
          <div className="mb-8 gap-4 border-b border-[#D1D5DB] pb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1A2233]">
              Category → Subcategory → Product Management
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#D1D5DB] mb-8 gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "catalog"
                  ? "border-[#2E5AAC] text-[#2E5AAC]"
                  : "border-transparent text-[#5B6B85] hover:text-[#1A2233]"
              }`}
            >
              Catalog &amp; Two-Tier MOQs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fits")}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "fits"
                  ? "border-[#2E5AAC] text-[#2E5AAC]"
                  : "border-transparent text-[#5B6B85] hover:text-[#1A2233]"
              }`}
            >
              Garment Fits
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sizing")}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "sizing"
                  ? "border-[#2E5AAC] text-[#2E5AAC]"
                  : "border-transparent text-[#5B6B85] hover:text-[#1A2233]"
              }`}
            >
              Regional Size Systems
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fabrics")}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "fabrics"
                  ? "border-[#2E5AAC] text-[#2E5AAC]"
                  : "border-transparent text-[#5B6B85] hover:text-[#1A2233]"
              }`}
            >
              Product Fabrics &amp; Ranges
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#5B6B85]">Loading catalog settings…</div>
          ) : error ? (
            <div className="p-4 bg-[#FCEBEB] text-[#A32D2D] rounded text-sm">{error}</div>
          ) : (
            <>
              {/* TAB 1: Category -> Subcategory -> Product */}
              {activeTab === "catalog" && (
                <div className="space-y-8">
                  {/* Category Section Action Header */}
                  <div className="bg-white border border-[#D1D5DB] rounded-lg p-5 flex items-center justify-between shadow-sm">
                    <div>
                      <h2 className="text-base font-bold text-[#1A2233]">Master Garment Hierarchy</h2>
                      <p className="text-xs text-[#5B6B85] mt-0.5">
                        Define 3-level product structure, custom fabric lines, and two-tier MOQs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCatName("");
                        setCatSlug("");
                        setCatDesc("");
                        setCatImageUrl(null);
                        setCatError(null);
                        setShowAddCategoryModal(true);
                      }}
                      className="min-h-[44px] bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">add_circle</span>
                      <span>+ Add Category</span>
                    </button>
                  </div>

                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-white border border-[#D1D5DB] rounded-lg p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E5E7EB] pb-4 mb-6 gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-[#1A2233]">{cat.name}</h2>
                            <span className="text-xs font-mono text-[#5B6B85] bg-[#F5F7FA] px-2 py-0.5 rounded border border-[#E5E7EB]">
                              slug: {cat.slug}
                            </span>
                          </div>
                          <p className="text-xs text-[#5B6B85] mt-0.5">{cat.description || "No description"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSubName("");
                            setSubSlug("");
                            setSubDesc("");
                            setSubSizeSystemIds([]);
                            setSubImageUrl(null);
                            setSubError(null);
                            setAddSubcategoryCategory(cat);
                          }}
                          className="min-h-[44px] bg-white border border-[#2E5AAC] text-[#2E5AAC] hover:bg-[#E6F1FB] text-xs font-semibold px-4 py-2.5 rounded transition-colors inline-flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                          <span>+ Add Subcategory</span>
                        </button>
                      </div>

                      <div className="space-y-6">
                        {cat.subcategories.map((sub) => (
                          <div key={sub.id} className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F5F7FA]/50">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 border-b border-[#E5E7EB] pb-3 gap-3">
                              <div>
                                <h3 className="text-base font-bold text-[#1A2233] flex items-center gap-2">
                                  <span>{sub.name}</span>
                                  <span className="text-xs font-normal text-[#5B6B85]">
                                    ({sub.products.length} {sub.products.length === 1 ? "product" : "products"})
                                  </span>
                                </h3>
                                <span className="text-xs font-mono text-[#5B6B85]">slug: {sub.slug}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setProdName("");
                                  setProdSlug("");
                                  setProdDesc("");
                                  setProdLeadTime(14);
                                  setProdMoqPerFabric(50);
                                  setProdMoqCombined("");
                                  setProdFabricName("");
                                  setProdPriceMinDollars("19.50");
                                  setProdPriceMaxDollars("24.00");
                                  setProdSetupFeeDollars("0.00");
                                  setProdFitIds([]);
                                  setProdImageUrl(null);
                                  setProdError(null);
                                  setAddProductContext({ cat, sub });
                                }}
                                className="min-h-[36px] bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 shadow-sm"
                              >
                                <span className="material-symbols-outlined text-sm">add</span>
                                <span>+ Add Product</span>
                              </button>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse bg-white border border-[#E5E7EB] rounded">
                                <thead>
                                  <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[#5B6B85] uppercase font-semibold">
                                    <th className="p-3">Product Item</th>
                                    <th className="p-3">Single-Fabric MOQ</th>
                                    <th className="p-3">Combined Multi-Fabric MOQ</th>
                                    <th className="p-3">Fits</th>
                                    <th className="p-3 text-right">Status / Edit MOQs</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                  {sub.products.map((prod) => {
                                    const isEditingThis = editingProductId === prod.id;

                                    return (
                                      <tr key={prod.id} className="hover:bg-[#F5F7FA]/60">
                                        <td className="p-3 font-semibold text-[#1A2233]">
                                          <div>{prod.name}</div>
                                          <div className="text-[11px] font-mono text-[#5B6B85]">/{prod.slug}</div>
                                        </td>
                                        <td className="p-3 font-semibold text-[#2E5AAC]">
                                          {prod.moqPerFabric ?? prod.moq ?? 50} pcs
                                        </td>
                                        <td className="p-3 font-medium text-[#1A2233]">
                                          {prod.moqCombinedMultiFabric ? `${prod.moqCombinedMultiFabric} pcs` : "N/A"}
                                        </td>
                                        <td className="p-3">
                                          {prod.fits.length === 0 ? (
                                            <span className="text-[#5B6B85] italic text-[11px]">Excluded (0)</span>
                                          ) : (
                                            <div className="flex flex-wrap gap-1">
                                              {prod.fits.map((pf) => (
                                                <span key={pf.fit.id} className="bg-[#E6F1FB] text-[#185FA5] text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                                  {pf.fit.name}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </td>
                                        <td className="p-3 text-right">
                                          {isEditingThis ? (
                                            <div className="flex items-center justify-end gap-2">
                                              <input
                                                type="number"
                                                className="w-16 border rounded px-1.5 py-1 text-xs"
                                                title="Single Fabric MOQ"
                                                value={editMoqPerFabric}
                                                onChange={(e) => setEditMoqPerFabric(parseInt(e.target.value, 10))}
                                              />
                                              <input
                                                type="number"
                                                className="w-16 border rounded px-1.5 py-1 text-xs"
                                                placeholder="Combined"
                                                title="Combined Multi-Fabric MOQ"
                                                value={editMoqCombined}
                                                onChange={(e) => setEditMoqCombined(e.target.value)}
                                              />
                                              <button
                                                type="button"
                                                onClick={() => saveProductMoqs(prod.id)}
                                                className="bg-[#0F6E56] text-white px-2 py-1 rounded text-[11px] font-semibold"
                                              >
                                                Save
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setEditingProductId(null)}
                                                className="border text-[#5B6B85] px-2 py-1 rounded text-[11px]"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-end gap-2">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingProductId(prod.id);
                                                  setEditMoqPerFabric(prod.moqPerFabric ?? prod.moq ?? 50);
                                                  setEditMoqCombined(prod.moqCombinedMultiFabric ? String(prod.moqCombinedMultiFabric) : "");
                                                }}
                                                className="border border-[#D1D5DB] bg-white hover:bg-[#F5F7FA] px-2 py-1 rounded text-[11px] font-semibold text-[#2E5AAC]"
                                              >
                                                Edit MOQs
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => toggleProductActive(prod.id, prod.active)}
                                                className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                                                  prod.active
                                                    ? "bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#A6E5CE]"
                                                    : "bg-[#FCEBEB] text-[#A32D2D] hover:bg-[#F7C5C5]"
                                                }`}
                                              >
                                                {prod.active ? "Active" : "Off"}
                                              </button>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: Garment Fits Management */}
              {activeTab === "fits" && (
                <div className="space-y-6">
                  <ProductFitTree
                    categories={categories}
                    totalFitsCount={allFits.length || 8}
                    selectedProductId={selectedFitProductContext?.product.id || null}
                    onSelectProduct={(prod, catName, subName) => {
                      setSelectedFitProductContext({
                        product: prod,
                        categoryName: catName,
                        subcategoryName: subName,
                      });
                    }}
                  />

                  <GarmentFitsPanel
                    isOpen={!!selectedFitProductContext}
                    product={selectedFitProductContext?.product || null}
                    categoryName={selectedFitProductContext?.categoryName || ""}
                    subcategoryName={selectedFitProductContext?.subcategoryName || ""}
                    allFits={allFits}
                    onClose={() => setSelectedFitProductContext(null)}
                    onSave={handleSaveProductFits}
                  />
                </div>
              )}

              {/* TAB 3: Regional Size Systems */}
              {activeTab === "sizing" && (
                <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-[#1A2233]">
                    Active CAD Sizing Standards &amp; Options
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sizeSystems.map((sys) => (
                      <div key={sys.id} className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F5F7FA]/50">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-sm text-[#1A2233]">{sys.name}</h3>
                          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-[#E6F1FB] text-[#185FA5] rounded">
                            {sys.region} Region
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {sys.options.map((opt) => (
                            <span key={opt.id} className="bg-white border border-[#D1D5DB] text-xs font-semibold px-2 py-1 rounded text-[#1A2233]">
                              {opt.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Fabrics & Pricing */}
              {activeTab === "fabrics" && (
                <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-[#1A2233]">
                    Fabric Cost Tiering &amp; Setup Fee Configuration
                  </h2>
                  <div className="space-y-4">
                    {categories.flatMap((c) => c.subcategories.flatMap((s) => s.products.flatMap((p) => p.fabrics))).map((fab) => (
                      <div key={fab.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-[#E5E7EB] rounded bg-white gap-4">
                        <div>
                          <div className="font-bold text-sm text-[#1A2233]">{fab.name}</div>
                          <div className="text-xs text-[#5B6B85]">
                            Price Range: ${(fab.priceMinCents / 100).toFixed(2)} - ${(fab.priceMaxCents / 100).toFixed(2)} / unit | Setup Fee: ${(fab.setupFeeCents / 100).toFixed(2)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFabricActive(fab.id, fab.active)}
                          className={`min-h-[36px] px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                            fab.active
                              ? "bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#A6E5CE]"
                              : "bg-[#FCEBEB] text-[#A32D2D] hover:bg-[#F7C5C5]"
                          }`}
                        >
                          {fab.active ? "Active" : "Off"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      {/* --- MODAL 1: ADD CATEGORY --- */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-[#0B1E3D]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 max-w-md w-full shadow-lg space-y-5">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#1A2233] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2E5AAC]">add_circle</span>
                <span>Add New Category</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="text-[#5B6B85] hover:text-[#1A2233] min-h-[32px] px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label htmlFor="catName" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                  Category Name *
                </label>
                <input
                  id="catName"
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    setCatSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. Footwear"
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="catSlug" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                  Category Slug *
                </label>
                <input
                  id="catSlug"
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(slugify(e.target.value))}
                  placeholder="e.g. footwear"
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm font-mono text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="catDesc" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                  Description
                </label>
                <textarea
                  id="catDesc"
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Optional category summary..."
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                />
              </div>

              <CatalogImageUploader
                imageUrl={catImageUrl}
                onImageUrlChange={setCatImageUrl}
                label="Category Image"
              />

              {catError && (
                <div className="p-3 bg-[#FCE8E6] border border-[#F8B4B4] rounded text-xs text-[#C5221F] font-semibold">
                  {catError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#5B6B85] bg-[#F5F7FA] border border-[#D1D5DB] hover:bg-[#E5E7EB] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={catSubmitting}
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-[#2E5AAC] hover:bg-[#1E3F7A] disabled:opacity-50 rounded shadow-sm"
                >
                  {catSubmitting ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD SUBCATEGORY --- */}
      {addSubcategoryCategory && (
        <div className="fixed inset-0 bg-[#0B1E3D]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 max-w-md w-full shadow-lg space-y-5">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#1A2233] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2E5AAC]">add</span>
                <span>Add Subcategory to {addSubcategoryCategory.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setAddSubcategoryCategory(null)}
                className="text-[#5B6B85] hover:text-[#1A2233] min-h-[32px] px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubcategory} className="space-y-4">
              <div>
                <label htmlFor="subName" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                  Subcategory Name *
                </label>
                <input
                  id="subName"
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => {
                    setSubName(e.target.value);
                    setSubSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. Hoodies & Sweatshirts"
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="subSlug" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                  Subcategory Slug *
                </label>
                <input
                  id="subSlug"
                  type="text"
                  required
                  value={subSlug}
                  onChange={(e) => setSubSlug(slugify(e.target.value))}
                  placeholder="e.g. hoodies-sweatshirts"
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm font-mono text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="subDesc" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                  Description
                </label>
                <textarea
                  id="subDesc"
                  rows={2}
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  placeholder="Optional subcategory summary..."
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                />
              </div>

              <CatalogImageUploader
                imageUrl={subImageUrl}
                onImageUrlChange={setSubImageUrl}
                label="Subcategory Image"
              />

              {sizeSystems.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1.5">
                    Link Size Systems
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto border border-[#E5E7EB] p-2 rounded bg-[#F5F7FA]">
                    {sizeSystems.map((sys) => {
                      const isChecked = subSizeSystemIds.includes(sys.id);

                      return (
                        <label key={sys.id} className="flex items-center gap-2 text-xs text-[#1A2233] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSubSizeSystemIds([...subSizeSystemIds, sys.id]);
                              } else {
                                setSubSizeSystemIds(subSizeSystemIds.filter((id) => id !== sys.id));
                              }
                            }}
                            className="rounded border-[#D1D5DB] text-[#2E5AAC]"
                          />
                          <span>{sys.name} ({sys.region})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {subError && (
                <div className="p-3 bg-[#FCE8E6] border border-[#F8B4B4] rounded text-xs text-[#C5221F] font-semibold">
                  {subError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddSubcategoryCategory(null)}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#5B6B85] bg-[#F5F7FA] border border-[#D1D5DB] hover:bg-[#E5E7EB] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subSubmitting}
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-[#2E5AAC] hover:bg-[#1E3F7A] disabled:opacity-50 rounded shadow-sm"
                >
                  {subSubmitting ? "Creating..." : "Create Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ADD PRODUCT --- */}
      {addProductContext && (
        <div className="fixed inset-0 bg-[#0B1E3D]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 max-w-xl w-full shadow-lg space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2E5AAC]">
                  {addProductContext.cat.name} → {addProductContext.sub.name}
                </div>
                <h3 className="text-base font-bold text-[#1A2233]">Add New Product Item</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddProductContext(null)}
                className="text-[#5B6B85] hover:text-[#1A2233] min-h-[32px] px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-5">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prodName" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                    Product Name *
                  </label>
                  <input
                    id="prodName"
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => {
                      setProdName(e.target.value);
                      setProdSlug(slugify(e.target.value));
                    }}
                    placeholder="e.g. Oxford Dress Shirt"
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label htmlFor="prodSlug" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                    Product Slug *
                  </label>
                  <input
                    id="prodSlug"
                    type="text"
                    required
                    value={prodSlug}
                    onChange={(e) => setProdSlug(slugify(e.target.value))}
                    placeholder="e.g. oxford-dress-shirt"
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm font-mono text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prodDesc" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                  Product Description
                </label>
                <textarea
                  id="prodDesc"
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Custom garment specifications and weave detail..."
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                />
              </div>

              <CatalogImageUploader
                imageUrl={prodImageUrl}
                onImageUrlChange={setProdImageUrl}
                label="Product Image"
              />

              {/* MOQ & Production Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#E5E7EB] pt-4">
                <div>
                  <label htmlFor="prodLeadTime" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                    Lead Time (Days)
                  </label>
                  <input
                    id="prodLeadTime"
                    type="number"
                    min={1}
                    value={prodLeadTime}
                    onChange={(e) => setProdLeadTime(parseInt(e.target.value, 10) || 14)}
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] min-h-[44px]"
                  />
                </div>
                <div>
                  <label htmlFor="prodMoqPerFabric" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                    Single-Fabric MOQ *
                  </label>
                  <input
                    id="prodMoqPerFabric"
                    type="number"
                    min={1}
                    required
                    value={prodMoqPerFabric}
                    onChange={(e) => setProdMoqPerFabric(parseInt(e.target.value, 10) || 50)}
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] min-h-[44px]"
                  />
                </div>
                <div>
                  <label htmlFor="prodMoqCombined" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                    Combined Multi-Fabric MOQ
                  </label>
                  <input
                    id="prodMoqCombined"
                    type="number"
                    min={1}
                    placeholder="Optional (e.g. 150)"
                    value={prodMoqCombined}
                    onChange={(e) => setProdMoqCombined(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] min-h-[44px]"
                  />
                </div>
              </div>

              {/* Initial Fabric Option */}
              <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E5AAC]">
                  Initial Fabric Option (Required for Configurator)
                </h4>
                <div>
                  <label htmlFor="prodFabricName" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                    Fabric Line Name *
                  </label>
                  <input
                    id="prodFabricName"
                    type="text"
                    required
                    value={prodFabricName}
                    onChange={(e) => setProdFabricName(e.target.value)}
                    placeholder="e.g. 100% Egyptian Giza Cotton (140/2 Twill)"
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="priceMin" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                      Min Price ($) *
                    </label>
                    <input
                      id="priceMin"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={prodPriceMinDollars}
                      onChange={(e) => setProdPriceMinDollars(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="priceMax" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                      Max Price ($) *
                    </label>
                    <input
                      id="priceMax"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={prodPriceMaxDollars}
                      onChange={(e) => setProdPriceMaxDollars(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="setupFee" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                      Setup Fee ($)
                    </label>
                    <input
                      id="setupFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={prodSetupFeeDollars}
                      onChange={(e) => setProdSetupFeeDollars(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Fit Assignment */}
              {allFits.length > 0 && (
                <div className="border-t border-[#E5E7EB] pt-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-2">
                    Allowed Garment Fits (Kalıp)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allFits.map((fit) => {
                      const isChecked = prodFitIds.includes(fit.id);

                      return (
                        <label
                          key={fit.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs cursor-pointer select-none transition-colors ${
                            isChecked
                              ? "bg-[#E6F1FB] border-[#2E5AAC] text-[#185FA5] font-semibold"
                              : "bg-white border-[#D1D5DB] text-[#5B6B85] hover:border-[#94A3B8]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProdFitIds([...prodFitIds, fit.id]);
                              } else {
                                setProdFitIds(prodFitIds.filter((id) => id !== fit.id));
                              }
                            }}
                            className="h-3.5 w-3.5 text-[#2E5AAC] rounded border-[#D1D5DB]"
                          />
                          <span>{fit.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {prodError && (
                <div className="p-3 bg-[#FCE8E6] border border-[#F8B4B4] rounded text-xs text-[#C5221F] font-semibold">
                  {prodError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddProductContext(null)}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#5B6B85] bg-[#F5F7FA] border border-[#D1D5DB] hover:bg-[#E5E7EB] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={prodSubmitting}
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-[#2E5AAC] hover:bg-[#1E3F7A] disabled:opacity-50 rounded shadow-sm"
                >
                  {prodSubmitting ? "Creating Product..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
