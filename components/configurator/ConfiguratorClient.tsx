"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LogoPlacement } from "@/app/generated/prisma/enums";
import { FabricPicker, type FabricOption } from "@/components/configurator/FabricPicker";
import { FitPicker, type FitOption } from "@/components/configurator/FitPicker";
import { SizeQtyTable, type SizeSystemDef } from "@/components/configurator/SizeQtyTable";
import { LogoUploader } from "@/components/configurator/LogoUploader";
import { PriceSidebar } from "@/components/configurator/PriceSidebar";
import { DEFAULT_SIZE_QUANTITIES, toSizeQuantityArray } from "@/lib/configuratorLogic";
import { addToM2OCart } from "@/lib/m2oCart";

interface ConfiguratorClientProps {
  productId?: string;
  fabrics: FabricOption[];
  fits?: FitOption[];
  subcategoryTitle?: string;
  subcategoryDescription?: string;
  categoryTitle?: string;
  sizeSystems?: SizeSystemDef[];
  moqPerFabric?: number;
  isLoggedIn?: boolean;
  initialCompanyEmail?: string;
  initialCompanyName?: string;
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
  isLoggedIn = false,
  initialCompanyEmail = "",
  initialCompanyName = "",
}: ConfiguratorClientProps) {
  const router = useRouter();
  const [selectedFabricId, setSelectedFabricId] = useState(fabrics[0]?.id ?? "");
  const [selectedFitId, setSelectedFitId] = useState(fits[0]?.id ?? "");
  const [activeRegion, setActiveRegion] = useState<"EU" | "US">("EU");
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>(DEFAULT_SIZE_QUANTITIES);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [placement, setPlacement] = useState<LogoPlacement>("LEFT_CHEST");
  const [addingToCart, setAddingToCart] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedFabric = fabrics.find((fabric) => fabric.id === selectedFabricId) ?? fabrics[0];
  const selectedFit = fits.find((fit) => fit.id === selectedFitId) ?? fits[0];

  const totalUnits = Object.values(sizeQuantities).reduce((sum, qty) => sum + (qty || 0), 0);
  const meetsMoq = totalUnits >= moqPerFabric;

  async function handleAddToCart() {
    setSubmitError(null);
    setAddingToCart(true);
    
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
          setAddingToCart(false);
          return;
        }

        const uploadJson = await uploadRes.json();
        uploadedLogoUrl = uploadJson.url || uploadJson.storageUrl;
      }

      const cartItem = {
        id: Date.now().toString(),
        fabricId: selectedFabricId,
        productId: productId || undefined,
        fitId: selectedFitId || undefined,
        sizeQuantities: toSizeQuantityArray(sizeQuantities),
        logoUrl: uploadedLogoUrl,
        logoPlacement: placement,
        fabricName: selectedFabric.name,
        productName: titleText,
        fitName: selectedFit?.name,
        totalUnits,
      };

      addToM2OCart(cartItem);
      router.push("/configure/checkout");
    } catch {
      setSubmitError("Failed to add to spec. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  }

  const titleText = subcategoryTitle ? subcategoryTitle : "Classic Polo Shirt";
  const descriptionText =
    subcategoryDescription ||
    "Custom luxury B2B apparel production. Select fabric line, garment fit, regional size quantities, and vector branding.";

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-8 py-10 bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans transition-colors">
      {/* Executive Product Header Shell */}
      <div className="mb-8 bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none p-6 md:p-8 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-gold)] uppercase tracking-wider">
              <span>B2B Production Spec</span>
              <span>•</span>
              <span>{categoryTitle || "Menswear Atelier"}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {titleText}
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
              {descriptionText}
            </p>
          </div>

          {/* Quick Feasibility & Live Progress Badge */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 rounded-none min-w-[240px] text-right space-y-1.5 shrink-0">
            <div className="flex items-center justify-end gap-2">
              <span className="w-2 h-2 rounded-none bg-[var(--color-status-success)] animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-status-success)]">
                Atelier Engineering Desk
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              MOQ Threshold: <strong className="text-[var(--color-text-primary)] font-mono">{moqPerFabric} pcs</strong>
            </p>
            <div className="inline-block text-[11px] font-mono px-2.5 py-1 bg-[var(--color-surface)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-none">
              Configured: {totalUnits} / {moqPerFabric} pcs
            </div>
          </div>
        </div>

        {/* Visual Spec Stepper Bar */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border)] grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-[var(--color-gold)]">
            <span className="w-5 h-5 bg-[var(--color-gold)] text-[var(--color-bg)] font-bold flex items-center justify-center rounded-none text-[10px]">
              1
            </span>
            <span className="font-bold uppercase tracking-wider">Fabric Line</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <span className="w-5 h-5 bg-[var(--color-border)] text-[var(--color-text-primary)] font-bold flex items-center justify-center rounded-none text-[10px]">
              2
            </span>
            <span className="font-semibold uppercase tracking-wider">Fit &amp; Sizing</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <span className="w-5 h-5 bg-[var(--color-border)] text-[var(--color-text-primary)] font-bold flex items-center justify-center rounded-none text-[10px]">
              3
            </span>
            <span className="font-semibold uppercase tracking-wider">Vector Logo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Configurator Form Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Step 1: Material Selection */}
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  1
                </span>
                Material &amp; Fabric Selection
              </h2>
              <span className="text-xs font-mono text-[var(--color-accent)] font-semibold bg-[var(--color-accent)]/10 px-2.5 py-1 rounded-none border border-[var(--color-accent)]/20">
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
            <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 transition-colors">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
                <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                    2
                  </span>
                  Garment Fit Selection
                </h2>
                {selectedFit && (
                  <span className="text-xs font-mono text-[var(--color-accent)] font-semibold bg-[var(--color-accent)]/10 px-2.5 py-1 rounded-none border border-[var(--color-accent)]/20">
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
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  {fits.length > 0 ? "3" : "2"}
                </span>
                Regional Sizing &amp; Unit Quantity Matrix
              </h2>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-none ${
                meetsMoq ? "bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/30" : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
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
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  {fits.length > 0 ? "4" : "3"}
                </span>
                Vector Logo Branding &amp; Placement
              </h2>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">
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
        </div>
        {/* Sticky Price Sidebar & Live Spec Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Configured Spec Summary Box */}
          <div className="bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none p-5 space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">Live Spec Summary</h3>
              <span className="text-[10px] font-mono text-[var(--color-status-success)]">Atelier Ready</span>
            </div>

            <div className="space-y-2.5 text-xs text-[var(--color-text-secondary)]">
              <div className="flex justify-between items-center">
                <span>Selected Fabric:</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{selectedFabric?.name || "Standard"}</span>
              </div>
              {selectedFit && (
                <div className="flex justify-between items-center">
                  <span>Garment Fit:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{selectedFit.name}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Region Standard:</span>
                <span className="font-mono text-[var(--color-accent)] font-bold">{activeRegion} Standard</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Branding Placement:</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{placement === "LEFT_CHEST" ? "Left Chest" : "Right Sleeve"}</span>
              </div>
              <div className="flex justify-between items-center border-t border-[var(--color-border)] pt-2 font-bold text-[var(--color-text-primary)]">
                <span>Configured Volume:</span>
                <span className={`font-mono ${meetsMoq ? "text-[var(--color-status-success)]" : "text-amber-500"}`}>
                  {totalUnits} / {moqPerFabric} pcs
                </span>
              </div>
            </div>
          </div>

          <PriceSidebar
            fabric={selectedFabric}
            sizeQuantities={toSizeQuantityArray(sizeQuantities)}
            customerTargetPrice={""}
            onSubmit={handleAddToCart}
            submitting={addingToCart}
            errorMessage={submitError}
            totalUnits={totalUnits}
            moqPerFabric={moqPerFabric}
            submitLabel="ADD TO ORDER SPEC"
          />
        </div>
      </div>
    </main>
  );
}
