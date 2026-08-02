"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { WholesalePricingTab, PricingProduct } from "./WholesalePricingTab";
import { InventoryTab, InventoryProduct } from "./InventoryTab";
import { PriceOfferInboxTab, PriceOffer } from "./PriceOfferInboxTab";
import { OrderStatusTab } from "./OrderStatusTab";
import { WholesaleOrderFull } from "./OrderDetailModal";

export function AdminWholesaleClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active Tab state synced with URL query parameter
  const tabParam = (searchParams.get("tab") as "pricing" | "inventory" | "offers" | "orders") || "pricing";
  const [activeTab, setActiveTab] = useState<"pricing" | "inventory" | "offers" | "orders">(tabParam);

  useEffect(() => {
    if (tabParam && ["pricing", "inventory", "offers", "orders"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "pricing" | "inventory" | "offers" | "orders") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/admin/wholesale?${params.toString()}`);
  };

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // =========================================================================
  // TAB 1: MOCK STATE — Wholesale Pricing Manager
  // =========================================================================
  const [pricingProducts, setPricingProducts] = useState<PricingProduct[]>([
    { id: "p1", productName: "Blazer (Shawl Lapel Prom)", m2oPriceRange: "$80–$150", wholesalePriceUSD: 125.0, stockLevel: 12 },
    { id: "p2", productName: "Shirt (Italian Poplin)", m2oPriceRange: "$50–$90", wholesalePriceUSD: 75.0, stockLevel: 24 },
    { id: "p3", productName: "Suit (Two-Piece Wool)", m2oPriceRange: "$200–$400", wholesalePriceUSD: 350.0, stockLevel: 3 },
    { id: "p4", productName: "Overcoat (Virgin Wool)", m2oPriceRange: "$150–$300", wholesalePriceUSD: 220.0, stockLevel: 18 },
    { id: "p5", productName: "Trousers (Chino & Wool)", m2oPriceRange: "$60–$120", wholesalePriceUSD: 95.0, stockLevel: 0 },
  ]);

  const handleUpdatePrice = (id: string, newPriceUSD: number) => {
    setPricingProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, wholesalePriceUSD: newPriceUSD } : item))
    );
  };

  const handleDeletePricingProduct = (id: string) => {
    setPricingProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // =========================================================================
  // TAB 2: MOCK STATE — Inventory by Size/Color
  // =========================================================================
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([
    {
      id: "blazer-id",
      name: "Shawl Lapel Slim Fit Blazer",
      colorVariants: [
        {
          id: "navy-blue",
          productId: "blazer-id",
          colorName: "Navy Blue",
          lastRestocked: "Aug 1, 2026 10:30 AM",
          sizeInventory: { "36": 3, "38": 5, "40": 1, "42": 0, "44": 4, "46": 2, "48": 1, "50": 0 },
        },
        {
          id: "black",
          productId: "blazer-id",
          colorName: "Black",
          lastRestocked: "Jul 28, 2026 04:15 PM",
          sizeInventory: { "36": 2, "38": 4, "40": 4, "42": 2, "44": 2, "46": 1, "48": 1, "50": 0 },
        },
        {
          id: "charcoal",
          productId: "blazer-id",
          colorName: "Charcoal",
          lastRestocked: "Jul 25, 2026 11:00 AM",
          sizeInventory: { "36": 1, "38": 2, "40": 2, "42": 1, "44": 1, "46": 1, "48": 0, "50": 0 },
        },
        {
          id: "burgundy",
          productId: "blazer-id",
          colorName: "Burgundy",
          lastRestocked: "Jul 20, 2026 09:00 AM",
          sizeInventory: { "36": 0, "38": 0, "40": 0, "42": 0, "44": 0, "46": 0, "48": 0, "50": 0 },
        },
        {
          id: "light-gray",
          productId: "blazer-id",
          colorName: "Light Gray",
          lastRestocked: "Jul 30, 2026 02:20 PM",
          sizeInventory: { "36": 2, "38": 3, "40": 3, "42": 2, "44": 2, "46": 0, "48": 0, "50": 0 },
        },
      ],
    },
    {
      id: "shirt-id",
      name: "Italian Poplin Cotton Shirt",
      colorVariants: [
        {
          id: "white",
          productId: "shirt-id",
          colorName: "Crisp White",
          lastRestocked: "Aug 1, 2026 09:00 AM",
          sizeInventory: { "36": 5, "38": 8, "40": 6, "42": 3, "44": 2, "46": 0 },
        },
        {
          id: "sky-blue",
          productId: "shirt-id",
          colorName: "Sky Blue",
          lastRestocked: "Jul 29, 2026 01:45 PM",
          sizeInventory: { "36": 3, "38": 4, "40": 3, "42": 2, "44": 1, "46": 0 },
        },
      ],
    },
  ]);

  const handleUpdateInventory = (productId: string, variantId: string, newSizeStock: Record<string, number>) => {
    setInventoryProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          colorVariants: p.colorVariants.map((v) =>
            v.id === variantId
              ? { ...v, sizeInventory: { ...newSizeStock }, lastRestocked: "Just now" }
              : v
          ),
        };
      })
    );
  };

  const handleAddColorVariant = (productId: string, colorName: string, initialQty: number) => {
    setInventoryProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newVarId = colorName.toLowerCase().replace(/\s+/g, "-");
        const defaultSizes: Record<string, number> = {
          "36": initialQty,
          "38": initialQty,
          "40": initialQty,
          "42": initialQty,
          "44": initialQty,
          "46": 0,
          "48": 0,
        };
        const newVar = {
          id: newVarId,
          productId,
          colorName,
          lastRestocked: "Just created",
          sizeInventory: defaultSizes,
        };
        return { ...p, colorVariants: [...p.colorVariants, newVar] };
      })
    );
  };

  const handleArchiveColorVariant = (productId: string, variantId: string) => {
    setInventoryProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          colorVariants: p.colorVariants.filter((v) => v.id !== variantId),
        };
      })
    );
  };

  // =========================================================================
  // TAB 3: MOCK STATE — Price Offer Inbox
  // =========================================================================
  const [priceOffers, setPriceOffers] = useState<PriceOffer[]>([
    {
      id: "po-1",
      orderId: "#WH001",
      productName: "Blazer",
      quantity: 50,
      offeredPriceUSD: 100,
      listPriceUSD: 125,
      status: "PENDING",
    },
    {
      id: "po-2",
      orderId: "#WH002",
      productName: "Shirts (bulk)",
      quantity: 100,
      offeredPriceUSD: 60,
      listPriceUSD: 75,
      status: "ACCEPTED",
    },
    {
      id: "po-3",
      orderId: "#WH003",
      productName: "Suit",
      quantity: 20,
      offeredPriceUSD: 320,
      listPriceUSD: 350,
      status: "REJECTED",
    },
  ]);

  const handleAcceptOffer = (id: string) => {
    setPriceOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "ACCEPTED" } : o))
    );
  };

  const handleRejectOffer = (id: string) => {
    setPriceOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "REJECTED" } : o))
    );
  };

  const handleCounterOffer = (id: string, counterPriceUSD: number) => {
    setPriceOffers((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: "COUNTER_PENDING", counterPriceUSD }
          : o
      )
    );
  };

  // =========================================================================
  // TAB 4: MOCK STATE — Wholesale Order Status
  // =========================================================================
  const [wholesaleOrders, setWholesaleOrders] = useState<WholesaleOrderFull[]>([
    {
      id: "wo-1",
      orderId: "#WH001",
      customerName: "Company A",
      dateSubmitted: "Aug 1, 2026 10:30 AM",
      status: "PENDING_REVIEW",
      totalUnits: 50,
      totalPriceUSD: 5250.0,
      suggestedUnitPriceUSD: 100.0,
      listUnitPriceUSD: 125.0,
      savingsUSD: 250.0,
      savingsPercent: 5,
      items: [
        {
          productName: "Blazer (Shawl Lapel Prom)",
          colorVariant: "Navy Blue",
          sizeBreakdown: { "36": 10, "38": 15, "40": 25 },
          unitPriceUSD: 105.0,
          lineTotalUSD: 5250.0,
        },
      ],
    },
    {
      id: "wo-2",
      orderId: "#WH002",
      customerName: "Company B",
      dateSubmitted: "Aug 1, 2026 02:15 PM",
      status: "APPROVED",
      totalUnits: 100,
      totalPriceUSD: 6000.0,
      suggestedUnitPriceUSD: 60.0,
      listUnitPriceUSD: 75.0,
      savingsUSD: 1500.0,
      savingsPercent: 20,
      items: [
        {
          productName: "Italian Poplin Cotton Shirt",
          colorVariant: "Crisp White",
          sizeBreakdown: { "36": 20, "38": 30, "40": 30, "42": 20 },
          unitPriceUSD: 60.0,
          lineTotalUSD: 6000.0,
        },
      ],
    },
    {
      id: "wo-3",
      orderId: "#WH003",
      customerName: "Company C",
      dateSubmitted: "Jul 30, 2026 11:00 AM",
      status: "IN_FULFILLMENT",
      totalUnits: 20,
      totalPriceUSD: 7000.0,
      suggestedUnitPriceUSD: 320.0,
      listUnitPriceUSD: 350.0,
      savingsUSD: 600.0,
      savingsPercent: 8,
      items: [
        {
          productName: "Two-Piece Virgin Wool Suit",
          colorVariant: "Midnight Black",
          sizeBreakdown: { "36": 5, "38": 5, "40": 5, "42": 5 },
          unitPriceUSD: 350.0,
          lineTotalUSD: 7000.0,
        },
      ],
    },
  ]);

  const handleUpdateOrderStatus = (id: string, newStatus: WholesaleOrderFull["status"]) => {
    setWholesaleOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans antialiased text-[#111318] p-4 md:p-6 lg:p-8 space-y-6 relative">
      {/* Floating Success/Error Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-md shadow-xl font-bold text-xs flex items-center gap-2 border transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-[#ECFDF3] border-[#5DCAA5] text-[#067647]"
              : "bg-[#FEE4E2] border-[#F8B4B4] text-[#C5221F]"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAECF0] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111318] uppercase tracking-wide">
            WHOLESALE MANAGEMENT DASHBOARD
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Full admin wholesale control panel: pricing tiers, granular size inventory, buyer price offers, and order fulfillment.
          </p>
        </div>

        <Link
          href="/wholesale"
          target="_blank"
          className="h-10 px-4 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">open_in_new</span>
          View Live Wholesale Catalog
        </Link>
      </div>

      {/* Navigation Tabs Header */}
      <div className="flex items-center gap-2 border-b border-[#EAECF0] overflow-x-auto pb-1">
        {[
          { id: "pricing", label: "Wholesale Pricing Manager", icon: "sell" },
          { id: "inventory", label: "Inventory by Size/Color", icon: "grid_on" },
          { id: "offers", label: "Price Offer Inbox", icon: "mark_email_unread" },
          { id: "orders", label: "Wholesale Order Status", icon: "local_shipping" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "border-[#2E5AAC] text-[#2E5AAC] bg-white font-bold"
                  : "border-transparent text-[#6B7280] hover:text-[#111318]"
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View Rendering */}
      <div>
        {activeTab === "pricing" && (
          <WholesalePricingTab
            products={pricingProducts}
            onUpdatePrice={handleUpdatePrice}
            onDeleteProduct={handleDeletePricingProduct}
            showToast={showToast}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryTab
            products={inventoryProducts}
            onUpdateInventory={handleUpdateInventory}
            onAddColorVariant={handleAddColorVariant}
            onArchiveColorVariant={handleArchiveColorVariant}
            showToast={showToast}
          />
        )}

        {activeTab === "offers" && (
          <PriceOfferInboxTab
            offers={priceOffers}
            onAcceptOffer={handleAcceptOffer}
            onRejectOffer={handleRejectOffer}
            onCounterOffer={handleCounterOffer}
            showToast={showToast}
          />
        )}

        {activeTab === "orders" && (
          <OrderStatusTab
            orders={wholesaleOrders}
            onUpdateStatus={handleUpdateOrderStatus}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
}
