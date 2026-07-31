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

interface ConfiguratorClientProps {
  productId?: string;
  fabrics: FabricOption[];
  fits?: FitOption[];
  subcategoryTitle?: string;
  subcategoryDescription?: string;
  categoryTitle?: string;
  sizeSystems?: SizeSystemDef[];
}

export function ConfiguratorClient({
  productId,
  fabrics,
  fits = [],
  subcategoryTitle,
  subcategoryDescription,
  categoryTitle,
  sizeSystems = [],
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

  async function handleSubmit() {
    if (!companyName.trim() || !companyEmail.trim()) {
      setSubmitError("Company name and email are required.");
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
          setSubmitError("Failed to upload logo file. Please try again.");
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
        setSubmitError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(`/proforma/${json.orderId}`);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const titleText = subcategoryTitle ? `Configure Order: ${subcategoryTitle}` : "Configure Order: Classic Polo Shirt";
  const descriptionText = subcategoryDescription || "Select luxury materials, garment fit, size unit matrix, and custom vector logo branding.";

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-8 py-10 bg-[#F5F7FA] text-[#1A2233]">
      {/* Header Info Banner */}
      <div className="mb-8 bg-white border border-[#D1D5DB] rounded-lg p-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-[#2E5AAC] mb-1">
              Made-To-Order Manufacturing Spec {categoryTitle ? `• ${categoryTitle}` : ""}
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#1A2233]">
              {titleText}
            </h1>
            <p className="text-sm text-[#5B6B85] mt-1">
              {descriptionText}
            </p>
          </div>
          <div className="bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6] text-xs font-semibold px-3 py-1.5 rounded">
            Feasibility Review Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <section className="bg-white border border-[#D1D5DB] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1A2233] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E5AAC]">layers</span>
              1. Material Selection
            </h2>
            {selectedFabric && (
              <FabricPicker
                fabrics={fabrics}
                selectedFabricId={selectedFabricId}
                onSelect={setSelectedFabricId}
              />
            )}
          </section>

          {fits.length > 0 && (
            <section className="bg-white border border-[#D1D5DB] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-[#1A2233] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2E5AAC]">checkroom</span>
                2. Garment Fit (Kalıp) Selection
              </h2>
              <FitPicker
                fits={fits}
                selectedFitId={selectedFitId}
                onSelect={setSelectedFitId}
              />
            </section>
          )}

          <section className="bg-white border border-[#D1D5DB] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1A2233] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E5AAC]">grid_on</span>
              {fits.length > 0 ? "3" : "2"}. Regional Sizing &amp; Unit Matrix
            </h2>
            <SizeQtyTable
              sizeSystems={sizeSystems}
              activeRegion={activeRegion}
              onRegionChange={setActiveRegion}
              quantities={sizeQuantities}
              onChange={setSizeQuantities}
            />
          </section>

          <section className="bg-white border border-[#D1D5DB] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1A2233] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E5AAC]">upload_file</span>
              {fits.length > 0 ? "4" : "3"}. Vector Logo &amp; Placement
            </h2>
            <LogoUploader
              file={logoFile}
              onFileChange={setLogoFile}
              placement={placement}
              onPlacementChange={setPlacement}
            />
          </section>

          <section className="bg-white border border-[#D1D5DB] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1A2233] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E5AAC]">corporate_fare</span>
              {fits.length > 0 ? "5" : "4"}. Company Information &amp; Target Budget
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A2233] mb-1">
                  Company Name <span className="text-[#A32D2D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Acme Manufacturing Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#2E5AAC] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A2233] mb-1">
                  Corporate Email <span className="text-[#A32D2D]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="procurement@acme.com"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#2E5AAC] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A2233] mb-1">
                Your Target Price / Budget Per Unit ($ USD) <span className="text-[#5B6B85] font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.50"
                min="1"
                placeholder="e.g. 18.50"
                value={customerTargetPrice}
                onChange={(e) => setCustomerTargetPrice(e.target.value)}
                className="w-full sm:w-1/2 border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#2E5AAC] focus:outline-none"
              />
              <p className="text-xs text-[#5B6B85] mt-1">
                Provide your target unit budget. Our production team evaluates feasibility during review.
              </p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <PriceSidebar
            fabric={selectedFabric}
            sizeQuantities={toSizeQuantityArray(sizeQuantities)}
            customerTargetPrice={customerTargetPrice}
            onSubmit={handleSubmit}
            submitting={submitting}
            errorMessage={submitError}
          />
        </div>
      </div>
    </main>
  );
}
