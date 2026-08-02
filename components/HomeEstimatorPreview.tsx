"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/formatCurrency";

const FABRIC_GRADES = [
  { id: "standard", name: "Standard Cotton Twill", minPriceCents: 1450, maxPriceCents: 2200, setupFeeCents: 4500 },
  { id: "premium", name: "Premium Royal Oxford", minPriceCents: 2400, maxPriceCents: 3800, setupFeeCents: 4500 },
  { id: "luxury", name: "Italian Merino Wool Blend", minPriceCents: 4200, maxPriceCents: 6800, setupFeeCents: 6000 },
];

export function HomeEstimatorPreview() {
  const [selectedGrade, setSelectedGrade] = useState(FABRIC_GRADES[0]);
  const [quantity, setQuantity] = useState(100);

  const totalMinCents = selectedGrade.minPriceCents * quantity + selectedGrade.setupFeeCents;
  const totalMaxCents = selectedGrade.maxPriceCents * quantity + selectedGrade.setupFeeCents;

  return (
    <div className="w-full bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-none border border-[var(--color-border)] p-6 md:p-8 shadow-sm relative overflow-hidden transition-colors">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1 rounded-none border border-[var(--color-accent)]/30 mb-3">
              <span className="material-symbols-outlined text-sm">calculate</span>
              Live Price Ledger Estimator
            </span>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Transparent Production Cost Matrix
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
              Select fabric tier and order quantity to preview instant unit ranges and itemized setup costs.
            </p>
          </div>

          {/* Fabric Grade Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] mb-2">
              1. Fabric Grade & Composition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {FABRIC_GRADES.map((grade) => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGrade(grade)}
                  className={`p-3 rounded-none border text-left text-xs transition-all ${
                    selectedGrade.id === grade.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text-primary)] font-semibold"
                      : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)]"
                  }`}
                >
                  <p className="font-medium text-[var(--color-text-primary)]">{grade.name}</p>
                  <p className="text-[11px] text-[var(--color-accent)] mt-1 font-mono">
                    {formatCents(grade.minPriceCents)} – {formatCents(grade.maxPriceCents)} / unit
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
                2. Order Volume (Units)
              </label>
              <span className="text-sm font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-0.5 rounded-none border border-[var(--color-accent)]/30">
                {quantity} Units
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={1000}
              step={50}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-[var(--color-border)] rounded-none appearance-none cursor-pointer accent-[var(--color-accent)]"
            />
            <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)] mt-1 font-mono">
              <span>50 MOQ</span>
              <span>250</span>
              <span>500</span>
              <span>1,000+</span>
            </div>
          </div>
        </div>

        {/* Ledger Output Box Column */}
        <div className="lg:col-span-5">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none p-6 space-y-4">
            <div className="border-b border-[var(--color-border)] pb-3 flex justify-between items-center">
              <span className="text-xs uppercase font-semibold text-[var(--color-text-secondary)]">Est. Unit Price</span>
              <span className="text-base font-bold text-[var(--color-accent)] font-mono">
                {formatCents(selectedGrade.minPriceCents)} – {formatCents(selectedGrade.maxPriceCents)}
              </span>
            </div>

            <div className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              <div className="flex justify-between">
                <span>Subtotal ({quantity} units)</span>
                <span className="font-mono text-[var(--color-text-primary)]">
                  {formatCents(selectedGrade.minPriceCents * quantity)} – {formatCents(selectedGrade.maxPriceCents * quantity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vector Digitization Setup</span>
                <span className="font-mono text-[var(--color-text-primary)]">{formatCents(selectedGrade.setupFeeCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>QC & Proforma Issuance</span>
                <span className="font-mono text-[var(--color-status-success)]">Included ($0.00)</span>
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
                  Estimated Order Total Range
                </span>
                <span className="text-xl font-bold text-[var(--color-text-primary)] font-mono">
                  {formatCents(totalMinCents)} – {formatCents(totalMaxCents)}
                </span>
              </div>

              <Link
                href="/konfigurator"
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-none transition-colors inline-flex items-center justify-center gap-2 text-center"
              >
                Configure Full Product Spec →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
