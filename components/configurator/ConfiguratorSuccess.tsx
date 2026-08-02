"use client";

import React from "react";
import Link from "next/link";

export interface ConfiguratorSuccessProps {
  orderId: string;
  isLoggedIn: boolean;
  companyEmail?: string;
  onReset?: () => void;
}

export function ConfiguratorSuccess({
  orderId,
  isLoggedIn,
  companyEmail,
  onReset,
}: ConfiguratorSuccessProps) {
  const formattedRefNo = `ORD-${orderId.slice(-8).toUpperCase()}`;

  return (
    <div className="w-full max-w-2xl mx-auto my-12 bg-[#0B1E3D] border border-[#1E3A8A] text-[#E8ECF3] p-8 md:p-10 shadow-xl font-sans select-none rounded-none text-center space-y-6">
      {/* Icon Badge */}
      <div className="w-16 h-16 bg-[#14301F] text-[#5DCAA5] border border-[#5DCAA5]/40 rounded-none flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-3xl">task_alt</span>
      </div>

      {/* Status Badge & Header */}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3A2E14] text-[#F0B94A] border border-[#F0B94A]/40 text-xs font-mono font-bold uppercase tracking-wider rounded-none">
          <span className="w-2 h-2 rounded-none bg-[#F0B94A] animate-pulse" />
          <span>Status: PENDING ENGINEERING REVIEW</span>
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {isLoggedIn ? "Custom Spec Submitted Successfully!" : "Order Spec Received!"}
        </h1>
        <p className="text-xs md:text-sm text-[#8DA0C4] max-w-md mx-auto leading-relaxed">
          {isLoggedIn
            ? `Your custom production order #${formattedRefNo} has been transmitted to our factory engineering desk for pattern grading and feasibility review.`
            : `We have created order spec #${formattedRefNo} for ${companyEmail || "your company"}. Please check your inbox for a magic link to access your proforma invoice and client portal.`}
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="p-4 bg-[#132A52] border border-[#2E5AAC] rounded-none font-mono text-xs text-[#E8ECF3] max-w-sm mx-auto flex items-center justify-between">
        <span className="text-[#8DA0C4]">Order ID:</span>
        <span className="font-bold text-white text-sm">{formattedRefNo}</span>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
        {isLoggedIn ? (
          <>
            <Link
              href="/portal/orders"
              className="h-12 px-6 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>View in Client Portal</span>
            </Link>

            {onReset ? (
              <button
                type="button"
                onClick={onReset}
                className="h-12 px-6 bg-[#132A52] hover:bg-[#1E3A6D] text-[#E8ECF3] border border-[#2E5AAC] text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Configure Another Spec</span>
              </button>
            ) : (
              <Link
                href="/konfigurator"
                className="h-12 px-6 bg-[#132A52] hover:bg-[#1E3A6D] text-[#E8ECF3] border border-[#2E5AAC] text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none transition-colors"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Configure Another Spec</span>
              </Link>
            )}
          </>
        ) : (
          <>
            <Link
              href="/portal"
              className="h-12 px-6 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none transition-colors shadow-none"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>Access Client Portal</span>
            </Link>

            <Link
              href="/"
              className="h-12 px-6 bg-[#132A52] hover:bg-[#1E3A6D] text-[#E8ECF3] border border-[#2E5AAC] text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none transition-colors"
            >
              <span className="material-symbols-outlined text-base">home</span>
              <span>Back to Homepage</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
