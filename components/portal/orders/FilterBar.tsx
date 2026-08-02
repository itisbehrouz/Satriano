"use client";

import React from "react";

export interface StatusTab {
  id: string;
  label: string;
  count?: number;
}

export interface FilterBarProps {
  selectedOrderType?: "ALL" | "M2O" | "WHOLESALE";
  onOrderTypeChange?: (type: "ALL" | "M2O" | "WHOLESALE") => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusCounts?: Record<string, number>;
}

export function FilterBar({
  selectedOrderType = "ALL",
  onOrderTypeChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  statusCounts = {},
}: FilterBarProps) {
  const typeTabs: { id: "ALL" | "M2O" | "WHOLESALE"; label: string }[] = [
    { id: "ALL", label: "ALL ORDERS" },
    { id: "M2O", label: "M2O ORDERS" },
    { id: "WHOLESALE", label: "WHOLESALE ORDERS" },
  ];

  const tabs: StatusTab[] = [
    { id: "ALL", label: "All Statuses", count: statusCounts["ALL"] },
    { id: "PENDING_REVIEW", label: "Pending Review", count: statusCounts["PENDING_REVIEW"] },
    { id: "PROFORMA_SENT", label: "Proforma Sent", count: statusCounts["PROFORMA_SENT"] },
    { id: "PAID_APPROVED", label: "Paid / Approved", count: (statusCounts["PAID"] || 0) + (statusCounts["APPROVED"] || 0) },
    { id: "IN_PRODUCTION", label: "In Production", count: statusCounts["IN_PRODUCTION"] },
    { id: "SHIPPED", label: "Shipped", count: statusCounts["SHIPPED"] },
    { id: "CANCELLED", label: "Cancelled", count: statusCounts["CANCELLED"] },
  ];

  return (
    <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-4 font-sans select-none space-y-4">
      {/* 1. Primary Order Type Toggle Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2E5AAC]/50 pb-3">
        {typeTabs.map((typeTab) => {
          const isActive = selectedOrderType === typeTab.id;
          return (
            <button
              key={typeTab.id}
              type="button"
              onClick={() => onOrderTypeChange && onOrderTypeChange(typeTab.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors border cursor-pointer ${
                isActive
                  ? "bg-[#2E5AAC] text-white border-[#2E5AAC]"
                  : "bg-[#0B1E3D] text-[#8DA0C4] border-[#2E5AAC]/40 hover:text-white hover:border-[#2E5AAC]"
              }`}
            >
              {typeTab.label}
            </button>
          );
        })}
      </div>

      {/* 2. Status Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-1">
        {/* Status Filter Tabs (Left side) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`px-3 py-2 text-xs font-semibold whitespace-nowrap rounded-none transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#2E5AAC] border-[#2E5AAC] font-bold bg-[#0B1E3D]/50"
                    : "text-[#8DA0C4] border-transparent hover:text-[#E8ECF3]"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 font-mono rounded-none ${
                      isActive
                        ? "bg-[#2E5AAC] text-white"
                        : "bg-[#0B1E3D] text-[#8DA0C4] border border-[#2E5AAC]/40"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input (Right side) */}
        <div className="relative min-w-[280px] w-full md:w-auto">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#8DA0C4]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Order ID, date, or SKU..."
            className="w-full bg-[#132A52] border border-[#8DA0C4] focus:border-2 focus:border-[#2E5AAC] text-[#E8ECF3] placeholder-[#8DA0C4] pl-9 pr-8 py-2 text-xs rounded-none outline-none font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8DA0C4] hover:text-[#E8ECF3] text-xs cursor-pointer"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
