"use client";

import { SupplierRecord } from "./EditSupplierModal";

export interface SuppliersTableProps {
  suppliers: SupplierRecord[];
  onEdit: (supplier: SupplierRecord) => void;
  onView: (supplier: SupplierRecord) => void;
  onVerify: (supplierId: string) => void;
  onToggleStatus: (supplierId: string, newStatus: SupplierRecord["status"]) => void;
}

export function SuppliersTable({
  suppliers,
  onEdit,
  onView,
  onVerify,
  onToggleStatus,
}: SuppliersTableProps) {
  return (
    <div className="overflow-x-auto select-none font-sans">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-[#F7F8FA] border-b border-[#EAECF0] text-[#111318] font-bold uppercase tracking-wider h-11">
            <th className="py-3 px-4">Firma Adı (Supplier)</th>
            <th className="py-3 px-4">Contact</th>
            <th className="py-3 px-4">Email</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAECF0]">
          {suppliers.map((sup, idx) => {
            const isEven = idx % 2 === 0;
            const isPending = sup.status === "PENDING_VERIFICATION";
            const isActive = sup.status === "ACTIVE";

            return (
              <tr
                key={sup.id}
                className={`h-14 transition-colors ${
                  isEven ? "bg-white" : "bg-[#F9FAFB]"
                } hover:bg-[#F2F4F7]`}
              >
                {/* Firma Adı */}
                <td className="py-3 px-4 font-bold text-[#111318]">
                  {sup.firmName}
                </td>

                {/* Contact */}
                <td className="py-3 px-4 text-[#344054]">
                  {sup.contactPerson || "—"}
                </td>

                {/* Email */}
                <td className="py-3 px-4 font-mono text-[#2E5AAC]">
                  {sup.email || "—"}
                </td>

                {/* Status */}
                <td className="py-3 px-4 font-bold text-xs uppercase font-mono">
                  {isActive && (
                    <span className="bg-[#ECFDF3] text-[#067647] px-2.5 py-1 rounded-none border border-[#5DCAA5]/40 inline-flex items-center gap-1">
                      ✓ ACTIVE
                    </span>
                  )}
                  {isPending && (
                    <span className="bg-[#FDF6E7] text-[#854F0B] px-2.5 py-1 rounded-none border border-[#F0B94A]/40 inline-flex items-center gap-1">
                      ⏳ PENDING
                    </span>
                  )}
                  {sup.status === "INACTIVE" && (
                    <span className="bg-[#FEE4E2] text-[#C5221F] px-2.5 py-1 rounded-none border border-[#F8B4B4] inline-flex items-center gap-1">
                      ✗ INACTIVE
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => onVerify(sup.id)}
                        className="px-3 py-1.5 bg-[#067647] hover:bg-emerald-800 text-white text-xs font-bold uppercase rounded-md transition-colors cursor-pointer shadow-xs"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEdit(sup)}
                      className="px-3 py-1.5 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase rounded-md transition-colors cursor-pointer shadow-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onView(sup)}
                      className="px-3 py-1.5 bg-white border border-[#D0D5DD] text-[#111318] hover:bg-[#F9FAFB] text-xs font-bold uppercase rounded-md transition-colors cursor-pointer"
                    >
                      View
                    </button>
                    {!isPending && (
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus(
                            sup.id,
                            sup.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                          )
                        }
                        className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer ${
                          sup.status === "ACTIVE"
                            ? "bg-white border border-[#D0D5DD] text-[#C5221F] hover:bg-[#FEE4E2]"
                            : "bg-[#067647] text-white hover:bg-emerald-800"
                        }`}
                      >
                        {sup.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
