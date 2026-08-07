"use client";

import { SupplierRecord } from "./EditSupplierModal";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

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
  const { t } = useAdminLanguage();

  return (
    <div className="overflow-x-auto select-none font-sans">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[var(--color-text-primary)] font-bold uppercase tracking-wider h-11">
            <th className="py-3 px-4">{t.supplierName}</th>
            <th className="py-3 px-4">{t.contactPerson}</th>
            <th className="py-3 px-4">{t.email}</th>
            <th className="py-3 px-4">{t.status}</th>
            <th className="py-3 px-4 text-right">{t.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {suppliers.map((sup) => {
            const isPending = sup.status === "PENDING_VERIFICATION";
            const isActive = sup.status === "ACTIVE";

            return (
              <tr
                key={sup.id}
                className="h-14 transition-colors bg-[var(--color-surface)] hover:bg-[var(--color-bg)]/50"
              >
                {/* Firma Adı */}
                <td className="py-3 px-4 font-bold text-[var(--color-text-primary)]">
                  {sup.firmName}
                </td>

                {/* Contact */}
                <td className="py-3 px-4 text-[var(--color-text-primary)]">
                  {sup.contactPerson || "—"}
                </td>

                {/* Email */}
                <td className="py-3 px-4 font-mono text-[var(--color-accent)]">
                  {sup.email || "—"}
                </td>

                {/* Status */}
                <td className="py-3 px-4 font-bold text-xs uppercase font-mono">
                  {isActive && (
                    <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-none border border-emerald-500/30 inline-flex items-center gap-1">
                      ✓ ACTIVE
                    </span>
                  )}
                  {isPending && (
                    <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-none border border-amber-500/30 inline-flex items-center gap-1">
                      ⏳ PENDING
                    </span>
                  )}
                  {sup.status === "INACTIVE" && (
                    <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-none border border-red-500/30 inline-flex items-center gap-1">
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
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded-none transition-colors cursor-pointer"
                      >
                        {t.verification}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEdit(sup)}
                      className="px-3 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase rounded-none transition-colors cursor-pointer"
                    >
                      {t.editBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => onView(sup)}
                      className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] text-xs font-bold uppercase rounded-none transition-colors cursor-pointer"
                    >
                      {t.viewDetails}
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
                        className={`px-3 py-1.5 text-xs font-bold uppercase rounded-none transition-colors cursor-pointer ${
                          sup.status === "ACTIVE"
                            ? "bg-[var(--color-surface)] border border-[var(--color-border)] text-red-500 hover:bg-red-500/10"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
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
