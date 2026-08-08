"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LogoPlacement } from "@/app/generated/prisma/enums";
import { FabricPicker, type FabricOption } from "@/components/configurator/FabricPicker";
import { ColorPicker } from "@/components/configurator/ColorPicker";
import { FitPicker, type FitOption } from "@/components/configurator/FitPicker";
import { ColorSizeMatrix } from "@/components/configurator/ColorSizeMatrix";
import type { SizeSystemDef } from "@/components/configurator/SizeQtyTable";
import { LogoUploader } from "@/components/configurator/LogoUploader";
import { PriceSidebar } from "@/components/configurator/PriceSidebar";
import { toSizeQuantityArray } from "@/lib/configuratorLogic";
import { addToM2OCart } from "@/lib/m2oCart";
import { validateOrderMoq, type MoqValidationItem } from "@/lib/moqValidation";
import { MaterialComponentSelector, type MaterialSelection } from "@/components/configurator/MaterialComponentSelector";

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
}: ConfiguratorClientProps) {
  const router = useRouter();
  const [selectedFabricId, setSelectedFabricId] = useState(fabrics[0]?.id ?? "");
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [selectedFitId, setSelectedFitId] = useState(fits[0]?.id ?? "");
  const [activeRegion, setActiveRegion] = useState<"EU" | "US">("EU");
  const [useMultiMaterial, setUseMultiMaterial] = useState(false);
  const [multiMaterialSelections, setMultiMaterialSelections] = useState<MaterialSelection[]>([]);
  
  // Matrix quantities: colorId -> sizeLabel -> qty
  const [matrixQuantities, setMatrixQuantities] = useState<Record<string, Record<string, number>>>({});
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [placement, setPlacement] = useState<LogoPlacement>("LEFT_CHEST");
  const [addingToCart, setAddingToCart] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 120);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectedFabric = fabrics.find((fabric) => fabric.id === selectedFabricId) ?? fabrics[0];
  const selectedFit = fits.find((fit) => fit.id === selectedFitId) ?? fits[0];

  // Colors available for currently selected fabric
  const availableColors = selectedFabric?.colors ?? [];
  const moqPerColor = selectedFabric?.moqPerColor ?? 20;

  // Selected color objects
  const activeSelectedColors = availableColors.filter((c) => selectedColorIds.includes(c.id));

  // Reset colors when fabric changes
  function handleFabricSelect(fabricId: string) {
    setSelectedFabricId(fabricId);
    setSelectedColorIds([]);
    setMatrixQuantities({});
  }

  // Toggle color selection
  function handleToggleColor(colorId: string) {
    setSelectedColorIds((prev) => {
      if (prev.includes(colorId)) {
        return prev.filter((id) => id !== colorId);
      } else {
        return [...prev, colorId];
      }
    });
  }

  function handleSelectAllColors() {
    if (selectedColorIds.length === availableColors.length) {
      setSelectedColorIds([]);
    } else {
      setSelectedColorIds(availableColors.map((c) => c.id));
    }
  }

  function handleQuantityChange(colorId: string, sizeLabel: string, qty: number) {
    setMatrixQuantities((prev) => ({
      ...prev,
      [colorId]: {
        ...(prev[colorId] || {}),
        [sizeLabel]: qty,
      },
    }));
  }

  function handleClearAllQuantities() {
    setMatrixQuantities({});
  }

  // Active rows for matrix and MOQ validation
  const activeRows =
    activeSelectedColors.length > 0
      ? activeSelectedColors
      : [{ id: "default", name: "Standard Color", hexCode: null }];

  const moqValidationItems: MoqValidationItem[] = activeRows.map((row) => {
    const rowQtys = matrixQuantities[row.id] || {};
    const totalQty = Object.values(rowQtys).reduce((sum, q) => sum + (q || 0), 0);
    return {
      fabricId: selectedFabricId,
      fabricName: selectedFabric?.name || "Selected Fabric",
      colorId: row.id === "default" ? null : row.id,
      colorName: row.name,
      quantity: totalQty,
      moqPerFabric,
      moqPerColor,
    };
  });

  const moqValidation = validateOrderMoq(moqValidationItems);
  const totalUnits = moqValidationItems.reduce((sum, item) => sum + item.quantity, 0);

  const titleText = subcategoryTitle ? subcategoryTitle : "Classic Polo Shirt";
  const descriptionText =
    subcategoryDescription ||
    "Custom luxury B2B apparel production. Select fabric line, colourways, garment fit, bulk matrix quantities, and vector branding.";

  const hasFitStep = fits.length > 0;

  const steps = [
    { id: "step-fabric", label: "Fabric Line", num: 1, isComplete: !!selectedFabricId },
    {
      id: "step-color",
      label: "Colourways",
      num: 2,
      isComplete: availableColors.length === 0 || selectedColorIds.length > 0,
    },
    ...(hasFitStep
      ? [{ id: "step-fit", label: "Garment Fit", num: 3, isComplete: !!selectedFitId }]
      : []),
    {
      id: "step-sizing",
      label: "Sizing & Quantities",
      num: hasFitStep ? 4 : 3,
      isComplete: moqValidation.valid && totalUnits > 0,
    },
    {
      id: "step-branding",
      label: "Vector Logo",
      num: hasFitStep ? 5 : 4,
      isComplete: logoFile !== null,
    },
  ];

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: isReduced ? "auto" : "smooth" });
    }
  }

  async function handleAddToCart() {
    if (!moqValidation.valid) {
      setSubmitError(moqValidation.error);
      return;
    }

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

      // Create cart items per selected colorway in matrix
      for (const row of activeRows) {
        const rowQtys = matrixQuantities[row.id] || {};
        const sizeQtyArray = toSizeQuantityArray(rowQtys);
        const rowTotal = sizeQtyArray.reduce((sum, sq) => sum + sq.quantity, 0);

        if (rowTotal > 0) {
          const cartItem = {
            id: `${Date.now()}-${row.id}`,
            fabricId: selectedFabricId,
            colorId: row.id === "default" ? undefined : row.id,
            productId: productId || undefined,
            fitId: selectedFitId || undefined,
            sizeQuantities: sizeQtyArray,
            logoUrl: uploadedLogoUrl,
            logoPlacement: placement,
            fabricName: selectedFabric.name,
            colorName: row.name,
            productName: titleText,
            fitName: selectedFit?.name,
            totalUnits: rowTotal,
          };
          addToM2OCart(cartItem);
        }
      }

      router.push("/wholesale/checkout");
    } catch {
      setSubmitError("Failed to add to spec. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  }

  // Combined size quantities for PriceSidebar single-item estimate
  const combinedSizeQuantities: Record<string, number> = {};
  for (const row of activeRows) {
    const rowQtys = matrixQuantities[row.id] || {};
    for (const [size, qty] of Object.entries(rowQtys)) {
      combinedSizeQuantities[size] = (combinedSizeQuantities[size] || 0) + (qty || 0);
    }
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-8 py-6 bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans transition-colors">
      {/* Sticky Stepper Header with Integrated Product Title Block */}
      <div
        className={`sticky top-[61px] md:top-[76px] z-30 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-border)] -mx-4 md:-mx-8 px-4 md:px-8 transition-all duration-200 motion-reduce:transition-none mb-6 ${
          isScrolled ? "py-3 shadow-md" : "py-4 lg:py-5"
        }`}
      >
        <div className="max-w-container-max mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-10">
          {/* Integrated Product Header Block (Proportional max-width) */}
          <div className="space-y-1.5 shrink-0 max-w-full lg:max-w-md xl:max-w-lg pb-3 lg:pb-0 border-b lg:border-b-0 border-[var(--color-border)]/40">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-gold)] uppercase tracking-wider">
              <span>B2B SPEC</span>
              <span>•</span>
              <span>{categoryTitle || "Menswear Atelier"}</span>
            </div>
            <h1
              className={`font-bold tracking-tight text-[var(--color-text-primary)] transition-all ${
                isScrolled ? "text-base md:text-lg leading-tight" : "text-xl md:text-2xl leading-tight"
              }`}
            >
              {titleText}
            </h1>
            {!isScrolled && (
              <p className="text-xs text-[var(--color-text-secondary)] truncate hidden md:block pt-0.5">
                {descriptionText}
              </p>
            )}
          </div>

          {/* 5-Step Navigation Badges */}
          <div className="flex items-center justify-start lg:justify-end gap-3 lg:gap-6 overflow-x-auto scrollbar-none py-1">
            <div className="flex items-center gap-3 lg:gap-5 shrink-0">
              {steps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => scrollToSection(step.id)}
                  className="flex items-center gap-2 group cursor-pointer shrink-0 text-left focus:outline-none"
                >
                  <span
                    className={`w-5 h-5 rounded-none font-mono font-bold flex items-center justify-center text-[10px] transition-colors ${
                      step.isComplete
                        ? "bg-[var(--color-status-success)] text-white"
                        : "bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] group-hover:border-[var(--color-accent)]"
                    }`}
                  >
                    {step.isComplete ? (
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    ) : (
                      step.num
                    )}
                  </span>
                  <span
                    className={`font-mono uppercase tracking-wider transition-colors ${
                      isScrolled ? "text-[10px]" : "text-xs"
                    } ${
                      step.isComplete
                        ? "font-semibold text-[var(--color-text-primary)]"
                        : "font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Single Source of Truth Stepper MOQ Badge */}
            <span
              className={`font-mono text-xs px-2.5 py-1 rounded-none border transition-colors shrink-0 ml-1 lg:ml-3 ${
                moqValidation.valid && totalUnits > 0
                  ? "bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border-[var(--color-status-success)]/30"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/30"
              }`}
            >
              {totalUnits} / {moqPerFabric} pcs
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Configurator Form Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Step 1: Material Selection */}
          <section
            id="step-fabric"
            className="scroll-mt-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  1
                </span>
                Material &amp; Fabric Selection
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseMultiMaterial(!useMultiMaterial)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline mr-2"
                >
                  {useMultiMaterial ? "← Standard Fabric Selection" : "→ Multi-Material Specifications (Advanced)"}
                </button>
                <span className="text-xs font-mono text-[var(--color-accent)] font-semibold bg-[var(--color-accent)]/10 px-2.5 py-1 rounded-none border border-[var(--color-accent)]/20">
                  {fabrics.length} Fabrics Available
                </span>
              </div>
            </div>

            {useMultiMaterial ? (
              <MaterialComponentSelector
                productId={productId || "prod_default"}
                availableMaterials={fabrics}
                requiredComponents={["MAIN_FABRIC", "LINING"]}
                onMaterialsChange={setMultiMaterialSelections}
                isMultiMaterial={true}
              />
            ) : (
              selectedFabric && (
                <FabricPicker
                  fabrics={fabrics}
                  selectedFabricId={selectedFabricId}
                  onSelect={handleFabricSelect}
                />
              )
            )}
          </section>

          {/* Step 2: Colourway Selection */}
          <section
            id="step-color"
            className="scroll-mt-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  2
                </span>
                Colourway Selection
              </h2>
              {selectedColorIds.length > 0 && (
                <span className="text-xs font-mono text-[var(--color-accent)] font-semibold bg-[var(--color-accent)]/10 px-2.5 py-1 rounded-none border border-[var(--color-accent)]/20">
                  {selectedColorIds.length} Colourways Selected
                </span>
              )}
            </div>

            <ColorPicker
              colors={availableColors}
              selectedColorIds={selectedColorIds}
              onToggleColor={handleToggleColor}
              onSelectAll={handleSelectAllColors}
            />
          </section>

          {/* Step 3: Garment Fit Selection */}
          {hasFitStep && (
            <section
              id="step-fit"
              className="scroll-mt-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
                <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                    3
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

          {/* Step 4: Bulk Order Size Matrix */}
          <section
            id="step-sizing"
            className="scroll-mt-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  {hasFitStep ? "4" : "3"}
                </span>
                Bulk Order Size Matrix
              </h2>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-none ${
                  moqValidation.valid && totalUnits > 0
                    ? "bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/30"
                    : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                }`}
              >
                {totalUnits} Units Configured
              </span>
            </div>

            <ColorSizeMatrix
              selectedColors={activeSelectedColors}
              sizeSystems={sizeSystems}
              activeRegion={activeRegion}
              onRegionChange={setActiveRegion}
              matrixQuantities={matrixQuantities}
              onQuantityChange={handleQuantityChange}
              onClearAll={handleClearAllQuantities}
              moqPerFabric={moqPerFabric}
              moqPerColor={moqPerColor}
              fabricName={selectedFabric?.name || "Selected Fabric"}
            />
          </section>

          {/* Step 5: Vector Logo & Custom Placement */}
          <section
            id="step-branding"
            className="scroll-mt-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center rounded-none">
                  {hasFitStep ? "5" : "4"}
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
                Live Spec Summary
              </h3>
              <span className="text-[10px] font-mono text-[var(--color-status-success)]">
                Atelier Ready
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-[var(--color-text-secondary)]">
              <div className="flex justify-between items-center">
                <span>Selected Fabric:</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {selectedFabric?.name || "Standard"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Selected Colours:</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {activeSelectedColors.length > 0
                    ? `${activeSelectedColors.length} colourways`
                    : "Standard Colorway"}
                </span>
              </div>
              {selectedFit && (
                <div className="flex justify-between items-center">
                  <span>Garment Fit:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {selectedFit.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Region Standard:</span>
                <span className="font-mono text-[var(--color-accent)] font-bold">
                  {activeRegion} Standard
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Branding Placement:</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {placement === "LEFT_CHEST" ? "Left Chest" : "Right Sleeve"}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[var(--color-border)] pt-2 font-bold text-[var(--color-text-primary)]">
                <span>Configured Volume:</span>
                <span
                  className={`font-mono ${
                    moqValidation.valid && totalUnits > 0
                      ? "text-[var(--color-status-success)]"
                      : "text-amber-500"
                  }`}
                >
                  {totalUnits} / {moqPerFabric} pcs
                </span>
              </div>
            </div>
          </div>

          <PriceSidebar
            fabric={selectedFabric}
            sizeQuantities={toSizeQuantityArray(combinedSizeQuantities)}
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
