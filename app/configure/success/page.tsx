"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ConfiguratorSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "#SAT-ORDER";

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#0B1E3D] text-[#E8ECF3] p-4 md:p-10 flex items-center justify-center font-sans select-none rounded-none">
      <div className="w-full max-w-xl bg-[#132A52] border-l-4 border-[#2E5AAC] border-y border-r border-[#1E3A8A] rounded-none p-8 shadow-2xl space-y-6">
        {/* Success Icon & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#14301F] text-[#5DCAA5] border border-[#5DCAA5]/40 rounded-none flex items-center justify-center mx-auto text-3xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#E8ECF3] tracking-tight">
            ORDER CREATED SUCCESSFULLY
          </h1>
          <p className="text-xs text-[#8DA0C4] max-w-md mx-auto leading-relaxed">
            Your custom manufacturing order specification has been submitted to our atelier engineering team for feasibility review.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#0B1E3D] border border-[#2E5AAC]/40 rounded-none p-5 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between border-b border-[#1E3A8A] pb-2">
            <span className="text-[#8DA0C4]">Order ID:</span>
            <span className="font-bold text-[#2E5AAC]">{orderId}</span>
          </div>
          <div className="flex justify-between border-b border-[#1E3A8A] pb-2">
            <span className="text-[#8DA0C4]">Status:</span>
            <span className="font-bold text-[#F0B94A] bg-[#3A2E14] px-2 py-0.5">
              ⏳ Pending Review
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8DA0C4]">Date Created:</span>
            <span className="text-[#E8ECF3]">{dateStr}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/portal/orders"
            className="flex-1 h-12 bg-[#2E5AAC] hover:bg-[#1E3F7F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>VIEW IN PORTAL ORDERS</span>
          </Link>
          <Link
            href="/configure"
            className="flex-1 h-12 bg-transparent hover:bg-[#1A3A5C] text-[#2E5AAC] border-2 border-[#2E5AAC] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>CREATE ANOTHER ORDER</span>
          </Link>
        </div>

        {/* Footer Support Link */}
        <div className="pt-4 border-t border-[#1E3A8A] text-center text-xs text-[#8DA0C4]">
          Need help with your order spec?{" "}
          <Link href="/portal/support" className="text-[#2E5AAC] hover:underline font-bold uppercase">
            CONTACT SUPPORT →
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ConfiguratorSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1E3D] flex items-center justify-center text-xs text-[#8DA0C4]">
          <span className="inline-block w-6 h-6 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
        </div>
      }
    >
      <ConfiguratorSuccessContent />
    </Suspense>
  );
}
