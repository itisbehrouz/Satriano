"use client";

import { SupplierRecord } from "./EditSupplierModal";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

export interface SupplierDetailModalProps {
  isOpen: boolean;
  supplier: SupplierRecord | null;
  onClose: () => void;
  onEdit: (supplier: SupplierRecord) => void;
  onToggleStatus: (supplierId: string, newStatus: SupplierRecord["status"]) => void;
  onAddProduct?: (supplierId: string) => void;
}

export function SupplierDetailModal({
  isOpen,
  supplier,
  onClose,
  onEdit,
  onToggleStatus,
  onAddProduct,
}: SupplierDetailModalProps) {
  const { t } = useAdminLanguage();
  if (!isOpen || !supplier) return null;

  const isDeactivated = supplier.status === "INACTIVE";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[500px] text-[var(--color-text-primary)] shadow-2xl relative p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
              {supplier.firmName}
            </h2>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">
              Supplier ID: {supplier.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-lg font-bold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 rounded-none space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Contact Person:</span>
              <span className="font-bold text-[var(--color-text-primary)]">{supplier.contactPerson || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Email:</span>
              <span className="text-[var(--color-accent)]">{supplier.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Phone:</span>
              <span className="text-[var(--color-text-primary)]">{supplier.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Address:</span>
              <span className="text-[var(--color-text-primary)] text-right max-w-[240px] truncate">
                {supplier.address || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Website:</span>
              <span className="text-[var(--color-accent)] underline font-mono">
                {supplier.website || "—"}
              </span>
            </div>
          </div>

          <div className="border border-[var(--color-border)] p-4 rounded-none space-y-2">
            <div className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider text-[11px] pb-1 border-b border-[var(--color-border)]">
              PRODUCTS & INVENTORY STATISTICS
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[var(--color-text-secondary)]">Products Supplied:</span>
              <span className="font-bold text-[var(--color-text-primary)]">{supplier.productsSuppliedCount || 8}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[var(--color-text-secondary)]">Total Ready Stock:</span>
              <span className="font-bold text-[var(--color-accent)]">{supplier.totalStockUnits || 127} units</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[var(--color-text-secondary)]">Active Price Offers:</span>
              <span className="font-bold text-amber-500">{supplier.activeOffersCount || 3}</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[var(--color-bg)] p-3 border border-[var(--color-border)] rounded-none font-mono text-xs">
            <span className="text-[var(--color-text-secondary)]">STATUS:</span>
            {supplier.status === "ACTIVE" && (
              <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-none border border-emerald-500/30 font-bold uppercase">
                ✓ ACTIVE (Since {supplier.createdAt || "Aug 1, 2026"})
              </span>
            )}
            {supplier.status === "PENDING_VERIFICATION" && (
              <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-none border border-amber-500/30 font-bold uppercase">
                ⏳ PENDING VERIFICATION
              </span>
            )}
            {supplier.status === "INACTIVE" && (
              <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-none border border-red-500/30 font-bold uppercase">
                ✗ INACTIVE
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          {onAddProduct && supplier.status === "ACTIVE" && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddProduct(supplier.id);
              }}
              className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase rounded-none cursor-pointer flex items-center gap-1"
            >
              + {t.addProduct}
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(supplier)}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] text-xs font-bold uppercase rounded-none cursor-pointer"
          >
            {t.editBtn}
          </button>
          <button
            type="button"
            onClick={() =>
              onToggleStatus(supplier.id, isDeactivated ? "ACTIVE" : "INACTIVE")
            }
            className={`px-4 py-2 text-xs font-bold uppercase rounded-none cursor-pointer transition-colors ${
              isDeactivated
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isDeactivated ? "ACTIVATE" : "DEACTIVATE"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none font-bold uppercase text-xs hover:bg-[var(--color-surface)] cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
