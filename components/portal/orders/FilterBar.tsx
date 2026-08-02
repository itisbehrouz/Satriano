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
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-4 font-sans select-none space-y-4 transition-colors">
      {/* 1. Primary Order Type Toggle Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
        {typeTabs.map((typeTab) => {
          const isActive = selectedOrderType === typeTab.id;
          return (
            <button
              key={typeTab.id}
              type="button"
              onClick={() => onOrderTypeChange && onOrderTypeChange(typeTab.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors border cursor-pointer ${
                isActive
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                  : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]"
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
                    ? "text-[var(--color-accent)] border-[var(--color-accent)] font-bold bg-[var(--color-bg)]"
                    : "text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 font-mono rounded-none ${
                      isActive
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
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
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-[var(--color-text-secondary)]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Order ID, date, or SKU..."
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-2 focus:border-[var(--color-accent)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] pl-9 pr-8 py-2 text-xs rounded-none outline-none font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs cursor-pointer"
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
