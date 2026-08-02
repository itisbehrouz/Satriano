"use client";

import React from "react";

export interface CompanyCardProps {
  companyName: string;
  email: string;
  accountStatus?: string;
  createdAt?: string;
}

export function CompanyCard({
  companyName,
  email,
  accountStatus = "APPROVED",
  createdAt,
}: CompanyCardProps) {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Active Partner";

  return (
    <div className="bg-[var(--color-surface)] border-l-4 border-[var(--color-accent)] border-y border-r border-[var(--color-border)] rounded-none p-6 text-[var(--color-text-primary)] shadow-none font-sans select-none transition-colors">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
        <h2 className="text-[13px] font-mono font-bold tracking-wider uppercase text-[var(--color-text-secondary)]">
          Company Account Overview
        </h2>
        <span className="text-xs font-mono uppercase bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/40 px-3 py-1.5 font-bold tracking-wider rounded-none inline-flex items-center gap-1.5">
          <span>✓</span>
          <span>{accountStatus === "APPROVED" ? "Approved B2B Partner" : accountStatus}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <span className="text-[13px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] block">
            Company Name
          </span>
          <span className="text-base font-bold text-[var(--color-text-primary)] font-mono mt-1 block truncate">
            {companyName}
          </span>
        </div>

        <div>
          <span className="text-[13px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] block">
            Email
          </span>
          <span className="text-base font-bold text-[var(--color-text-primary)] font-mono mt-1 block truncate">
            {email}
          </span>
        </div>

        <div>
          <span className="text-[13px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] block">
            Account Status
          </span>
          <span className="text-base font-bold text-[var(--color-status-success)] font-mono mt-1 block">
            Approved B2B Partner
          </span>
        </div>

        <div>
          <span className="text-[13px] font-mono uppercase tracking-wider text-[var(--color-text-secondary)] block">
            Account Created
          </span>
          <span className="text-base font-bold text-[var(--color-text-primary)] font-mono mt-1 block">
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
