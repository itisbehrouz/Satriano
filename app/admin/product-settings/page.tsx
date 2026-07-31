"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

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
  active: boolean;
  fabrics: Fabric[];
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

export default function AdminProductSettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizeSystems, setSizeSystems] = useState<SizeSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"catalog" | "sizing" | "fabrics">("catalog");

  useEffect(() => {
    async function checkSessionAndFetch() {
      try {
        const sessionRes = await fetch("/api/admin/session");
        if (sessionRes.ok) {
          const data = await sessionRes.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            fetchCatalog();
            return;
          }
        }
      } catch {
        // Auth check failed
      }
      setIsAuthenticated(false);
      setLoading(false);
    }

    checkSessionAndFetch();
  }, []);

  async function fetchCatalog() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/catalog");
      if (res.ok) {
        const json = await res.json();
        setCategories(json.categories || []);
        setSizeSystems(json.sizeSystems || []);
      } else {
        setError("Failed to load catalog settings");
      }
    } catch {
      setError("Network error loading catalog");
    } finally {
      setLoading(false);
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
      <>
        <SiteHeader />
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
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[#F5F7FA] text-[#1A2233] font-sans">
        <div className="w-full max-w-container-max mx-auto px-4 md:px-8 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-[#D1D5DB] pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2E5AAC] mb-1">
                <Link href="/admin" className="hover:underline">Admin Console</Link>
                <span>/</span>
                <span>3-Level Product Settings</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A2233]">
                Category → Subcategory → Product Management
              </h1>
            </div>

            <Link
              href="/admin"
              className="border border-[#D1D5DB] bg-white hover:bg-[#F5F7FA] text-xs font-semibold px-4 py-2.5 rounded transition-colors"
            >
              ← Back to Order Ledger
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#D1D5DB] mb-8 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "catalog"
                  ? "border-[#2E5AAC] text-[#2E5AAC]"
                  : "border-transparent text-[#5B6B85] hover:text-[#1A2233]"
              }`}
            >
              Category → Subcategory → Products
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
            <div className="p-12 text-center text-[#5B6B85]">Loading 3-level catalog settings…</div>
          ) : error ? (
            <div className="p-4 bg-[#FCEBEB] text-[#A32D2D] rounded text-sm">{error}</div>
          ) : (
            <>
              {/* TAB 1: Category -> Subcategory -> Product */}
              {activeTab === "catalog" && (
                <div className="space-y-8">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-white border border-[#D1D5DB] rounded-lg p-6 shadow-sm">
                      <div className="border-b border-[#E5E7EB] pb-3 mb-6">
                        <h2 className="text-xl font-bold text-[#1A2233]">{cat.name}</h2>
                        <p className="text-xs text-[#5B6B85] mt-0.5">{cat.description}</p>
                      </div>

                      <div className="space-y-6">
                        {cat.subcategories.map((sub) => (
                          <div key={sub.id} className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F5F7FA]/50">
                            <div className="flex justify-between items-center mb-3 border-b border-[#E5E7EB] pb-2">
                              <div>
                                <h3 className="text-base font-bold text-[#1A2233] flex items-center gap-2">
                                  {sub.name}
                                  <span className="text-xs font-normal text-[#5B6B85]">({sub.products.length} products)</span>
                                </h3>
                                <div className="flex gap-1 mt-1">
                                  {sub.sizeSystems.map((ss) => (
                                    <span key={ss.sizeSystem.id} className="bg-[#E6F1FB] text-[#185FA5] text-[10px] font-semibold px-2 py-0.5 rounded">
                                      {ss.sizeSystem.name} ({ss.sizeSystem.region})
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs font-mono text-[#5B6B85]">subcategoryId: {sub.slug}</span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse bg-white border border-[#E5E7EB] rounded">
                                <thead>
                                  <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[#5B6B85] uppercase font-semibold">
                                    <th className="p-3">Product Item</th>
                                    <th className="p-3">Slug</th>
                                    <th className="p-3">MOQ</th>
                                    <th className="p-3">Lead Time</th>
                                    <th className="p-3 text-right">Status / Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                  {sub.products.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-[#F5F7FA]/60">
                                      <td className="p-3 font-semibold text-[#1A2233]">{prod.name}</td>
                                      <td className="p-3 font-mono text-[#5B6B85]">{prod.slug}</td>
                                      <td className="p-3 font-medium">{prod.moq ?? 50} units</td>
                                      <td className="p-3 font-medium">{prod.leadTimeDays ?? 14} days</td>
                                      <td className="p-3 text-right">
                                        <button
                                          type="button"
                                          onClick={() => toggleProductActive(prod.id, prod.active)}
                                          className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                                            prod.active
                                              ? "bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#A6E5CE]"
                                              : "bg-[#FCEBEB] text-[#A32D2D] hover:bg-[#F7C5C5]"
                                          }`}
                                        >
                                          {prod.active ? "Active" : "Disabled"}
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
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

              {/* TAB 2: Regional Size Systems */}
              {activeTab === "sizing" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sizeSystems.map((sys) => (
                    <div key={sys.id} className="bg-white border border-[#D1D5DB] rounded-lg p-6 shadow-sm">
                      <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3 mb-4">
                        <h3 className="text-lg font-bold text-[#1A2233]">
                          {sys.name} System <span className="text-[#2E5AAC]">({sys.region})</span>
                        </h3>
                        <span className="text-xs bg-[#E6F1FB] text-[#185FA5] font-semibold px-2 py-0.5 rounded">
                          {sys.options.length} Size Labels
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {sys.options.map((opt) => (
                          <span
                            key={opt.id}
                            className="bg-[#F5F7FA] border border-[#D1D5DB] text-[#1A2233] px-3 py-1.5 rounded text-xs font-semibold"
                          >
                            {opt.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: Product Fabrics & Price Ranges */}
              {activeTab === "fabrics" && (
                <div className="space-y-6">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-white border border-[#D1D5DB] rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-[#1A2233] mb-4 border-b border-[#E5E7EB] pb-2">
                        {cat.name} — Product-Scoped Fabric Options
                      </h3>

                      <div className="space-y-6">
                        {cat.subcategories.map((sub) => (
                          <div key={sub.id} className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F5F7FA]">
                            <h4 className="text-sm font-bold text-[#1A2233] mb-3">
                              Subcategory: {sub.name}
                            </h4>

                            <div className="space-y-4">
                              {sub.products.map((prod) => (
                                <div key={prod.id} className="bg-white p-4 rounded border border-[#D1D5DB]">
                                  <h5 className="text-xs font-semibold text-[#2E5AAC] mb-2 uppercase tracking-wider">
                                    Product: {prod.name} ({prod.fabrics.length} materials)
                                  </h5>

                                  {prod.fabrics.length === 0 ? (
                                    <p className="text-xs text-[#5B6B85] italic">Uses global fallback fabric options.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {prod.fabrics.map((fab) => (
                                        <div key={fab.id} className="bg-[#F5F7FA] p-3 rounded border border-[#E5E7EB]">
                                          <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-xs text-[#1A2233]">{fab.name}</span>
                                            <button
                                              type="button"
                                              onClick={() => toggleFabricActive(fab.id, fab.active)}
                                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                                fab.active ? "bg-[#E1F5EE] text-[#0F6E56]" : "bg-[#FCEBEB] text-[#A32D2D]"
                                              }`}
                                            >
                                              {fab.active ? "Active" : "Off"}
                                            </button>
                                          </div>
                                          <div className="text-xs text-[#2E5AAC] font-semibold tabular-nums mt-1">
                                            ${(fab.priceMinCents / 100).toFixed(2)} – ${(fab.priceMaxCents / 100).toFixed(2)} / unit
                                          </div>
                                          <div className="text-[11px] text-[#5B6B85] tabular-nums mt-0.5">
                                            Setup: ${(fab.setupFeeCents / 100).toFixed(2)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
