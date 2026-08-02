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
    <div className="bg-[#132A52] border-l-4 border-[#2E5AAC] border-y border-r border-[#1E3A8A] rounded-none p-6 text-[#E8ECF3] shadow-none font-sans select-none">
      <div className="flex items-center justify-between border-b border-[#1E3A8A] pb-3 mb-4">
        <h2 className="text-[13px] font-mono font-bold tracking-wider uppercase text-[#8DA0C4]">
          Company Account Overview
        </h2>
        <span className="text-xs font-mono uppercase bg-[#14301F] text-[#5DCAA5] border border-[#5DCAA5]/40 px-3 py-1.5 font-bold tracking-wider rounded-none inline-flex items-center gap-1.5">
          <span>✓</span>
          <span>{accountStatus === "APPROVED" ? "Approved B2B Partner" : accountStatus}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#8DA0C4] block">
            Company Name
          </span>
          <span className="text-base font-bold text-[#E8ECF3] font-mono mt-1 block truncate">
            {companyName}
          </span>
        </div>

        <div>
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#8DA0C4] block">
            Email
          </span>
          <span className="text-base font-bold text-[#E8ECF3] font-mono mt-1 block truncate">
            {email}
          </span>
        </div>

        <div>
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#8DA0C4] block">
            Account Status
          </span>
          <span className="text-base font-bold text-[#5DCAA5] font-mono mt-1 block">
            Approved B2B Partner
          </span>
        </div>

        <div>
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#8DA0C4] block">
            Account Created
          </span>
          <span className="text-base font-bold text-[#E8ECF3] font-mono mt-1 block">
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
