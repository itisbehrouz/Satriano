"use client";

import React, { useState } from "react";

export interface CompanyInfoTabProps {
  companyName: string;
  email: string;
  accountId?: string;
  createdAt?: string;
  status?: string;
}

export function CompanyInfoTab({
  companyName,
  email,
  accountId = "ACC-2026-B2B",
  createdAt = "2026-01-15",
  status = "APPROVED",
}: CompanyInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(companyName);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedMessage("Company profile updated successfully.");
    setIsEditing(false);
    setTimeout(() => setSavedMessage(null), 4000);
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 md:p-8 text-[var(--color-text-primary)] shadow-none space-y-6 transition-colors">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-none" />
            Company Information
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Verified B2B Corporate Entity Details
          </p>
        </div>
        <span className="bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/40 text-xs font-mono font-bold px-3 py-1 uppercase tracking-wider rounded-none inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-none bg-[var(--color-status-success)] animate-pulse" />
          <span>✓ {status} B2B PARTNER</span>
        </span>
      </div>

      {savedMessage && (
        <div className="p-3 bg-[var(--color-status-success-bg)] border border-[var(--color-status-success)] text-xs text-[var(--color-status-success)] font-semibold">
          {savedMessage}
        </div>
      )}

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div className="space-y-1 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none">
            <span className="text-[var(--color-text-secondary)] uppercase block text-[10px]">Company Legal Name</span>
            <span className="font-bold text-[var(--color-text-primary)] text-sm block">{name}</span>
          </div>

          <div className="space-y-1 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none">
            <span className="text-[var(--color-text-secondary)] uppercase block text-[10px]">Corporate Account Email</span>
            <span className="font-bold text-[var(--color-text-primary)] text-sm block">{email}</span>
          </div>

          <div className="space-y-1 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none">
            <span className="text-[var(--color-text-secondary)] uppercase block text-[10px]">Partner Account ID</span>
            <span className="font-bold text-[var(--color-accent)] text-sm block">{accountId}</span>
          </div>

          <div className="space-y-1 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none">
            <span className="text-[var(--color-text-secondary)] uppercase block text-[10px]">Account Activation Date</span>
            <span className="font-bold text-[var(--color-text-primary)] text-sm block">{createdAt}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
              Company Legal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 text-sm text-[var(--color-text-primary)] focus:outline-none rounded-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-bold uppercase rounded-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[var(--color-accent)] hover:bg-[#1E3F7A] text-white text-xs font-bold uppercase rounded-none transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {!isEditing && (
        <div className="pt-2 border-t border-[var(--color-border)] flex justify-end">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="h-10 px-5 bg-[var(--color-accent)] hover:bg-[#1E3F7A] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 rounded-none transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            <span>Edit Company Info</span>
          </button>
        </div>
      )}
    </div>
  );
}
