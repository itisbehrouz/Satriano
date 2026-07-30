"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LogoPlacement } from "@/app/generated/prisma/enums";
import { FabricPicker, type FabricOption } from "@/components/configurator/FabricPicker";
import { SizeQtyTable } from "@/components/configurator/SizeQtyTable";
import { LogoUploader } from "@/components/configurator/LogoUploader";
import { PriceSidebar } from "@/components/configurator/PriceSidebar";
import { DEFAULT_SIZE_QUANTITIES, toSizeQuantityArray } from "@/lib/configuratorLogic";

interface ConfiguratorClientProps {
  fabrics: FabricOption[];
}

export function ConfiguratorClient({ fabrics }: ConfiguratorClientProps) {
  const router = useRouter();
  const [selectedFabricId, setSelectedFabricId] = useState(fabrics[0]?.id ?? "");
  const [sizeQuantities, setSizeQuantities] = useState(DEFAULT_SIZE_QUANTITIES);
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

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fabricId: selectedFabricId,
          companyName,
          companyEmail,
          sizeQuantities: toSizeQuantityArray(sizeQuantities),
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

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-8 py-10 bg-[#F5F7FA] text-[#1A2233]">
      {/* Header Info Banner */}
      <div className="mb-8 bg-white border border-[#D1D5DB] rounded-lg p-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-[#2E5AAC] mb-1">
              Made-To-Order Manufacturing Spec
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#1A2233]">
              Configure Order: Classic Polo Shirt
            </h1>
            <p className="text-sm text-[#5B6B85] mt-1">
              Select luxury materials, size unit matrix, and custom vector logo branding.
            </p>
          </div>
          <div className="bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6] text-xs font-semibold px-3 py-1.5 rounded">
            Live Pricing Active
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
            <FabricPicker
              fabrics={fabrics}
              selectedFabricId={selectedFabricId}
              onSelect={setSelectedFabricId}
            />
          </section>

          <section className="bg-white border border-[#D1D5DB] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1A2233] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E5AAC]">branding_watermark</span>
              2. Vector Branding &amp; Placement
            </h2>
            <p className="text-xs text-[#5B6B85] mb-4">
              Upload your brand vector logo asset (.ai, .eps, .svg) for single-needle embroidery or printing.
            </p>
            <LogoUploader
              file={logoFile}
              onFileChange={setLogoFile}
              placement={placement}
              onPlacementChange={setPlacement}
            />
          </section>

          <section className="bg-white border border-[#D1D5DB] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1A2233] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E5AAC]">straighten</span>
              3. Size &amp; Quantity Matrix
            </h2>
            <SizeQtyTable quantities={sizeQuantities} onChange={setSizeQuantities} />
          </section>

          <section className="bg-white border border-[#D1D5DB] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1A2233] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E5AAC]">domain</span>
              4. Corporate Account Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-1">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85]"
                  htmlFor="companyName"
                >
                  Company Name *
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="e.g. Acme Apparel Corp"
                  className="w-full px-3 py-2.5 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85]"
                  htmlFor="companyEmail"
                >
                  Proforma Email *
                </label>
                <input
                  id="companyEmail"
                  type="email"
                  value={companyEmail}
                  onChange={(event) => setCompanyEmail(event.target.value)}
                  placeholder="buyer@acmeapparel.com"
                  className="w-full px-3 py-2.5 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 mt-2 lg:mt-0">
          {selectedFabric && (
            <PriceSidebar
              fabric={selectedFabric}
              sizeQuantities={toSizeQuantityArray(sizeQuantities)}
              onSubmit={handleSubmit}
              submitting={submitting}
              errorMessage={submitError}
            />
          )}
        </div>
      </div>
    </main>
  );
}
