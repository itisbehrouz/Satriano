"use client";

import React, { useState, useEffect } from "react";
import { FabricWithColors, FabricColorItem } from "./FabricColorTree";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";
import { FabricPriceRangeEditor } from "./FabricPriceRangeEditor";

interface FabricColorPanelProps {
  fabric: FabricWithColors | null;
  productName?: string;
  categoryName?: string;
  subcategoryName?: string;
  onRefresh: () => void;
}

export function FabricColorPanel({
  fabric,
  productName,
  categoryName,
  subcategoryName,
  onRefresh,
}: FabricColorPanelProps) {
  const { t } = useAdminLanguage();
  const [colors, setColors] = useState<FabricColorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State for Add Color
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState("#0A0A0A");
  const [newSource, setNewSource] = useState<"MANUAL" | "SUPPLIER_VERIFIED" | "PLACEHOLDER">("MANUAL");
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHex, setEditHex] = useState("#000000");
  const [editSource, setEditSource] = useState<"MANUAL" | "SUPPLIER_VERIFIED" | "PLACEHOLDER">("MANUAL");
  const [editActive, setEditActive] = useState(true);

  // Warning Modal State for Delete with Order References
  const [deleteWarningColor, setDeleteWarningColor] = useState<{ id: string; name: string; count: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchColors = async (fabricId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/catalog/fabric-colors?fabricId=${fabricId}`);
      if (!res.ok) throw new Error("Failed to load fabric colors");
      const data = await res.json();
      setColors(data.colors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load colors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fabric?.id) {
      fetchColors(fabric.id);
    } else {
      setColors([]);
    }
  }, [fabric?.id]);

  if (!fabric) {
    return (
      <div className="bg-[#F7F8FA] border border-[#EAECF0] rounded-md p-8 text-center text-[#5B6B85]">
        Select a fabric line from the accordion tree on the left to manage its colourways.
      </div>
    );
  }

  const placeholderCount = colors.filter((c) => c.source === "PLACEHOLDER").length;

  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/catalog/fabric-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fabricId: fabric.id,
          name: newName.trim(),
          hex: newHex.trim(),
          source: newSource,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add color");
      }

      setNewName("");
      setNewHex("#0A0A0A");
      setNewSource("MANUAL");
      await fetchColors(fabric.id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add color");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateColor = async (colorId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/catalog/fabric-colors/${colorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          hex: editHex.trim(),
          source: editSource,
          active: editActive,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update color");
      }

      setEditingColorId(null);
      await fetchColors(fabric.id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update color");
    }
  };

  const handleSortOrder = async (colorId: string, currentSortOrder: number, direction: "up" | "down") => {
    const targetSortOrder = direction === "up" ? currentSortOrder - 1 : currentSortOrder + 1;
    if (targetSortOrder < 0) return;

    try {
      await fetch(`/api/admin/catalog/fabric-colors/${colorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: targetSortOrder }),
      });
      await fetchColors(fabric.id);
      onRefresh();
    } catch (err) {
      console.error("Failed to reorder color", err);
    }
  };

  const handleDeleteColor = async (colorId: string, colorName: string, force = false) => {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/catalog/fabric-colors/${colorId}${force ? "?force=true" : ""}`, {
        method: "DELETE",
      });

      if (res.status === 409) {
        const data = await res.json();
        if (data.orderLineCount && !force) {
          setDeleteWarningColor({
            id: colorId,
            name: colorName,
            count: data.orderLineCount,
          });
          setDeleting(false);
          return;
        }
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete color");
      }

      setDeleteWarningColor(null);
      await fetchColors(fabric.id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete color");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearPlaceholders = async () => {
    if (!confirm(`Are you sure you want to clear all ${placeholderCount} placeholder colors for ${fabric.name}?`)) {
      return;
    }

    setError(null);
    try {
      const res = await fetch(`/api/admin/catalog/fabric-colors/clear-placeholders?fabricId=${fabric.id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to clear placeholder colors");
      await fetchColors(fabric.id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear placeholders");
    }
  };

  const renderSourceBadge = (source: "PLACEHOLDER" | "SUPPLIER_VERIFIED" | "MANUAL") => {
    switch (source) {
      case "PLACEHOLDER":
        return (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30">
            PLACEHOLDER
          </span>
        );
      case "SUPPLIER_VERIFIED":
        return (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            VERIFIED
          </span>
        );
      case "MANUAL":
      default:
        return (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-300">
            MANUAL
          </span>
        );
    }
  };

  const [showPriceEditor, setShowPriceEditor] = useState(false);

  return (
    <div className="bg-white border border-[#EAECF0] rounded-md p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAECF0] pb-4">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#2E5AAC]">
            {categoryName} → {subcategoryName} → {productName}
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#1A2233]">{fabric.name}</h2>
            <button
              type="button"
              onClick={() => setShowPriceEditor(!showPriceEditor)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
            >
              {showPriceEditor ? "Close Pricing Editor" : "Edit Pricing & MOQ"}
            </button>
          </div>
        </div>

        {placeholderCount > 0 && (
          <button
            type="button"
            onClick={handleClearPlaceholders}
            className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-300 rounded text-xs font-semibold hover:bg-amber-100 transition-colors shrink-0"
          >
            {t.clearPlaceholders} ({placeholderCount})
          </button>
        )}
      </div>

      {showPriceEditor && (
        <FabricPriceRangeEditor
          fabric={fabric}
          onSave={() => {
            setShowPriceEditor(false);
            onRefresh();
          }}
          onCancel={() => setShowPriceEditor(false)}
        />
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      {/* Add Color Form */}
      <form onSubmit={handleAddColor} className="bg-[#F7F8FA] border border-[#EAECF0] rounded-md p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A2233]">
          {t.addColorway}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#5B6B85] uppercase mb-1">
              {t.colorNameLabel} *
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Midnight Navy"
              className="w-full px-3 py-2 bg-white border border-[#EAECF0] rounded text-xs text-[#1A2233] focus:outline-none focus:border-[#2E5AAC]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#5B6B85] uppercase mb-1">
              {t.hexColor}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newHex}
                onChange={(e) => setNewHex(e.target.value.toUpperCase())}
                className="w-8 h-8 rounded border border-[#EAECF0] cursor-pointer p-0 bg-transparent"
              />
              <input
                type="text"
                value={newHex}
                onChange={(e) => setNewHex(e.target.value.toUpperCase())}
                placeholder="#0A0A0A"
                className="w-full px-3 py-2 bg-white border border-[#EAECF0] rounded text-xs font-mono text-[#1A2233] focus:outline-none focus:border-[#2E5AAC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#5B6B85] uppercase mb-1">
              {t.sourceType}
            </label>
            <select
              value={newSource}
              onChange={(e) => setNewSource(e.target.value as "MANUAL" | "SUPPLIER_VERIFIED" | "PLACEHOLDER")}
              className="w-full px-3 py-2 bg-white border border-[#EAECF0] rounded text-xs text-[#1A2233] focus:outline-none focus:border-[#2E5AAC]"
            >
              <option value="MANUAL">MANUAL</option>
              <option value="SUPPLIER_VERIFIED">SUPPLIER_VERIFIED</option>
              <option value="PLACEHOLDER">PLACEHOLDER</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-[#2E5AAC] text-white rounded text-xs font-bold hover:bg-[#1E3F7A] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? t.creating : t.addColor}
        </button>
      </form>

      {/* Colors Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A2233] mb-3">
          Existing Colorways ({colors.length})
        </h3>

        {loading ? (
          <div className="p-6 text-center text-xs text-[#5B6B85]">Loading colors...</div>
        ) : colors.length === 0 ? (
          <div className="p-6 bg-[#F7F8FA] border border-[#EAECF0] rounded text-center text-xs text-[#5B6B85]">
            No colors defined for this fabric yet. Use the form above to add initial colorways.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {colors.map((color) => {
              const isEditing = editingColorId === color.id;

              if (isEditing) {
                return (
                  <div key={color.id} className="bg-[#F7F8FA] border border-[#2E5AAC] rounded-md p-3 space-y-3">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-[#EAECF0] rounded text-xs text-[#1A2233]"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editHex}
                          onChange={(e) => setEditHex(e.target.value.toUpperCase())}
                          className="w-6 h-6 rounded border cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={editHex}
                          onChange={(e) => setEditHex(e.target.value.toUpperCase())}
                          className="w-full px-2 py-1 bg-white border border-[#EAECF0] rounded text-xs font-mono"
                        />
                      </div>
                      <select
                        value={editSource}
                        onChange={(e) => setEditSource(e.target.value as "MANUAL" | "SUPPLIER_VERIFIED" | "PLACEHOLDER")}
                        className="w-full px-2 py-1 bg-white border border-[#EAECF0] rounded text-xs"
                      >
                        <option value="MANUAL">MANUAL</option>
                        <option value="SUPPLIER_VERIFIED">SUPPLIER_VERIFIED</option>
                        <option value="PLACEHOLDER">PLACEHOLDER</option>
                      </select>
                      <label className="flex items-center gap-2 text-xs text-[#1A2233] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                        />
                        <span>Active</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateColor(color.id)}
                        className="px-2.5 py-1 bg-[#2E5AAC] text-white rounded text-[11px] font-bold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingColorId(null)}
                        className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded text-[11px] font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={color.id}
                  className={`border rounded-md p-3 flex flex-col justify-between space-y-3 transition-colors ${
                    color.active ? "bg-white border-[#EAECF0]" : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 rounded border border-black/10 shrink-0 shadow-sm"
                        style={{ backgroundColor: color.hex || "#FFFFFF" }}
                      />
                      <div>
                        <div className="text-xs font-bold text-[#1A2233]">{color.name}</div>
                        <div className="text-[10px] font-mono text-[#5B6B85]">
                          {color.hex || "No hex"}
                        </div>
                      </div>
                    </div>

                    {renderSourceBadge(color.source)}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#EAECF0] pt-2 text-[11px]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSortOrder(color.id, color.sortOrder, "up")}
                        className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-mono"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSortOrder(color.id, color.sortOrder, "down")}
                        className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-mono"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <span className="text-[10px] font-mono text-[#5B6B85] ml-1">
                        order: {color.sortOrder}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingColorId(color.id);
                          setEditName(color.name);
                          setEditHex(color.hex || "#000000");
                          setEditSource(color.source);
                          setEditActive(color.active);
                        }}
                        className="text-[#2E5AAC] hover:underline font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteColor(color.id, color.name)}
                        className="text-red-600 hover:underline font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Warning Modal for Delete with Order References */}
      {deleteWarningColor && (
        <div className="fixed inset-0 bg-[#0B1E3D]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 max-w-md w-full shadow-lg space-y-4">
            <h3 className="text-base font-bold text-[#1A2233] flex items-center gap-2">
              <span className="text-amber-500">⚠️</span> Referenced Color Warning
            </h3>
            <p className="text-xs text-[#5B6B85]">
              Bu renk <strong>{deleteWarningColor.count}</strong> siparişte kullanılmış.
              Silme işlemi geçmiş kayıtları etkilemez (selectedColor snapshot korunur) ama gelecekte bu renk seçilemez.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteWarningColor(null)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs font-semibold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteColor(deleteWarningColor.id, deleteWarningColor.name, true)}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
              >
                {deleting ? "Siliniyor..." : "Yine de Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
