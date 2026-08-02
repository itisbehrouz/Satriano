"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface PricingTierItem {
  id: string;
  productName: string;
  m2oPriceRange: string;
  wholesalePriceUSD: number;
  stockLevel: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

interface ProductInventory {
  productId: string;
  productName: string;
  color: string;
  sizesStock: Record<string, number>;
}

interface PriceOffer {
  id: string; // e.g. "#WH001"
  productName: string;
  quantity: number;
  listPriceUSD: number;
  offeredPriceUSD: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED";
  counterPriceUSD?: number | null;
}

interface WholesaleOrder {
  orderId: string;
  customerName: string;
  totalUnits: number;
  totalAmountUSD: number;
  status: "Pending Review" | "Approved" | "In Fulfillment" | "Shipped" | "Cancelled";
  date: string;
}

export function AdminWholesaleClient({
  initialProducts,
}: {
  initialProducts: any[];
}) {
  const [activeTab, setActiveTab] = useState<"pricing" | "inventory" | "offers" | "orders">("pricing");

  // ---------------------------------------------------------------------------
  // SECTION 1: Wholesale Pricing Manager State
  // ---------------------------------------------------------------------------
  const [pricingItems, setPricingItems] = useState<PricingTierItem[]>([
    { id: "p1", productName: "Blazer (Shawl Lapel Prom)", m2oPriceRange: "$80–$150", wholesalePriceUSD: 125.0, stockLevel: 12, stockStatus: "IN_STOCK" },
    { id: "p2", productName: "Shirt (Italian Poplin)", m2oPriceRange: "$50–$90", wholesalePriceUSD: 75.0, stockLevel: 24, stockStatus: "IN_STOCK" },
    { id: "p3", productName: "Suit (Two-Piece Wool)", m2oPriceRange: "$200–$400", wholesalePriceUSD: 350.0, stockLevel: 3, stockStatus: "LOW_STOCK" },
    { id: "p4", productName: "Overcoat (Virgin Wool)", m2oPriceRange: "$150–$300", wholesalePriceUSD: 220.0, stockLevel: 18, stockStatus: "IN_STOCK" },
    { id: "p5", productName: "Trousers (Chino & Wool)", m2oPriceRange: "$60–$120", wholesalePriceUSD: 95.0, stockLevel: 0, stockStatus: "OUT_OF_STOCK" },
  ]);

  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [editingPriceInput, setEditingPriceInput] = useState<string>("");

  const handleSavePrice = (id: string) => {
    const parsed = parseFloat(editingPriceInput);
    if (!isNaN(parsed) && parsed > 0) {
      setPricingItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, wholesalePriceUSD: parsed } : item))
      );
    }
    setEditingPricingId(null);
    setEditingPriceInput("");
  };

  // ---------------------------------------------------------------------------
  // SECTION 2: Inventory by Size/Color State
  // ---------------------------------------------------------------------------
  const [inventoryList, setInventoryList] = useState<ProductInventory[]>([
    {
      productId: "blazer-shawl",
      productName: "Shawl Lapel Slim Fit Blazer",
      color: "Navy Blue",
      sizesStock: { "36": 3, "38": 5, "40": 1, "42": 0, "44": 4, "46": 2, "48": 1 },
    },
    {
      productId: "shirt-poplin",
      productName: "Italian Poplin Cotton Shirt",
      color: "Crisp White",
      sizesStock: { "36": 5, "38": 8, "40": 6, "42": 3, "44": 2, "46": 0 },
    },
    {
      productId: "suit-two-piece",
      productName: "Two-Piece Virgin Wool Suit",
      color: "Midnight Black",
      sizesStock: { "36": 1, "38": 1, "40": 1, "42": 0, "44": 0 },
    },
  ]);

  const [selectedInventoryProduct, setSelectedInventoryProduct] = useState<string>("blazer-shawl");
  const [isEditingInventory, setIsEditingInventory] = useState<boolean>(false);
  const [tempSizesStock, setTempSizesStock] = useState<Record<string, number>>({});

  const activeInventory = useMemo(() => {
    return inventoryList.find((i) => i.productId === selectedInventoryProduct) || inventoryList[0];
  }, [inventoryList, selectedInventoryProduct]);

  const activeInventoryTotalUnits = useMemo(() => {
    if (!activeInventory) return 0;
    return Object.values(activeInventory.sizesStock).reduce((a, b) => a + b, 0);
  }, [activeInventory]);

  const handleStartEditInventory = () => {
    if (activeInventory) {
      setTempSizesStock({ ...activeInventory.sizesStock });
      setIsEditingInventory(true);
    }
  };

  const handleSaveInventory = () => {
    setInventoryList((prev) =>
      prev.map((item) =>
        item.productId === selectedInventoryProduct
          ? { ...item, sizesStock: { ...tempSizesStock } }
          : item
      )
    );
    setIsEditingInventory(false);
  };

  // ---------------------------------------------------------------------------
  // SECTION 3: Price Negotiation Inbox State
  // ---------------------------------------------------------------------------
  const [offers, setOffers] = useState<PriceOffer[]>([
    { id: "#WH001", productName: "Blazer", quantity: 50, listPriceUSD: 125.0, offeredPriceUSD: 100.0, status: "PENDING" },
    { id: "#WH002", productName: "Shirts (bulk)", quantity: 100, listPriceUSD: 75.0, offeredPriceUSD: 60.0, status: "ACCEPTED" },
    { id: "#WH003", productName: "Suit", quantity: 20, listPriceUSD: 350.0, offeredPriceUSD: 320.0, status: "REJECTED" },
  ]);

  const [counterInput, setCounterInput] = useState<Record<string, string>>({});

  const handleAcceptOffer = (id: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "ACCEPTED" } : o))
    );
  };

  const handleRejectOffer = (id: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "REJECTED" } : o))
    );
  };

  const handleSendCounter = (id: string) => {
    const val = parseFloat(counterInput[id] || "");
    if (!isNaN(val) && val > 0) {
      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "COUNTERED", counterPriceUSD: val } : o))
      );
    }
  };

  // ---------------------------------------------------------------------------
  // SECTION 4: Wholesale Order Status State
  // ---------------------------------------------------------------------------
  const [orders, setOrders] = useState<WholesaleOrder[]>([
    { orderId: "#WH001", customerName: "Company A", totalUnits: 50, totalAmountUSD: 5250, status: "Pending Review", date: "Aug 2" },
    { orderId: "#WH002", customerName: "Company B", totalUnits: 100, totalAmountUSD: 6000, status: "Approved", date: "Aug 1" },
    { orderId: "#WH003", customerName: "Company C", totalUnits: 20, totalAmountUSD: 7000, status: "In Fulfillment", date: "Jul 30" },
  ]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: WholesaleOrder["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div className="w-full font-sans antialiased text-[#1A2233] p-4 md:p-6 lg:p-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#CBD5E1] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] uppercase tracking-wide">
            WHOLESALE MANAGEMENT DASHBOARD
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Manage ready-made inventory stock, tier pricing, customer price offer negotiations, and wholesale fulfillment.
          </p>
        </div>

        <Link
          href="/wholesale"
          target="_blank"
          className="h-10 px-4 bg-[#0B1E3D] text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#1E3A8A] transition-colors inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">open_in_new</span>
          View Live Wholesale Catalog
        </Link>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] overflow-x-auto pb-1">
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
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "border-[#2E5AAC] text-[#2E5AAC] bg-white font-bold"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: Wholesale Pricing Manager                                 */}
      {/* ===================================================================== */}
      {activeTab === "pricing" && (
        <section className="bg-white border border-[#E2E8F0] rounded-none p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              PRODUCT PRICING TIER
            </h2>
            <span className="text-xs text-[#64748B]">
              Configure fixed wholesale unit prices vs. made-to-order ranges
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#475569] font-bold uppercase tracking-wider h-11">
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">M2O Price Range</th>
                  <th className="py-2.5 px-4">Wholesale Price</th>
                  <th className="py-2.5 px-4">Stock Level</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {pricingItems.map((item) => {
                  const isEditing = editingPricingId === item.id;
                  return (
                    <tr key={item.id} className="h-14 hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#0F172A]">
                        {item.productName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#64748B]">
                        {item.m2oPriceRange}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#2E5AAC]">
                        ${item.wholesalePriceUSD.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {item.stockStatus === "IN_STOCK" ? (
                          <span className="text-[#0F6E56] font-bold">
                            {item.stockLevel} units ✓
                          </span>
                        ) : item.stockStatus === "LOW_STOCK" ? (
                          <span className="text-[#854F0B] font-bold">
                            {item.stockLevel} units ⚠
                          </span>
                        ) : (
                          <span className="text-[#A32D2D] font-bold">
                            0 units ✗
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              step="1"
                              value={editingPriceInput}
                              onChange={(e) => setEditingPriceInput(e.target.value)}
                              placeholder={`$${item.wholesalePriceUSD}`}
                              className="w-24 px-2 py-1 bg-white border border-[#CBD5E1] text-xs font-mono rounded-none focus:outline-none focus:border-[#2E5AAC]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(item.id)}
                              className="px-3 py-1 bg-[#2E5AAC] text-white text-xs font-bold rounded-none hover:bg-[#1E3A8A]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPricingId(null)}
                              className="px-2 py-1 text-xs text-[#64748B] hover:text-[#0F172A]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPricingId(item.id);
                              setEditingPriceInput(item.wholesalePriceUSD.toString());
                            }}
                            className="px-3 py-1.5 bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold rounded-none hover:bg-[#E2E8F0]"
                          >
                            Edit Wholesale Price
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* SECTION 2: Inventory by Size/Color                                   */}
      {/* ===================================================================== */}
      {activeTab === "inventory" && (
        <section className="bg-white border border-[#E2E8F0] rounded-none p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                INVENTORY BY SIZE/COLOR
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Manage granular ready-made stock breakdown per garment variant
              </p>
            </div>

            {/* Product Selector Dropdown */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase text-[#64748B]">Select Product:</label>
              <select
                value={selectedInventoryProduct}
                onChange={(e) => setSelectedInventoryProduct(e.target.value)}
                className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-none px-3 py-1.5 text-xs text-[#0F172A] font-bold focus:outline-none focus:border-[#2E5AAC]"
              >
                {inventoryList.map((item) => (
                  <option key={item.productId} value={item.productId}>
                    {item.productName} ({item.color})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeInventory && (
            <div className="space-y-4 max-w-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-none">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    PRODUCT: {activeInventory.productName}
                  </h3>
                  <div className="text-xs font-semibold text-[#2E5AAC] mt-0.5">
                    Color Variant: {activeInventory.color}
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-sm text-[#0F172A]">
                  Total Stock: {activeInventoryTotalUnits} units
                </div>
              </div>

              {/* Size List Display / Inline Editing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                {Object.entries(activeInventory.sizesStock).map(([sz, count]) => {
                  const isZero = count === 0;
                  return (
                    <div
                      key={sz}
                      className={`p-3 border rounded-none text-xs space-y-1 ${
                        isZero
                          ? "bg-[#FCEBEB]/50 border-[#FCEBEB] text-[#A32D2D]"
                          : "bg-white border-[#CBD5E1] text-[#0F172A]"
                      }`}
                    >
                      <div className="font-bold uppercase">Size {sz}</div>
                      {isEditingInventory ? (
                        <input
                          type="number"
                          min={0}
                          value={tempSizesStock[sz] ?? count}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setTempSizesStock((prev) => ({
                              ...prev,
                              [sz]: isNaN(val) ? 0 : Math.max(0, val),
                            }));
                          }}
                          className="w-full px-2 py-1 border border-[#2E5AAC] font-mono text-xs font-bold rounded-none bg-white"
                        />
                      ) : (
                        <div className="font-mono">
                          {isZero ? (
                            <span className="font-bold">0 units (Out of Stock)</span>
                          ) : (
                            <span>{count} units</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
                {isEditingInventory ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInventory(false)}
                      className="px-4 py-2 bg-white text-[#64748B] border border-[#CBD5E1] text-xs font-bold uppercase rounded-none hover:bg-[#F1F5F9]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveInventory}
                      className="px-5 py-2 bg-[#2E5AAC] text-white text-xs font-bold uppercase rounded-none hover:bg-[#1E3A8A]"
                    >
                      Save Stock Changes
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditInventory}
                    className="px-5 py-2 bg-[#0B1E3D] text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#1E3A8A] transition-colors"
                  >
                    Edit Stock Levels
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===================================================================== */}
      {/* SECTION 3: Price Negotiation Inbox                                   */}
      {/* ===================================================================== */}
      {activeTab === "offers" && (
        <section className="bg-white border border-[#E2E8F0] rounded-none p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              PENDING PRICE OFFERS
            </h2>
            <span className="text-xs text-[#64748B]">
              Review bulk order price suggestions from B2B buyers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#475569] font-bold uppercase tracking-wider h-11">
                  <th className="py-2.5 px-4">Order</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4">Offered Price</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {offers.map((offer) => {
                  const isPending = offer.status === "PENDING";
                  const isAccepted = offer.status === "ACCEPTED";
                  const isRejected = offer.status === "REJECTED";
                  const isCountered = offer.status === "COUNTERED";

                  return (
                    <tr key={offer.id} className="h-16 hover:bg-[#F8FAFC] transition-colors">
                      {/* Order ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#2E5AAC]">
                        {offer.id}
                      </td>

                      {/* Product */}
                      <td className="py-3 px-4 font-bold text-[#0F172A]">
                        {offer.productName}
                      </td>

                      {/* Qty */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#0F172A]">
                        {offer.quantity}
                      </td>

                      {/* Offered Price */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-[#0F6E56]">
                          ${offer.offeredPriceUSD.toFixed(0)}/unit
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          (vs ${offer.listPriceUSD.toFixed(0)} list)
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 font-bold uppercase text-xs">
                        {isPending && (
                          <span className="bg-[#FAEEDA] text-[#854F0B] px-2.5 py-1 rounded-none border border-[#F0B94A]/30">
                            ⏳ Pending
                          </span>
                        )}
                        {isAccepted && (
                          <span className="bg-[#E1F5EE] text-[#0F6E56] px-2.5 py-1 rounded-none border border-[#5DCAA5]/30">
                            ✓ Accepted
                          </span>
                        )}
                        {isRejected && (
                          <span className="bg-[#FCEBEB] text-[#A32D2D] px-2.5 py-1 rounded-none border border-[#FCEBEB]">
                            ✗ Rejected
                          </span>
                        )}
                        {isCountered && (
                          <span className="bg-[#E6F1FB] text-[#185FA5] px-2.5 py-1 rounded-none border border-[#2E5AAC]/30">
                            → Countered (${offer.counterPriceUSD}/unit)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleAcceptOffer(offer.id)}
                              className="px-3 py-1.5 bg-[#0F6E56] text-white text-xs font-bold uppercase rounded-none hover:bg-emerald-800"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectOffer(offer.id)}
                              className="px-3 py-1.5 bg-[#A32D2D] text-white text-xs font-bold uppercase rounded-none hover:bg-red-800"
                            >
                              Reject
                            </button>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                placeholder="$ Counter"
                                value={counterInput[offer.id] || ""}
                                onChange={(e) =>
                                  setCounterInput({ ...counterInput, [offer.id]: e.target.value })
                                }
                                className="w-20 px-2 py-1 border border-[#CBD5E1] text-xs font-mono rounded-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSendCounter(offer.id)}
                                className="px-2 py-1 bg-[#2E5AAC] text-white text-xs font-bold rounded-none hover:bg-[#1E3A8A]"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#64748B] italic">
                            Action completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* SECTION 4: Wholesale Order Status                                    */}
      {/* ===================================================================== */}
      {activeTab === "orders" && (
        <section className="bg-white border border-[#E2E8F0] rounded-none p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              RECENT WHOLESALE ORDERS
            </h2>
            <span className="text-xs text-[#64748B]">
              Track ready-made stock orders and update fulfillment statuses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#475569] font-bold uppercase tracking-wider h-11">
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4 text-center">Total Units</th>
                  <th className="py-2.5 px-4 text-right">Total $</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {orders.map((order) => {
                  return (
                    <tr key={order.orderId} className="h-14 hover:bg-[#F8FAFC] transition-colors">
                      {/* Order ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#2E5AAC]">
                        {order.orderId}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4 font-bold text-[#0F172A]">
                        {order.customerName}
                      </td>

                      {/* Total Units */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#0F172A]">
                        {order.totalUnits}
                      </td>

                      {/* Total $ */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0F172A] tabular-nums">
                        ${order.totalAmountUSD.toLocaleString("en-US")}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`px-2.5 py-1 text-xs uppercase font-mono rounded-none ${
                            order.status === "Pending Review"
                              ? "bg-[#FAEEDA] text-[#854F0B]"
                              : order.status === "Approved"
                              ? "bg-[#E6F1FB] text-[#185FA5]"
                              : order.status === "In Fulfillment"
                              ? "bg-[#E1F5EE] text-[#0F6E56]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.orderId, e.target.value as any)
                          }
                          className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-none px-2.5 py-1 text-xs text-[#0F172A] font-semibold focus:outline-none focus:border-[#2E5AAC] cursor-pointer"
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Approved">Approved</option>
                          <option value="In Fulfillment">In Fulfillment</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
}
