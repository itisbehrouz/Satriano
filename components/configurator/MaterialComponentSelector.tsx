"use client";

import { useState } from "react";
export interface MaterialSelection {
  materialId: string;
  colorId?: string | null;
  component: string;
  composition?: string;
  ratio?: number;
}

export interface AvailableFabricColor {
  id: string;
  name: string;
  hex?: string | null;
  hexCode?: string | null;
}

export interface AvailableFabric {
  id: string;
  name: string;
  priceMinCents: number;
  priceMaxCents: number;
  colors?: AvailableFabricColor[];
}

interface MaterialComponentSelectorProps {
  productId: string;
  availableMaterials: AvailableFabric[];
  requiredComponents?: string[];
  onMaterialsChange: (materials: MaterialSelection[]) => void;
  isMultiMaterial?: boolean;
}

const COMPONENT_LABELS: Record<string, string> = {
  MAIN_FABRIC: "Main Fabric",
  LINING: "Lining",
  TRIM: "Trim",
  COLLAR: "Collar",
  CUFF: "Cuff",
  SOLE: "Sole",
  HEEL: "Heel",
  UPPER: "Upper Material",
  BACKING: "Backing",
  FILL: "Fill",
  INTERFACING: "Interfacing",
  BINDING: "Binding",
  LABEL: "Label",
  OTHER: "Other",
};

export function MaterialComponentSelector({
  productId: _productId,
  availableMaterials,
  requiredComponents = ["MAIN_FABRIC"],
  onMaterialsChange,
  isMultiMaterial = false,
}: MaterialComponentSelectorProps) {
  const [selections, setSelections] = useState<MaterialSelection[]>(
    requiredComponents.map((comp) => ({
      materialId: availableMaterials[0]?.id || "",
      colorId: availableMaterials[0]?.colors?.[0]?.id || null,
      component: comp,
    }))
  );

  const handleMaterialChange = (component: string, materialId: string) => {
    const updated = selections.map((sel) =>
      sel.component === component
        ? { ...sel, materialId, colorId: null }
        : sel
    );
    setSelections(updated);
    onMaterialsChange(updated);
  };

  const handleColorChange = (component: string, colorId: string) => {
    const updated = selections.map((sel) =>
      sel.component === component ? { ...sel, colorId } : sel
    );
    setSelections(updated);
    onMaterialsChange(updated);
  };

  const handleCompositionChange = (component: string, composition: string) => {
    const updated = selections.map((sel) =>
      sel.component === component ? { ...sel, composition } : sel
    );
    setSelections(updated);
    onMaterialsChange(updated);
  };

  const handleRatioChange = (component: string, ratio: number) => {
    const updated = selections.map((sel) =>
      sel.component === component ? { ...sel, ratio } : sel
    );
    setSelections(updated);
    onMaterialsChange(updated);
  };

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="font-semibold text-gray-900">
          {isMultiMaterial ? "Material Specifications" : "Fabric Selection"}
        </h3>
        <p className="text-sm text-gray-600">
          {isMultiMaterial
            ? "Select materials for each component"
            : "Choose your preferred fabric and color"}
        </p>
      </div>

      {selections.map((selection) => {
        const material = availableMaterials.find(
          (m) => m.id === selection.materialId
        );

        return (
          <div
            key={selection.component}
            className="space-y-3 rounded-lg bg-gray-50 p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-900">
                {COMPONENT_LABELS[selection.component] || selection.component}
              </label>
              {selection.component !== "MAIN_FABRIC" && (
                <span className="text-xs font-medium text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded">
                  Optional
                </span>
              )}
            </div>

            {/* Material Selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Material
              </label>
              <select
                value={selection.materialId}
                onChange={(e) =>
                  handleMaterialChange(selection.component, e.target.value)
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {availableMaterials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </select>
              {material && (
                <p className="mt-1 text-xs text-gray-600">
                  Price range: ${(material.priceMinCents / 100).toFixed(2)} -
                  ${(material.priceMaxCents / 100).toFixed(2)} per unit
                </p>
              )}
            </div>

            {/* Color Selector */}
            {material && material.colors && material.colors.length > 0 && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Color
                </label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {material.colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() =>
                        handleColorChange(selection.component, color.id)
                      }
                      className={`flex items-center gap-2 rounded-lg border-2 p-2 transition ${
                        selection.colorId === color.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="h-5 w-5 rounded-full border border-gray-300 shadow-inner"
                        style={{ backgroundColor: color.hex || color.hexCode || "#000000" }}
                      />
                      <span className="text-xs font-medium text-gray-800">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Composition (for multi-material blends) */}
            {isMultiMaterial && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Composition (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 80% Wool / 20% Cashmere"
                  value={selection.composition || ""}
                  onChange={(e) =>
                    handleCompositionChange(selection.component, e.target.value)
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Ratio (for multi-material lines) */}
            {isMultiMaterial && selection.component !== "MAIN_FABRIC" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Quantity Ratio (Optional)
                </label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  placeholder="e.g. 0.5 for 50% ratio"
                  value={selection.ratio || ""}
                  onChange={(e) =>
                    handleRatioChange(
                      selection.component,
                      e.target.value ? Number(e.target.value) : 0
                    )
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Decimal ratio (0.0 to 1.0) relative to total garment quantity
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
