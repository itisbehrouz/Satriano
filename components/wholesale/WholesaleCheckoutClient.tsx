"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getWholesaleCart,
  saveWholesaleCart,
  clearWholesaleCart,
  WholesaleCartItem,
} from "@/lib/wholesaleCart";

export function WholesaleCheckoutClient() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<WholesaleCartItem[]>([]);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [sendInvoiceFirst, setSendInvoiceFirst] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "terms">("card");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState<{
    orderId: string;
    total: string;
  } | null>(null);

  useEffect(() => {
    setCartItems(getWholesaleCart());
  }, []);

  // Compute Subtotal, Discount, and Final Total
  const subtotalUSD = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.subtotalUSD, 0);
  }, [cartItems]);

  const discountUSD = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.discountUSD, 0);
  }, [cartItems]);

  const totalUSD = useMemo(() => {
    return Math.max(0, subtotalUSD - discountUSD);
  }, [subtotalUSD, discountUSD]);

  // Remove Item from Cart
  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    saveWholesaleCart(updated);
  };

  // Place Wholesale Order Handler
  const handlePlaceOrder = async () => {
    if (!agreeTerms || cartItems.length === 0) return;

    setSubmitting(true);
    const newOrderId = `#WH${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // Simulate API placement delay & local persistence
      await new Promise((resolve) => setTimeout(resolve, 800));

      const existingWholesaleOrders = JSON.parse(
        localStorage.getItem("satriano_wholesale_orders") || "[]"
      );

      const newOrder = {
        id: newOrderId,
        createdAt: new Date().toISOString(),
        items: cartItems,
        totalUnits: cartItems.reduce((acc, i) => acc + i.totalUnits, 0),
        subtotalUSD,
        discountUSD,
        totalUSD,
        paymentMethod,
        sendInvoiceFirst,
        status: sendInvoiceFirst ? "Pending Review" : "Approved",
      };

      localStorage.setItem(
        "satriano_wholesale_orders",
        JSON.stringify([newOrder, ...existingWholesaleOrders])
      );

      clearWholesaleCart();
      setCartItems([]);
      setOrderPlacedSuccess({
        orderId: newOrderId,
        total: `$${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Format size breakdown: e.g. { "36": 3, "38": 5, "40": 1, "44": 3 } -> "36(3) 38(5) 40(1) 44(3)"
  const formatSizeBreakdown = (breakdown: Record<string, number>) => {
    const parts = Object.entries(breakdown)
      .filter(([_, q]) => q > 0)
      .map(([s, q]) => `${s}(${q})`);
    return parts.length > 0 ? parts.join(" ") : "Standard Mixed Assortment";
  };

  if (orderPlacedSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-[#E0E0E0] rounded-none p-8 text-center space-y-6 my-8 font-sans">
        <div className="w-16 h-16 bg-[#5DCAA5]/20 text-[#0F6E56] rounded-none flex items-center justify-center mx-auto text-3xl font-bold">
          ✓
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1A2233] uppercase">
            WHOLESALE ORDER CONFIRMED!
          </h1>
          <p className="text-xs text-[#5B6B85]">
            Thank you for your bulk order. A proforma invoice and shipping tracking update has been dispatched to your corporate email.
          </p>
        </div>

        <div className="bg-[#F5F5F5] border border-[#E0E0E0] p-4 text-xs space-y-2 font-mono text-[#1A2233]">
          <div className="flex justify-between">
            <span className="text-[#5B6B85]">Order ID:</span>
            <span className="font-bold text-[#2E5AAC]">{orderPlacedSuccess.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5B6B85]">Total Amount:</span>
            <span className="font-bold">{orderPlacedSuccess.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5B6B85]">Payment Method:</span>
            <span className="font-bold uppercase">{paymentMethod}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/portal/orders?tab=WHOLESALE"
            className="px-6 py-3 bg-[#2E5AAC] text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#1E3A8A] transition-colors"
          >
            VIEW IN CLIENT PORTAL →
          </Link>
          <Link
            href="/wholesale"
            className="px-6 py-3 bg-white text-[#1A2233] border border-[#E0E0E0] text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#F5F5F5] transition-colors"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans antialiased text-[#1A2233] space-y-8">
      
      {/* Page Title */}
      <div className="border-b border-[#E0E0E0] pb-4">
        <h1 className="text-2xl font-bold text-[#1A2233] uppercase tracking-wide">
          YOUR WHOLESALE ORDER
        </h1>
        <p className="text-xs text-[#5B6B85] mt-1">
          Review ready-made stock breakdown, price offers, and select corporate payment method.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white border border-[#E0E0E0] rounded-none p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-[#5B6B85]">
            shopping_cart
          </span>
          <h2 className="text-base font-bold text-[#1A2233]">
            Your Wholesale Cart is Currently Empty
          </h2>
          <p className="text-xs text-[#5B6B85] max-w-md mx-auto">
            Browse our ready-made stock menswear catalog to add items to your order.
          </p>
          <Link
            href="/wholesale"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#2E5AAC] text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#1E3A8A] transition-colors min-h-[44px]"
          >
            BACK TO WHOLESALE CATALOG
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT — Cart Review Table & Options */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Cart Review Table (Formatted per prompt specs) */}
            <div className="bg-white border border-[#E0E0E0] rounded-none overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-[#1A2233] font-bold uppercase tracking-wider h-12">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4">Size Breakdown</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {cartItems.map((item) => {
                    const formattedBreakdown = formatSizeBreakdown(item.sizeBreakdown);
                    const formattedSubtotal = `$${item.subtotalUSD.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`;

                    return (
                      <tr key={item.id} className="h-16 hover:bg-[#F5F5F5]/50 transition-colors">
                        {/* Item */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#1A2233] leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[11px] font-mono text-[#5B6B85] mt-0.5">
                            SKU: {item.sku} (${item.unitPriceUSD.toFixed(2)}/unit)
                          </div>
                        </td>

                        {/* Qty */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#1A2233]">
                          {item.totalUnits}
                        </td>

                        {/* Size Breakdown */}
                        <td className="py-3 px-4 font-mono text-xs text-[#2E5AAC] font-semibold whitespace-pre-line">
                          {formattedBreakdown}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2233] tabular-nums">
                          {formattedSubtotal}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-[#A32D2D] hover:text-red-700 text-xs font-bold min-h-[36px] px-2"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Payment Method Options (Same as M2O: Credit Card, Bank Transfer, B2B Terms) */}
            <div className="bg-white border border-[#E0E0E0] p-6 rounded-none space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A2233]">
                SELECT PAYMENT METHOD
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Credit Card */}
                <label
                  className={`p-4 border rounded-none cursor-pointer flex flex-col justify-between space-y-2 transition-colors ${
                    paymentMethod === "card"
                      ? "border-[#2E5AAC] bg-[#2E5AAC]/5 font-semibold"
                      : "border-[#E0E0E0] bg-white hover:bg-[#F5F5F5]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="w-4 h-4 accent-[#2E5AAC]"
                    />
                    <span className="text-xs font-bold text-[#1A2233]">Credit Card</span>
                  </div>
                  <span className="text-[11px] text-[#5B6B85]">
                    Virtual POS / Instant Approval
                  </span>
                </label>

                {/* 2. Bank Transfer */}
                <label
                  className={`p-4 border rounded-none cursor-pointer flex flex-col justify-between space-y-2 transition-colors ${
                    paymentMethod === "bank"
                      ? "border-[#2E5AAC] bg-[#2E5AAC]/5 font-semibold"
                      : "border-[#E0E0E0] bg-white hover:bg-[#F5F5F5]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "bank"}
                      onChange={() => setPaymentMethod("bank")}
                      className="w-4 h-4 accent-[#2E5AAC]"
                    />
                    <span className="text-xs font-bold text-[#1A2233]">Bank Transfer</span>
                  </div>
                  <span className="text-[11px] text-[#5B6B85]">
                    SWIFT / Wire Proforma
                  </span>
                </label>

                {/* 3. B2B Terms */}
                <label
                  className={`p-4 border rounded-none cursor-pointer flex flex-col justify-between space-y-2 transition-colors ${
                    paymentMethod === "terms"
                      ? "border-[#2E5AAC] bg-[#2E5AAC]/5 font-semibold"
                      : "border-[#E0E0E0] bg-white hover:bg-[#F5F5F5]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "terms"}
                      onChange={() => setPaymentMethod("terms")}
                      className="w-4 h-4 accent-[#2E5AAC]"
                    />
                    <span className="text-xs font-bold text-[#1A2233]">B2B Net-30</span>
                  </div>
                  <span className="text-[11px] text-[#5B6B85]">
                    Corporate Account Terms
                  </span>
                </label>
              </div>
            </div>

            {/* Checkboxes: Agreement & Invoice before proceeding */}
            <div className="bg-white border border-[#E0E0E0] p-6 rounded-none space-y-3">
              <label className="flex items-center gap-3 cursor-pointer text-xs text-[#1A2233] min-h-[36px]">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 accent-[#2E5AAC] rounded-none cursor-pointer"
                />
                <span className="font-medium">
                  I agree to wholesale bulk order terms and immediate stock dispatch policy.
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs text-[#1A2233] min-h-[36px]">
                <input
                  type="checkbox"
                  checked={sendInvoiceFirst}
                  onChange={(e) => setSendInvoiceFirst(e.target.checked)}
                  className="w-4 h-4 accent-[#2E5AAC] rounded-none cursor-pointer"
                />
                <span className="font-medium">
                  Send proforma invoice to finance department before processing payment.
                </span>
              </label>
            </div>

          </div>

          {/* RIGHT — Summary Box & Actions */}
          <div className="lg:col-span-4 bg-white border border-[#E0E0E0] p-6 rounded-none space-y-6 lg:sticky lg:top-24">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A2233] border-b border-[#E0E0E0] pb-3">
              ORDER SUMMARY
            </h2>

            <div className="space-y-3 text-xs font-mono">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-[#1A2233]">
                <span className="text-[#5B6B85] font-sans uppercase font-bold">SUBTOTAL:</span>
                <span className="font-bold text-sm tabular-nums">
                  ${subtotalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Negotiated Price Offer Discount */}
              {discountUSD > 0 && (
                <div className="flex justify-between items-center text-[#0F6E56] bg-[#5DCAA5]/10 p-2 border border-[#5DCAA5]/30">
                  <div className="font-sans text-[11px] font-bold uppercase flex items-center gap-1">
                    <span>NEGOTIATED PRICE OFFER:</span>
                  </div>
                  <span className="font-bold tabular-nums">
                    ✓ -$300.00
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t border-[#E0E0E0] text-[#1A2233]">
                <span className="text-sm font-sans font-bold uppercase">TOTAL:</span>
                <span className="text-xl font-bold text-[#2E5AAC] tabular-nums">
                  ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Actions: [PROCEED TO PAYMENT] & [BACK TO CATALOG] */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!agreeTerms || submitting}
                className="w-full min-h-[44px] h-[48px] bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>PROCEED TO PAYMENT</span>
                )}
              </button>

              <Link
                href="/wholesale"
                className="w-full min-h-[44px] h-[48px] bg-white hover:bg-[#F5F5F5] text-[#1A2233] border border-[#E0E0E0] text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2"
              >
                BACK TO CATALOG
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
