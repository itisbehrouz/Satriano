"use client";

import React from "react";

export type AccountTab = "company" | "settings" | "billing";

export interface TabNavigationProps {
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: { id: AccountTab; label: string; icon: string }[] = [
    { id: "company", label: "Company Information", icon: "domain" },
    { id: "settings", label: "Account Settings", icon: "settings" },
    { id: "billing", label: "Billing & Invoices", icon: "receipt" },
  ];

  return (
    <div className="border-b border-[#2E5AAC]/30 bg-[#132A52] px-4 sm:px-6 rounded-none select-none">
      <nav className="-mb-px flex space-x-6 sm:space-x-8 text-xs font-semibold uppercase tracking-wider overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`py-4 inline-flex items-center gap-2 border-b-2 font-mono transition-colors cursor-pointer rounded-none whitespace-nowrap ${
                isActive
                  ? "border-[#2E5AAC] text-[#E8ECF3] font-bold"
                  : "border-transparent text-[#8DA0C4] hover:text-[#E8ECF3] hover:border-[#8DA0C4]/40"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
