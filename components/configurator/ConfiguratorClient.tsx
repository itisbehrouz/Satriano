"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LogoPlacement } from "@/app/generated/prisma/enums";
import { FabricPicker, type FabricOption } from "@/components/configurator/FabricPicker";
import { FitPicker, type FitOption } from "@/components/configurator/FitPicker";
import { SizeQtyTable, type SizeSystemDef } from "@/components/configurator/SizeQtyTable";
import { LogoUploader } from "@/components/configurator/LogoUploader";
import { PriceSidebar } from "@/components/configurator/PriceSidebar";
import { DEFAULT_SIZE_QUANTITIES, toSizeQuantityArray } from "@/lib/configuratorLogic";
import { formatCents } from "@/lib/formatCurrency";

interface ConfiguratorClientProps {
  productId?: string;
  fabrics: FabricOption[];
  fits?: FitOption[];
  subcategoryTitle?: string;
  subcategoryDescription?: string;
  categoryTitle?: string;
  sizeSystems?: SizeSystemDef[];
  moqPerFabric?: number;
}

export function ConfiguratorClient({
  productId,
  fabrics,
  fits = [],
  subcategoryTitle,
  subcategoryDescription,
  categoryTitle,
  sizeSystems = [],
  moqPerFabric = 50,
}: ConfiguratorClientProps) {
  const router = useRouter();
  const [selectedFabricId, setSelectedFabricId] = useState(fabrics[0]?.id ?? "");
  const [selectedFitId, setSelectedFitId] = useState(fits[0]?.id ?? "");
  const [activeRegion, setActiveRegion] = useState<"EU" | "US">("EU");
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>(DEFAULT_SIZE_QUANTITIES);
  const [customerTargetPrice, setCustomerTargetPrice] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [placement, setPlacement] = useState<LogoPlacement>("LEFT_CHEST");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedFabric = fabrics.find((fabric) => fabric.id === selectedFabricId) ?? fabrics[0];
  const selectedFit = fits.find((fit) => fit.id === selectedFitId) ?? fits[0];

  const totalUnits = Object.values(sizeQuantities).reduce((sum, qty) => sum + (qty || 0), 0);
  const meetsMoq = totalUnits >= moqPerFabric;

  async function handleSubmit() {
    if (!companyName.trim() || !companyEmail.trim()) {
      setSubmitError("Company name and corporate email are required.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      let uploadedLogoUrl: string | undefined = undefined;

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          setSubmitError("Failed to upload vector logo file. Please try again.");
          return;
        }

        const uploadJson = await uploadRes.json();
        uploadedLogoUrl = uploadJson.url || uploadJson.storageUrl;
      }

      const targetPriceVal = parseFloat(customerTargetPrice);
      const targetPriceCents =
        !isNaN(targetPriceVal) && targetPriceVal > 0
          ? Math.round(targetPriceVal * 100)
          : undefined;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fabricId: selectedFabricId,
          productId: productId || undefined,
          fitId: selectedFitId || undefined,
          companyName,
          companyEmail,
          sizeQuantities: toSizeQuantityArray(sizeQuantities),
          customerTargetPriceCents: targetPriceCents,
          logoUrl: uploadedLogoUrl,
          logoPlacement: placement,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        setSubmitError(json.error ?? "Something went wrong during proforma generation. Please try again.");
        return;
      }
      router.push(`/proforma/${json.orderId}`);
    } catch {
      setSubmitError("Network connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const titleText = subcategoryTitle ? subcategoryTitle : "Classic Polo Shirt";
  const descriptionText =
    subcategoryDescription ||
    "Custom luxury B2B apparel production. Select fabric line, garment fit, regional size quantities, and vector branding.";

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-8 py-10 bg-[#F5F7FA] text-[#1A2233] font-sans">
      {/* Executive Product Header Shell */}
      <div className="mb-8 bg-[#0B1E3D] text-white border border-[#1E3A8A] rounded-none p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#DBB671] uppercase tracking-wider">
              <span>B2B Production Spec</span>
              <span>•</span>
              <span>{categoryTitle || "Menswear Atelier"}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              {titleText}
            </h1>
            <p className="text-xs md:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
              {descriptionText}
            </p>
          </div>

          {/* Quick Feasibility & Live Progress Badge */}
          <div className="bg-[#071325] border border-white/10 p-4 rounded-none min-w-[240px] text-right space-y-1.5 shrink-0">
            <div className="flex items-center justify-end gap-2">
              <span className="w-2 h-2 rounded-none bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Atelier Engineering Desk
              </span>
            </div>
            <p className="text-xs text-[#CBD5E1]">
              MOQ Threshold: <strong className="text-white font-mono">{moqPerFabric} pcs</strong>
            </p>
            <div className="inline-block text-[11px] font-mono px-2.5 py-1 bg-[#152744] text-[#60A5FA] border border-[#60A5FA]/30 rounded-none">
              Configured: {totalUnits} / {moqPerFabric} pcs
            </div>
          </div>
        </div>

        {/* Visual Spec Stepper Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#DBB671]">
            <span className="w-5 h-5 bg-[#DBB671] text-[#0B1E3D] font-bold flex items-center justify-center rounded-none text-[10px]">
              1
            </span>
            <span className="font-bold uppercase tracking-wider">Fabric Line</span>
          </div>
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <span className="w-5 h-5 bg-white/10 text-white font-bold flex items-center justify-center rounded-none text-[10px]">
              2
            </span>
            <span className="font-semibold uppercase tracking-wider">Fit &amp; Sizing</span>
          </div>
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <span className="w-5 h-5 bg-white/10 text-white font-bold flex items-center justify-center rounded-none text-[10px]">
              3
            </span>
            <span className="font-semibold uppercase tracking-wider">Vector Logo</span>
          </div>
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <span className="w-5 h-5 bg-white/10 text-white font-bold flex items-center justify-center rounded-none text-[10px]">
              4
            </span>
            <span className="font-semibold uppercase tracking-wider">Proforma Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Configurator Form Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Step 1: Material Selection */}
          <section className="bg-white border border-[#D1D5DB] rounded-none p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-6">
              <h2 className="text-base font-bold text-[#1A2233] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[#0B1E3D] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  1
                </span>
                Luxury Material &amp; Fabric Selection
              </h2>
              <span className="text-xs font-mono text-[#2E5AAC] font-semibold bg-[#E6F1FB] px-2.5 py-1 rounded-none">
                {fabrics.length} Fabrics Available
              </span>
            </div>

            {selectedFabric && (
              <FabricPicker
                fabrics={fabrics}
                selectedFabricId={selectedFabricId}
                onSelect={setSelectedFabricId}
              />
            )}
          </section>

          {/* Step 2: Garment Fit Selection */}
          {fits.length > 0 && (
            <section className="bg-white border border-[#D1D5DB] rounded-none p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-6">
                <h2 className="text-base font-bold text-[#1A2233] uppercase tracking-wider flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-[#0B1E3D] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                    2
                  </span>
                  Garment Fit Selection
                </h2>
                {selectedFit && (
                  <span className="text-xs font-mono text-[#2E5AAC] font-semibold bg-[#E6F1FB] px-2.5 py-1 rounded-none">
                    Selected: {selectedFit.name} ({selectedFit.code})
                  </span>
                )}
              </div>
              <FitPicker
                fits={fits}
                selectedFitId={selectedFitId}
                onSelect={setSelectedFitId}
              />
            </section>
          )}

          {/* Step 3: Regional Sizing & Unit Matrix */}
          <section className="bg-white border border-[#D1D5DB] rounded-none p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-6">
              <h2 className="text-base font-bold text-[#1A2233] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[#0B1E3D] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  {fits.length > 0 ? "3" : "2"}
                </span>
                Regional Sizing &amp; Unit Quantity Matrix
              </h2>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-none ${
                meetsMoq ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}>
                {totalUnits} Units Configured
              </span>
            </div>
            <SizeQtyTable
              sizeSystems={sizeSystems}
              activeRegion={activeRegion}
              onRegionChange={setActiveRegion}
              quantities={sizeQuantities}
              onChange={setSizeQuantities}
              moqPerFabric={moqPerFabric}
            />
          </section>

          {/* Step 4: Vector Logo & Custom Placement */}
          <section className="bg-white border border-[#D1D5DB] rounded-none p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-6">
              <h2 className="text-base font-bold text-[#1A2233] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[#0B1E3D] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  {fits.length > 0 ? "4" : "3"}
                </span>
                Vector Logo Branding &amp; Placement
              </h2>
              <span className="text-xs font-mono text-[#5B6B85]">
                {logoFile ? `File: ${logoFile.name}` : "Optional Vector Upload"}
              </span>
            </div>
            <LogoUploader
              file={logoFile}
              onFileChange={setLogoFile}
              placement={placement}
              onPlacementChange={setPlacement}
            />
          </section>

          {/* Step 5: Company Info & Budget Target */}
          <section className="bg-white border border-[#D1D5DB] rounded-none p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-6">
              <h2 className="text-base font-bold text-[#1A2233] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[#0B1E3D] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  {fits.length > 0 ? "5" : "4"}
                </span>
                Corporate Info &amp; Target Unit Budget
              </h2>
              <span className="text-xs font-mono text-emerald-700 font-semibold">
                Official Proforma Document
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-semibold text-[#1A2233] mb-1.5 uppercase tracking-wider">
                  Company Name <span className="text-[#A32D2D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Retail Apparel Group"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-[#D1D5DB] rounded-none px-4 py-2.5 text-sm focus:border-[#0B1E3D] focus:ring-1 focus:ring-[#0B1E3D] focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A2233] mb-1.5 uppercase tracking-wider">
                  Corporate Email <span className="text-[#A32D2D]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. procurement@acme.com"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full border border-[#D1D5DB] rounded-none px-4 py-2.5 text-sm focus:border-[#0B1E3D] focus:ring-1 focus:ring-[#0B1E3D] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="bg-[#F5F7FA] border border-[#E5E7EB] p-4 rounded-none">
              <label className="block text-xs font-semibold text-[#1A2233] mb-1 uppercase tracking-wider">
                Target Unit Price / Budget ($ USD) <span className="text-[#5B6B85] font-normal lowercase">(optional)</span>
              </label>
              <input
                type="number"
                step="0.50"
                min="1"
                placeholder="e.g. 18.50"
                value={customerTargetPrice}
                onChange={(e) => setCustomerTargetPrice(e.target.value)}
                className="w-full sm:w-1/2 border border-[#D1D5DB] rounded-none px-4 py-2 text-sm focus:border-[#0B1E3D] focus:outline-none bg-white"
              />
              <p className="text-xs text-[#5B6B85] mt-1.5">
                Our production engineering team evaluates custom pricing feasibility for high-volume orders during proforma review.
              </p>
            </div>
          </section>
        </div>

        {/* Sticky Price Sidebar & Live Spec Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Configured Spec Summary Box */}
          <div className="bg-[#0B1E3D] text-white border border-[#1E3A8A] rounded-none p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#DBB671]">Live Spec Summary</h3>
              <span className="text-[10px] font-mono text-emerald-400">Atelier Ready</span>
            </div>

            <div className="space-y-2.5 text-xs text-[#CBD5E1]">
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8]">Selected Fabric:</span>
                <span className="font-semibold text-white">{selectedFabric?.name || "Standard"}</span>
              </div>
              {selectedFit && (
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">Garment Fit:</span>
                  <span className="font-semibold text-white">{selectedFit.name}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8]">Region Standard:</span>
                <span className="font-mono text-[#60A5FA] font-bold">{activeRegion} Standard</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8]">Branding Placement:</span>
                <span className="font-semibold text-white">{placement === "LEFT_CHEST" ? "Left Chest" : "Right Sleeve"}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2 font-bold text-white">
                <span>Configured Volume:</span>
                <span className={`font-mono ${meetsMoq ? "text-emerald-400" : "text-amber-400"}`}>
                  {totalUnits} / {moqPerFabric} pcs
                </span>
              </div>
            </div>
          </div>

          <PriceSidebar
            fabric={selectedFabric}
            sizeQuantities={toSizeQuantityArray(sizeQuantities)}
            customerTargetPrice={customerTargetPrice}
            onSubmit={handleSubmit}
            submitting={submitting}
            errorMessage={submitError}
            totalUnits={totalUnits}
            moqPerFabric={moqPerFabric}
          />
        </div>
      </div>
    </main>
  );
}
