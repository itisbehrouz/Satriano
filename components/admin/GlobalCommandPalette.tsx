"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

interface GlobalCommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function GlobalCommandPalette({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: GlobalCommandPaletteProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const router = useRouter();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (externalOnClose && !val) {
      externalOnClose();
    }
    setInternalIsOpen(val);
  };

  // Listen for global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1E3D]/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette Dialog Window */}
      <div className="relative w-full max-w-xl bg-white border border-[#D0D5DD] rounded-xl shadow-2xl overflow-hidden z-50 animate-scaleUp">
        <Command label="Global Admin Command Palette" className="w-full">
          {/* Input Header */}
          <div className="flex items-center px-4 py-3 border-b border-[#EAECF0] bg-white">
            <span className="material-symbols-outlined text-[#667085] text-lg mr-2.5">
              search
            </span>
            <Command.Input
              autoFocus
              placeholder="Search commands, order ledger, catalog, or navigation... (ESC to exit)"
              className="w-full bg-transparent text-xs text-[#101828] placeholder-[#667085] focus:outline-none"
            />
            <kbd className="px-1.5 py-0.5 bg-[#F2F4F7] border border-[#D0D5DD] rounded text-[10px] font-mono text-[#667085] shrink-0 ml-2">
              ESC
            </kbd>
          </div>

          {/* Results Command List */}
          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-[#EAECF0]">
            <Command.Empty className="p-6 text-center text-xs text-[#667085]">
              No matching commands or navigation items found.
            </Command.Empty>

            {/* Group 1: Navigation & Admin Views */}
            <Command.Group heading="Navigation &amp; Console Views" className="py-1">
              <Command.Item
                onSelect={() => navigateTo("/admin")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[#101828] hover:bg-[#F0F5FF] hover:text-[#2E5AAC] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[#2E5AAC]">
                    receipt_long
                  </span>
                  <span>Order Production Ledger</span>
                </div>
                <span className="text-[10px] text-[#667085] font-mono font-normal">/admin</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("/admin/applications")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[#101828] hover:bg-[#F0F5FF] hover:text-[#2E5AAC] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[#2E5AAC]">
                    assignment_ind
                  </span>
                  <span>B2B Partner Applications</span>
                </div>
                <span className="text-[10px] text-[#667085] font-mono font-normal">/admin/applications</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("/admin/product-settings")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[#101828] hover:bg-[#F0F5FF] hover:text-[#2E5AAC] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[#2E5AAC]">
                    inventory_2
                  </span>
                  <span>Catalog, Fits &amp; Fabric Ranges</span>
                </div>
                <span className="text-[10px] text-[#667085] font-mono font-normal">/admin/product-settings</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("/admin/architecture-viz")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[#101828] hover:bg-[#F0F5FF] hover:text-[#2E5AAC] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[#2E5AAC]">
                    view_in_ar
                  </span>
                  <span>3D Anti-Gravity Telemetry</span>
                </div>
                <span className="text-[10px] text-[#667085] font-mono font-normal">/admin/architecture-viz</span>
              </Command.Item>
            </Command.Group>

            {/* Group 2: Quick Operational Actions */}
            <Command.Group heading="Quick Operational Shortcuts" className="py-1">
              <Command.Item
                onSelect={() => navigateTo("/konfigurator")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[#101828] hover:bg-[#F0F5FF] hover:text-[#2E5AAC] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[#2E5AAC]">
                    add_circle
                  </span>
                  <span>Create Custom Production Spec</span>
                </div>
                <span className="text-[10px] text-[#667085] font-mono font-normal">/konfigurator</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("/wholesale")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[#101828] hover:bg-[#F0F5FF] hover:text-[#2E5AAC] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[#2E5AAC]">
                    storefront
                  </span>
                  <span>Public Wholesale Menswear Catalog</span>
                </div>
                <span className="text-[10px] text-[#667085] font-mono font-normal">/wholesale</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer Bar */}
          <div className="p-3 bg-[#F9FAFB] border-t border-[#EAECF0] flex items-center justify-between text-[11px] text-[#667085]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-[#D0D5DD] rounded font-mono text-[10px]">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-[#D0D5DD] rounded font-mono text-[10px]">↵</kbd> Select
              </span>
            </div>
            <span className="font-mono text-[10px]">Satriano Admin Portal</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
