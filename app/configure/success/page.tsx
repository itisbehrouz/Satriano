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
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-4 md:p-10 flex items-center justify-center font-sans select-none rounded-none transition-colors">
      <div className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-8 shadow-2xl space-y-6">
        {/* Success Icon & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/30 rounded-none flex items-center justify-center mx-auto text-3xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            ORDER CREATED SUCCESSFULLY
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
            Your custom manufacturing order specification has been submitted to our atelier engineering team for feasibility review.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none p-5 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
            <span className="text-[var(--color-text-secondary)]">Order ID:</span>
            <span className="font-bold text-[var(--color-accent)]">{orderId}</span>
          </div>
          <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
            <span className="text-[var(--color-text-secondary)]">Status:</span>
            <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">
              ⏳ Pending Review
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Date Created:</span>
            <span className="text-[var(--color-text-primary)]">{dateStr}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/portal/orders"
            className="flex-1 h-12 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>VIEW IN PORTAL ORDERS</span>
          </Link>
          <Link
            href="/configure"
            className="flex-1 h-12 bg-transparent hover:bg-[var(--color-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>CREATE ANOTHER ORDER</span>
          </Link>
        </div>

        {/* Footer Support Link */}
        <div className="pt-4 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)]">
          Need help with your order spec?{" "}
          <Link href="/portal/support" className="text-[var(--color-accent)] hover:underline font-bold uppercase">
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
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
          <span className="inline-block w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-2" />
        </div>
      }
    >
      <ConfiguratorSuccessContent />
    </Suspense>
  );
}
