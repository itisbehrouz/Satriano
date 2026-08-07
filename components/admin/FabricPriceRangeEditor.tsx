"use client";

import { useState } from "react";
interface FabricLike {
  id: string;
  name: string;
  priceMinCents: number;
  priceMaxCents: number;
  moqPerColor?: number;
  moqPerFabric?: number;
}

interface FabricPriceRangeEditorProps {
  fabric: FabricLike;
  onSave?: (fabric: any) => void;
  onCancel?: () => void;
}

export function FabricPriceRangeEditor({
  fabric,
  onSave,
  onCancel,
}: FabricPriceRangeEditorProps) {
  const [minCents, setMinCents] = useState(fabric.priceMinCents);
  const [maxCents, setMaxCents] = useState(fabric.priceMaxCents);
  const [moqPerColor, setMoqPerColor] = useState(fabric.moqPerColor ?? 20);
  const [moqPerFabric, setMoqPerFabric] = useState(fabric.moqPerFabric ?? 50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (minCents < 0 || maxCents < 0 || moqPerColor <= 0 || moqPerFabric <= 0) {
      setError("All pricing and MOQ values must be positive");
      return;
    }

    if (minCents > maxCents) {
      setError("Minimum price cannot exceed maximum price");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/catalog/fabric/${fabric.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceMinCents: minCents,
          priceMaxCents: maxCents,
          moqPerColor,
          moqPerFabric,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save fabric pricing");
      }

      const updated = await response.json();
      setSuccess(true);
      setTimeout(() => onSave?.(updated), 500);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-1 border-b border-gray-100 pb-3">
        <label className="block text-sm font-semibold text-gray-900">
          Fabric: <span>{fabric.name}</span>
        </label>
        <p className="text-xs text-gray-500">Edit pricing scale and MOQ thresholds</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm font-medium text-green-700">
          ✓ Saved successfully
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Min Price */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
            Min Price per Unit (¢)
          </label>
          <input
            type="number"
            value={minCents}
            onChange={(e) => setMinCents(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. 2500"
            min={0}
          />
          <p className="text-xs text-gray-500">
            ${(minCents / 100).toFixed(2)}/unit
          </p>
        </div>

        {/* Max Price */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
            Max Price per Unit (¢)
          </label>
          <input
            type="number"
            value={maxCents}
            onChange={(e) => setMaxCents(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. 4500"
            min={0}
          />
          <p className="text-xs text-gray-500">
            ${(maxCents / 100).toFixed(2)}/unit
          </p>
        </div>

        {/* MOQ Per Color */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
            MOQ per Colorway
          </label>
          <input
            type="number"
            value={moqPerColor}
            onChange={(e) => setMoqPerColor(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. 20"
            min={1}
          />
          <p className="text-xs text-gray-500">Minimum units per color</p>
        </div>

        {/* MOQ Per Fabric */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
            MOQ per Fabric Line
          </label>
          <input
            type="number"
            value={moqPerFabric}
            onChange={(e) => setMoqPerFabric(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. 50"
            min={1}
          />
          <p className="text-xs text-gray-500">Total units required</p>
        </div>
      </div>

      <div className="flex gap-2 border-t border-gray-200 pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
