"use client";

import { SupplierRecord } from "./EditSupplierModal";

export interface SupplierDetailModalProps {
  isOpen: boolean;
  supplier: SupplierRecord | null;
  onClose: () => void;
  onEdit: (supplier: SupplierRecord) => void;
  onToggleStatus: (supplierId: string, newStatus: SupplierRecord["status"]) => void;
}

export function SupplierDetailModal({
  isOpen,
  supplier,
  onClose,
  onEdit,
  onToggleStatus,
}: SupplierDetailModalProps) {
  if (!isOpen || !supplier) return null;

  const isDeactivated = supplier.status === "INACTIVE";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[500px] text-[#111318] shadow-2xl relative p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#111318] uppercase tracking-wide">
              {supplier.firmName}
            </h2>
            <span className="text-xs text-[#6B7280] font-mono">
              Supplier ID: {supplier.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111318] text-lg font-bold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-md space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Contact Person:</span>
              <span className="font-bold text-[#0F172A]">{supplier.contactPerson || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Email:</span>
              <span className="text-[#2E5AAC]">{supplier.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Phone:</span>
              <span className="text-[#0F172A]">{supplier.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Address:</span>
              <span className="text-[#0F172A] text-right max-w-[240px] truncate">
                {supplier.address || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Website:</span>
              <span className="text-[#2E5AAC] underline font-mono">
                {supplier.website || "—"}
              </span>
            </div>
          </div>

          <div className="border border-[#EAECF0] p-4 rounded-md space-y-2">
            <div className="font-bold text-[#111318] uppercase tracking-wider text-[11px] pb-1 border-b border-[#EAECF0]">
              PRODUCTS & INVENTORY STATISTICS
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[#6B7280]">Products Supplied:</span>
              <span className="font-bold text-[#111318]">{supplier.productsSuppliedCount || 8}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[#6B7280]">Total Ready Stock:</span>
              <span className="font-bold text-[#2E5AAC]">{supplier.totalStockUnits || 127} units</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[#6B7280]">Active Price Offers:</span>
              <span className="font-bold text-[#854F0B]">{supplier.activeOffersCount || 3}</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#F9FAFB] p-3 border border-[#EAECF0] rounded-md font-mono text-xs">
            <span className="text-[#6B7280]">STATUS:</span>
            {supplier.status === "ACTIVE" && (
              <span className="bg-[#ECFDF3] text-[#067647] px-2.5 py-1 rounded-none border border-[#5DCAA5]/40 font-bold uppercase">
                ✓ ACTIVE (Since {supplier.createdAt || "Aug 1, 2026"})
              </span>
            )}
            {supplier.status === "PENDING_VERIFICATION" && (
              <span className="bg-[#FDF6E7] text-[#854F0B] px-2.5 py-1 rounded-none border border-[#F0B94A]/40 font-bold uppercase">
                ⏳ PENDING VERIFICATION
              </span>
            )}
            {supplier.status === "INACTIVE" && (
              <span className="bg-[#FEE4E2] text-[#C5221F] px-2.5 py-1 rounded-none border border-[#F8B4B4] font-bold uppercase">
                ✗ INACTIVE
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#EAECF0]">
          <button
            type="button"
            onClick={() => onEdit(supplier)}
            className="px-4 py-2 bg-white border border-[#D0D5DD] text-[#111318] hover:bg-[#F9FAFB] text-xs font-bold uppercase rounded-md cursor-pointer"
          >
            EDIT
          </button>
          <button
            type="button"
            onClick={() =>
              onToggleStatus(supplier.id, isDeactivated ? "ACTIVE" : "INACTIVE")
            }
            className={`px-4 py-2 text-xs font-bold uppercase rounded-md cursor-pointer transition-colors ${
              isDeactivated
                ? "bg-[#067647] text-white hover:bg-emerald-800"
                : "bg-[#C5221F] text-white hover:bg-red-800"
            }`}
          >
            {isDeactivated ? "ACTIVATE" : "DEACTIVATE"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-[#344054] border border-[#D0D5DD] rounded-md font-bold uppercase text-xs hover:bg-[#F9FAFB] cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
