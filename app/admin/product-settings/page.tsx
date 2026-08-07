"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CatalogImageUploader } from "@/components/admin/CatalogImageUploader";
import { ProductFitTree } from "@/components/admin/ProductFitTree";
import { GarmentFitsPanel } from "@/components/admin/GarmentFitsPanel";
import { RegionalSizeTree } from "@/components/admin/RegionalSizeTree";
import { RegionalSizePanel } from "@/components/admin/RegionalSizePanel";
import { FabricPricingTree, FabricItem } from "@/components/admin/FabricPricingTree";
import { FabricPricingPanel } from "@/components/admin/FabricPricingPanel";
import { FabricColorTree, FabricWithColors, CategoryWithColors } from "@/components/admin/FabricColorTree";
import { FabricColorPanel } from "@/components/admin/FabricColorPanel";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

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
  setupFeeCents?: number;
  active: boolean;
  colors?: Array<{
    id: string;
    fabricId: string;
    name: string;
    hex: string | null;
    source: "PLACEHOLDER" | "SUPPLIER_VERIFIED" | "MANUAL";
    active: boolean;
    sortOrder: number;
  }>;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
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

function ProductSettingsContent() {
  const { isAuthenticated } = useAdminAuth();
  const { t } = useAdminLanguage();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") as "catalog" | "sizing" | "fits" | "fabrics" | "colourways" | null;

  const [categories, setCategories] = useState<Category[]>([]);
  const [sizeSystems, setSizeSystems] = useState<SizeSystem[]>([]);
  const [allFits, setAllFits] = useState<FitDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit MOQ state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editMoqPerFabric, setEditMoqPerFabric] = useState<number>(50);
  const [editMoqCombined, setEditMoqCombined] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"catalog" | "sizing" | "fits" | "fabrics" | "colourways">(
    tabParam || "catalog"
  );

  // Colourways Tab State
  const [selectedColourwaysFabric, setSelectedColourwaysFabric] = useState<FabricWithColors | null>(null);
  const [selectedColourwaysProdName, setSelectedColourwaysProdName] = useState<string>("");
  const [selectedColourwaysCatName, setSelectedColourwaysCatName] = useState<string>("");
  const [selectedColourwaysSubName, setSelectedColourwaysSubName] = useState<string>("");

  // Initial Colors State (for Add Product Modal)
  const [showInitialColors, setShowInitialColors] = useState<boolean>(false);
  const [initialColors, setInitialColors] = useState<Array<{ name: string; hex: string }>>([]);

  // Edit Product Modal State
  const [editProductContext, setEditProductContext] = useState<{
    prod: Product;
    cat: Category;
    sub: Subcategory;
  } | null>(null);
  const [editProdName, setEditProdName] = useState("");
  const [editProdSlug, setEditProdSlug] = useState("");
  const [editProdDesc, setEditProdDesc] = useState("");
  const [editProdImageUrl, setEditProdImageUrl] = useState<string | null>(null);
  const [editProdLeadTime, setEditProdLeadTime] = useState(14);
  const [savingProductEdit, setSavingProductEdit] = useState(false);

  useEffect(() => {
    if (tabParam && ["catalog", "sizing", "fits", "fabrics", "colourways"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Catalog tab accordion state (default collapsed, matches Garment Fits tree pattern)
  const [openCategoryIds, setOpenCategoryIds] = useState<Record<string, boolean>>({});
  const [openSubcategoryIds, setOpenSubcategoryIds] = useState<Record<string, boolean>>({});

  function toggleCategoryOpen(catId: string) {
    setOpenCategoryIds((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }

  function toggleSubcategoryOpen(subId: string) {
    setOpenSubcategoryIds((prev) => ({ ...prev, [subId]: !prev[subId] }));
  }

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

  // Regional Size System Slide-Over Panel Context State
  const [selectedSizeSystem, setSelectedSizeSystem] = useState<SizeSystem | null>(null);

  async function handleSaveSizeSystemSubcategories(
    sizeSystemId: string,
    assignedSubcategoryIds: string[]
  ) {
    const res = await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "sizeSystemSubcategories",
        id: sizeSystemId,
        data: { subcategoryIds: assignedSubcategoryIds },
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save size system mapping.");
    }

    await fetchCatalog();
  }

  // Fabric Pricing Slide-Over Panel Context State
  const [selectedFabric, setSelectedFabric] = useState<FabricItem | null>(null);

  // Flatten fabrics across categories -> subcategories -> products with parent context
  const allFabricsWithContext: FabricItem[] = categories.flatMap((cat) =>
    cat.subcategories.flatMap((sub) =>
      sub.products.flatMap((prod) =>
        prod.fabrics.map((fab) => ({
          ...fab,
          productId: prod.id,
          productName: prod.name,
          subcategoryName: sub.name,
          categoryName: cat.name,
        }))
      )
    )
  );

  async function handleToggleFabricActive(fabricId: string, currentActive: boolean) {
    const res = await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "fabric",
        id: fabricId,
        data: { active: !currentActive },
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update fabric status.");
    }

    await fetchCatalog();
  }

  async function handleSaveFabric(
    fabricId: string,
    updatedData: {
      name: string;
      colorway?: string | null;
      priceMinCents: number;
      priceMaxCents: number;
      setupFeeCents: number;
      active: boolean;
    }
  ) {
    const res = await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "fabric",
        id: fabricId,
        data: updatedData,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update fabric configuration.");
    }

    await fetchCatalog();
  }

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
              setupFeeCents: 0,
            },
            initialColors: showInitialColors ? initialColors : [],
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
      setShowInitialColors(false);
      setInitialColors([]);
      setAddProductContext(null);
      fetchCatalog();
    } catch {
      setProdError("Network error creating product.");
    } finally {
      setProdSubmitting(false);
    }
  }

  function openEditProductModal(prod: Product, cat: Category, sub: Subcategory) {
    setEditProductContext({ prod, cat, sub });
    setEditProdName(prod.name);
    setEditProdSlug(prod.slug);
    setEditProdDesc(prod.description || "");
    setEditProdImageUrl(prod.imageUrl || "");
    setEditProdLeadTime(prod.leadTimeDays || 14);
  }

  async function handleSaveProductEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editProductContext) return;

    setSavingProductEdit(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "product",
          id: editProductContext.prod.id,
          data: {
            name: editProdName,
            slug: editProdSlug,
            description: editProdDesc,
            imageUrl: editProdImageUrl,
            leadTimeDays: editProdLeadTime,
          },
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to update product.");
        return;
      }

      setEditProductContext(null);
      fetchCatalog();
    } catch {
      alert("Network error updating product.");
    } finally {
      setSavingProductEdit(false);
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
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex items-center justify-center p-4 transition-colors">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-8 max-w-md w-full text-center shadow-sm">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Admin Access Required</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Please authenticate via the Corporate Access Gate at /admin to manage catalog settings.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-none transition-colors"
          >
            Go to Admin Login →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans transition-colors">
        <div className="w-full max-w-container-max mx-auto px-4 md:px-8 py-8 space-y-6">

          {/* Navigation Tabs */}
          <div className="flex border-b border-[var(--color-border)] mb-8 gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "catalog"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.garmentCatalog}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fits")}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "fits"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.garmentFits}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sizing")}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "sizing"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.regionalSizing}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fabrics")}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "fabrics"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.fabricPricing}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("colourways")}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "colourways"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.addColor}
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[var(--color-text-secondary)]">Loading catalog settings…</div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 text-red-500 rounded-none border border-red-500/20 text-sm">{error}</div>
          ) : (
            <>
              {/* TAB 1: Category -> Subcategory -> Product */}
              {activeTab === "catalog" && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none overflow-hidden font-sans transition-colors">
                  {/* Top Header Bar */}
                  <div className="p-4 sm:p-5 border-b border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-bg)]">
                    <div>
                      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{t.masterGarmentHierarchyTitle}</h2>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {t.masterGarmentHierarchySub}
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
                      className="min-h-[44px] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold px-4 py-2.5 rounded-none transition-colors inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">add_circle</span>
                      <span>{t.addCategoryBtn}</span>
                    </button>
                  </div>

                  {/* Category Accordion Tree */}
                  <div className="divide-y divide-[var(--color-border)]">
                    {categories.map((cat) => {
                      const isCatOpen = !!openCategoryIds[cat.id];
                      const subSummary =
                        cat.subcategories.length > 0
                          ? cat.subcategories.map((s) => s.name).join(", ")
                          : "No subcategories yet";

                      return (
                        <div key={cat.id} className="bg-[var(--color-surface)]">
                          {/* Category Accordion Header */}
                          <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[var(--color-bg)] hover:bg-[var(--color-surface)] transition-colors border-b border-[var(--color-border)]">
                            <button
                              type="button"
                              onClick={() => toggleCategoryOpen(cat.id)}
                              className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                            >
                              <svg
                                className={`w-4 h-4 flex-shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${
                                  isCatOpen ? "rotate-0" : "-rotate-90"
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                                    {cat.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-[var(--color-text-secondary)] bg-[var(--color-surface)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-none">
                                    slug: {cat.slug}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">{subSummary}</p>
                              </div>
                            </button>

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
                              className="min-h-[36px] flex-shrink-0 bg-[var(--color-surface)] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 text-xs font-semibold px-3 py-1.5 rounded-none transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                              <span>{t.addSubcategoryBtn}</span>
                            </button>
                          </div>

                          {/* Subcategories */}
                          {isCatOpen && (
                            <div className="divide-y divide-[var(--color-border)]">
                              {cat.subcategories.map((sub) => {
                                const isSubOpen = !!openSubcategoryIds[sub.id];

                                return (
                                  <div key={sub.id} className="bg-[var(--color-surface)]">
                                    <div className="flex items-center justify-between gap-3 pl-11 pr-5 py-3 hover:bg-[var(--color-bg)]/60 transition-colors">
                                      <button
                                        type="button"
                                        onClick={() => toggleSubcategoryOpen(sub.id)}
                                        className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                                      >
                                        <svg
                                          className={`w-3.5 h-3.5 flex-shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${
                                            isSubOpen ? "rotate-0" : "-rotate-90"
                                          }`}
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                        <span className="text-xs font-bold text-[var(--color-text-primary)] bg-[var(--color-bg)] px-2 py-0.5 rounded-none border border-[var(--color-border)]">
                                          {sub.name}
                                        </span>
                                        <span className="text-[11px] text-[var(--color-text-secondary)]">
                                          ({sub.products.length} {sub.products.length === 1 ? "product" : "products"})
                                        </span>
                                        <span className="text-[10px] font-mono text-[var(--color-text-secondary)] hidden sm:inline">
                                          slug: {sub.slug}
                                        </span>
                                      </button>

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
                                        className="min-h-[32px] flex-shrink-0 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-none transition-colors inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        <span>Add Product</span>
                                      </button>
                                    </div>

                                    {isSubOpen && (
                                      <div className="pl-11 pr-5 pb-4">
                                        <div className="overflow-x-auto border border-[var(--color-border)] rounded-none">
                                          <table className="w-full text-left text-xs">
                                            <thead className="bg-[var(--color-bg)] text-[var(--color-text-primary)] font-semibold border-b border-[var(--color-border)] uppercase text-[11px]">
                                              <tr>
                                                <th className="py-2.5 px-4">Product Item</th>
                                                <th className="py-2.5 px-4">Single-Fabric MOQ</th>
                                                <th className="py-2.5 px-4">Combined Multi-Fabric MOQ</th>
                                                <th className="py-2.5 px-4">Fits</th>
                                                <th className="py-2.5 px-4 text-right">Status / Edit MOQs</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-primary)]">
                                              {sub.products.map((prod) => {
                                                const isEditingThis = editingProductId === prod.id;

                                                return (
                                                  <tr key={prod.id} className="hover:bg-[var(--color-bg)]/50 transition-colors">
                                                    <td className="py-2.5 px-4 font-semibold text-[var(--color-text-primary)]">
                                                      <div>{prod.name}</div>
                                                      <div className="text-[11px] font-mono text-[var(--color-text-secondary)]">/{prod.slug}</div>
                                                    </td>
                                                    <td className="py-2.5 px-4 font-semibold text-[var(--color-text-primary)]">
                                                      {prod.moqPerFabric ?? prod.moq ?? 50} pcs
                                                    </td>
                                                    <td className="py-2.5 px-4 font-medium text-[var(--color-text-secondary)]">
                                                      {prod.moqCombinedMultiFabric ? `${prod.moqCombinedMultiFabric} pcs` : "N/A"}
                                                    </td>
                                                    <td className="py-2.5 px-4">
                                                      {prod.fits.length === 0 ? (
                                                        <span className="text-[var(--color-text-secondary)] italic text-[11px]">Excluded (0)</span>
                                                      ) : (
                                                        <div className="flex flex-wrap gap-1">
                                                          {prod.fits.map((pf) => (
                                                            <span
                                                              key={pf.fit.id}
                                                              className="bg-[var(--color-bg)] text-[var(--color-text-primary)] text-[10px] font-semibold px-1.5 py-0.5 rounded-none border border-[var(--color-border)]"
                                                            >
                                                              {pf.fit.name}
                                                            </span>
                                                          ))}
                                                        </div>
                                                      )}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-right">
                                                      {isEditingThis ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                          <input
                                                            type="number"
                                                            className="w-16 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-none px-1.5 py-1 text-xs focus:outline-none focus:border-[var(--color-accent)]"
                                                            title="Single Fabric MOQ"
                                                            value={editMoqPerFabric}
                                                            onChange={(e) => setEditMoqPerFabric(parseInt(e.target.value, 10))}
                                                          />
                                                          <input
                                                            type="number"
                                                            className="w-16 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-none px-1.5 py-1 text-xs focus:outline-none focus:border-[var(--color-accent)]"
                                                            placeholder="Combined"
                                                            title="Combined Multi-Fabric MOQ"
                                                            value={editMoqCombined}
                                                            onChange={(e) => setEditMoqCombined(e.target.value)}
                                                          />
                                                          <button
                                                            type="button"
                                                            onClick={() => saveProductMoqs(prod.id)}
                                                            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-2 py-1 rounded-none text-[11px] font-semibold transition-colors cursor-pointer"
                                                          >
                                                            Save
                                                          </button>
                                                          <button
                                                            type="button"
                                                            onClick={() => setEditingProductId(null)}
                                                            className="border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] px-2 py-1 rounded-none text-[11px] transition-colors cursor-pointer"
                                                          >
                                                            Cancel
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                          <button
                                                            type="button"
                                                            onClick={() => openEditProductModal(prod, cat, sub)}
                                                            className="text-[#2E5AAC] hover:text-[#1E3F7A] hover:underline px-1 py-1 text-[11px] font-semibold transition-colors"
                                                          >
                                                            Edit Product
                                                          </button>
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              setEditingProductId(prod.id);
                                                              setEditMoqPerFabric(prod.moqPerFabric ?? prod.moq ?? 50);
                                                              setEditMoqCombined(prod.moqCombinedMultiFabric ? String(prod.moqCombinedMultiFabric) : "");
                                                            }}
                                                            className="text-[#2E5AAC] hover:text-[#1E3F7A] hover:underline px-1 py-1 text-[11px] font-semibold transition-colors"
                                                          >
                                                            Edit MOQs
                                                          </button>
                                                          <button
                                                            type="button"
                                                            onClick={() => toggleProductActive(prod.id, prod.active)}
                                                            className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-colors ${
                                                              prod.active
                                                                ? "bg-[#ECFDF3] text-[#067647] border-[#ABE5C6] hover:bg-[#D1FADF]"
                                                                : "bg-[#F2F4F7] text-[#475467] border-[#D0D5DD] hover:bg-[#EAECF0]"
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
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
                <div className="space-y-6">
                  <RegionalSizeTree
                    sizeSystems={sizeSystems}
                    subcategories={categories.flatMap((cat) =>
                      cat.subcategories.map((sub) => ({
                        ...sub,
                        categoryName: cat.name,
                      }))
                    )}
                    selectedSizeSystemId={selectedSizeSystem?.id || null}
                    onSelectSizeSystem={(sys) => setSelectedSizeSystem(sys)}
                  />

                  <RegionalSizePanel
                    isOpen={selectedSizeSystem !== null}
                    sizeSystem={selectedSizeSystem}
                    categories={categories}
                    onClose={() => setSelectedSizeSystem(null)}
                    onSave={handleSaveSizeSystemSubcategories}
                  />
                </div>
              )}

              {/* TAB 4: Fabrics & Pricing */}
              {activeTab === "fabrics" && (
                <div className="space-y-6">
                  <FabricPricingTree
                    fabrics={allFabricsWithContext}
                    selectedFabricId={selectedFabric?.id || null}
                    onSelectFabric={(fab) => setSelectedFabric(fab)}
                    onToggleActive={handleToggleFabricActive}
                  />

                  <FabricPricingPanel
                    isOpen={selectedFabric !== null}
                    fabric={selectedFabric}
                    onClose={() => setSelectedFabric(null)}
                    onSave={handleSaveFabric}
                  />
                </div>
              )}

              {/* TAB 5: Colourways Admin CRUD */}
              {activeTab === "colourways" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5">
                    <FabricColorTree
                      categories={categories as unknown as CategoryWithColors[]}
                      selectedFabricId={selectedColourwaysFabric?.id || null}
                      onSelectFabric={(fab, prodName, catName, subName) => {
                        setSelectedColourwaysFabric(fab);
                        setSelectedColourwaysProdName(prodName);
                        setSelectedColourwaysCatName(catName);
                        setSelectedColourwaysSubName(subName);
                      }}
                    />
                  </div>

                  <div className="lg:col-span-7">
                    <FabricColorPanel
                      fabric={selectedColourwaysFabric}
                      productName={selectedColourwaysProdName}
                      categoryName={selectedColourwaysCatName}
                      subcategoryName={selectedColourwaysSubName}
                      onRefresh={fetchCatalog}
                    />
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
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#5B6B85] bg-[#F5F7FA] border border-[#D1D5DB] hover:bg-[#E5E7EB] rounded cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={catSubmitting}
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-[#2E5AAC] hover:bg-[#1E3F7A] disabled:opacity-50 rounded shadow-sm cursor-pointer"
                >
                  {catSubmitting ? t.creating : t.addCategoryBtn}
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
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#5B6B85] bg-[#F5F7FA] border border-[#D1D5DB] hover:bg-[#E5E7EB] rounded cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={subSubmitting}
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-[#2E5AAC] hover:bg-[#1E3F7A] disabled:opacity-50 rounded shadow-sm cursor-pointer"
                >
                  {subSubmitting ? t.creating : t.addSubcategoryBtn}
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

                <div className="grid grid-cols-2 gap-3">
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
                </div>
              </div>

              {/* Initial Colorways Option */}
              <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E5AAC]">
                    Initial Colorways (Optional)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowInitialColors((prev) => !prev)}
                    className="text-xs font-semibold text-[#2E5AAC] hover:underline"
                  >
                    {showInitialColors ? "– Hide Initial Colors" : "+ Add Initial Colors"}
                  </button>
                </div>

                {showInitialColors && (
                  <div className="space-y-3 bg-[#F5F7FA] border border-[#D1D5DB] rounded p-3">
                    {initialColors.map((col, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Color Name (e.g. Navy Blue)"
                          value={col.name}
                          onChange={(e) => {
                            const updated = [...initialColors];
                            updated[idx].name = e.target.value;
                            setInitialColors(updated);
                          }}
                          className="flex-grow px-3 py-1.5 bg-white border border-[#D1D5DB] rounded text-xs text-[#1A2233]"
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="color"
                            value={col.hex}
                            onChange={(e) => {
                              const updated = [...initialColors];
                              updated[idx].hex = e.target.value.toUpperCase();
                              setInitialColors(updated);
                            }}
                            className="w-7 h-7 rounded border border-[#D1D5DB] cursor-pointer p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            placeholder="#0B1E3D"
                            value={col.hex}
                            onChange={(e) => {
                              const updated = [...initialColors];
                              updated[idx].hex = e.target.value.toUpperCase();
                              setInitialColors(updated);
                            }}
                            className="w-20 px-2 py-1.5 bg-white border border-[#D1D5DB] rounded text-xs font-mono text-[#1A2233]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setInitialColors(initialColors.filter((_, i) => i !== idx));
                          }}
                          className="text-red-500 hover:text-red-700 px-1 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setInitialColors([...initialColors, { name: "", hex: "#000000" }])}
                      className="text-xs font-bold text-[#2E5AAC] hover:underline pt-1"
                    >
                      + Add Another Color
                    </button>
                  </div>
                )}
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
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#5B6B85] bg-[#F5F7FA] border border-[#D1D5DB] hover:bg-[#E5E7EB] rounded cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={prodSubmitting}
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-[#2E5AAC] hover:bg-[#1E3F7A] disabled:opacity-50 rounded shadow-sm cursor-pointer"
                >
                  {prodSubmitting ? t.creating : t.createProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: EDIT PRODUCT --- */}
      {editProductContext && (
        <div className="fixed inset-0 bg-[#0B1E3D]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 max-w-xl w-full shadow-lg space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2E5AAC]">
                  {editProductContext.cat.name} → {editProductContext.sub.name}
                </div>
                <h3 className="text-base font-bold text-[#1A2233]">Edit Product Item</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditProductContext(null)}
                className="text-[#5B6B85] hover:text-[#1A2233] min-h-[32px] px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editProdName" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                    Product Name *
                  </label>
                  <input
                    id="editProdName"
                    type="text"
                    required
                    value={editProdName}
                    onChange={(e) => setEditProdName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label htmlFor="editProdSlug" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                    Product Slug *
                  </label>
                  <input
                    id="editProdSlug"
                    type="text"
                    required
                    value={editProdSlug}
                    onChange={(e) => setEditProdSlug(slugify(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm font-mono text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="editProdDesc" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                  Product Description
                </label>
                <textarea
                  id="editProdDesc"
                  rows={2}
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                />
              </div>

              <CatalogImageUploader
                imageUrl={editProdImageUrl}
                onImageUrlChange={setEditProdImageUrl}
                label="Product Image"
              />

              <div>
                <label htmlFor="editProdLeadTime" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                  Lead Time (Days)
                </label>
                <input
                  id="editProdLeadTime"
                  type="number"
                  min={1}
                  value={editProdLeadTime}
                  onChange={(e) => setEditProdLeadTime(parseInt(e.target.value, 10) || 14)}
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] min-h-[44px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setEditProductContext(null)}
                  className="px-4 py-2 border border-[#D1D5DB] rounded text-xs font-semibold text-[#5B6B85] hover:bg-gray-50 min-h-[44px] cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingProductEdit}
                  className="px-5 py-2 bg-[#2E5AAC] text-white rounded text-xs font-bold hover:bg-[#1E3F7A] transition-colors min-h-[44px] disabled:opacity-50 cursor-pointer"
                >
                  {savingProductEdit ? t.saving : t.saveProductChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AdminProductSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#5B6B85]">Loading product settings...</div>}>
      <ProductSettingsContent />
    </Suspense>
  );
}
