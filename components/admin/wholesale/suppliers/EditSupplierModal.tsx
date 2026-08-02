"use client";

import { useState, useEffect } from "react";

export interface SupplierRecord {
  id: string;
  firmName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  notes: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING_VERIFICATION";
  productsSuppliedCount?: number;
  totalStockUnits?: number;
  activeOffersCount?: number;
  createdAt?: string;
}

export interface EditSupplierModalProps {
  isOpen: boolean;
  supplier: SupplierRecord | null;
  onClose: () => void;
  onSave: (updated: SupplierRecord) => void;
}

export function EditSupplierModal({
  isOpen,
  supplier,
  onClose,
  onSave,
}: EditSupplierModalProps) {
  const [formData, setFormData] = useState<SupplierRecord | null>(null);

  useEffect(() => {
    if (supplier) {
      setFormData({ ...supplier });
    }
  }, [supplier]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[540px] text-[#111318] shadow-2xl relative p-6 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
            EDIT SUPPLIER: {formData.firmName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111318] text-lg font-bold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
              Supplier Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as SupplierRecord["status"],
                })
              }
              className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] font-bold rounded-md focus:border-[#2E5AAC] focus:outline-none cursor-pointer"
            >
              <option value="ACTIVE">✓ ACTIVE (can list products)</option>
              <option value="INACTIVE">✗ INACTIVE (hidden from catalog)</option>
              <option value="PENDING_VERIFICATION">⏳ PENDING VERIFICATION (awaiting approval)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
              Firma Adı (Company Name) *
            </label>
            <input
              type="text"
              required
              value={formData.firmName}
              onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] rounded-md focus:border-[#2E5AAC] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
                İletişim Kişisi (Contact)
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] rounded-md focus:border-[#2E5AAC] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] rounded-md focus:border-[#2E5AAC] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
                Telefon (Phone)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] font-mono rounded-md focus:border-[#2E5AAC] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] font-mono rounded-md focus:border-[#2E5AAC] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
              Adres (Address)
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] rounded-md focus:border-[#2E5AAC] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1">
              Notlar (Notes)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] rounded-md focus:border-[#2E5AAC] focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-[#344054] border border-[#D0D5DD] rounded-md font-bold uppercase tracking-wider text-xs hover:bg-[#F9FAFB] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white rounded-md font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-xs"
            >
              SAVE CHANGES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
