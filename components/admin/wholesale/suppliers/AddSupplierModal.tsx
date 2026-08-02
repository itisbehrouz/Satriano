"use client";

import { useState } from "react";

export interface SupplierData {
  firmName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  notes: string;
}

export interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: SupplierData) => void;
}

export function AddSupplierModal({ isOpen, onClose, onCreate }: AddSupplierModalProps) {
  const [formData, setFormData] = useState<SupplierData>({
    firmName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firmName.trim()) {
      setError("Firma Adı (Company Name) is required.");
      return;
    }
    onCreate(formData);
    setFormData({
      firmName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      notes: "",
    });
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[540px] text-[var(--color-text-primary)] shadow-2xl relative p-6 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            ADD NEW SUPPLIER
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-lg font-bold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1">
              Firma Adı (Company Name) *
            </label>
            <input
              type="text"
              required
              value={formData.firmName}
              onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
              placeholder="e.g., ABC Textile Co."
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-none focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1">
                İletişim Kişisi (Contact)
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-none focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@abctextile.com"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-none focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1">
                Telefon (Phone)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+90 212 555 1234"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono rounded-none focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.abctextile.com"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono rounded-none focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1">
              Adres (Address)
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Factory address, district, city..."
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-none focus:border-[var(--color-accent)] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1">
              Notlar (Notes)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal supplier notes, capacity, terms..."
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-none focus:border-[var(--color-accent)] focus:outline-none resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-[11px]">{error}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none font-bold uppercase tracking-wider text-xs hover:bg-[var(--color-surface)] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-none font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              CREATE SUPPLIER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
