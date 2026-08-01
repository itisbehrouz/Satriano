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
    <div className="w-full bg-[#0B1E3D] text-white rounded-none border border-white/15 p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#93C5FD] bg-[#2E5AAC]/30 px-3 py-1 rounded-none border border-[#2E5AAC]/50 mb-3">
              <span className="material-symbols-outlined text-sm">calculate</span>
              Live Price Ledger Estimator
            </span>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Transparent Production Cost Matrix
            </h3>
            <p className="text-sm text-[#94A3B8] mt-2">
              Select fabric tier and order quantity to preview instant unit ranges and itemized setup costs.
            </p>
          </div>

          {/* Fabric Grade Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#CBD5E1] mb-2">
              1. Fabric Grade & Composition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {FABRIC_GRADES.map((grade) => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGrade(grade)}
                  className={`p-3 rounded-none border text-left text-xs transition-all ${
                    selectedGrade.id === grade.id
                      ? "border-[#60A5FA] bg-[#2E5AAC]/40 text-white font-semibold shadow-md shadow-[#2E5AAC]/20"
                      : "border-white/10 bg-white/5 text-[#94A3B8] hover:border-white/30 hover:text-white"
                  }`}
                >
                  <p className="font-medium text-white">{grade.name}</p>
                  <p className="text-[11px] text-[#93C5FD] mt-1 font-mono">
                    {formatCents(grade.minPriceCents)} – {formatCents(grade.maxPriceCents)} / unit
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
                2. Order Volume (Units)
              </label>
              <span className="text-sm font-mono font-bold text-[#60A5FA] bg-[#2E5AAC]/30 px-3 py-0.5 rounded-none border border-[#2E5AAC]/50">
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
              className="w-full h-2 bg-white/10 rounded-none appearance-none cursor-pointer accent-[#60A5FA]"
            />
            <div className="flex justify-between text-[11px] text-[#64748B] mt-1 font-mono">
              <span>50 MOQ</span>
              <span>250</span>
              <span>500</span>
              <span>1,000+</span>
            </div>
          </div>
        </div>

        {/* Ledger Output Box Column */}
        <div className="lg:col-span-5">
          <div className="bg-[#152744]/90 border border-white/20 rounded-none p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="border-b border-white/10 pb-3 flex justify-between items-center">
              <span className="text-xs uppercase font-semibold text-[#94A3B8]">Est. Unit Price</span>
              <span className="text-base font-bold text-[#60A5FA] font-mono">
                {formatCents(selectedGrade.minPriceCents)} – {formatCents(selectedGrade.maxPriceCents)}
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#CBD5E1]">
              <div className="flex justify-between">
                <span>Subtotal ({quantity} units)</span>
                <span className="font-mono text-white">
                  {formatCents(selectedGrade.minPriceCents * quantity)} – {formatCents(selectedGrade.maxPriceCents * quantity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vector Digitization Setup</span>
                <span className="font-mono text-white">{formatCents(selectedGrade.setupFeeCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>QC & Proforma Issuance</span>
                <span className="font-mono text-emerald-400">Included ($0.00)</span>
              </div>
            </div>

            <div className="border-t border-white/15 pt-4">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#93C5FD]">
                  Estimated Order Total Range
                </span>
                <span className="text-xl font-bold text-white font-mono">
                  {formatCents(totalMinCents)} – {formatCents(totalMaxCents)}
                </span>
              </div>

              <Link
                href="/konfigurator"
                className="w-full bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-none transition-colors inline-flex items-center justify-center gap-2 shadow-lg shadow-[#2E5AAC]/30 text-center"
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
