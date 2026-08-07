"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const CHANNELS = [
  {
    id: "whatsapp",
    name: "WhatsApp Concierge",
    badge: "Direct Line • 24/7",
    bgColor: "bg-[#25D366]",
    borderColor: "border-[#25D366]",
    hoverBg: "hover:bg-[#20BD5A]",
    url: "https://wa.me/390212345678?text=Hello%20Satriano%20Atelier,%20I%20would%20like%20to%20inquire%20about%20B2B%20custom%20garment%20manufacturing.",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12.031 0C5.396 0 0 5.397 0 12.031c0 2.119.553 4.187 1.603 6.009L0 24l6.162-1.617a12.008 12.008 0 005.869 1.516l.004-.001c6.634 0 12.03-5.397 12.03-12.031C24.065 5.397 18.668 0 12.031 0zm0 22.029c-1.805 0-3.568-.485-5.111-1.401l-.367-.218-3.661.96.977-3.568-.239-.381a10.009 10.009 0 01-1.534-5.39c0-5.529 4.499-10.028 10.03-10.028 5.53 0 10.028 4.499 10.028 10.028 0 5.531-4.498 10.029-10.028 10.029zm5.502-7.519c-.302-.151-1.785-.882-2.062-.983-.277-.101-.479-.151-.68.151-.202.302-.781.983-.957 1.185-.176.202-.353.226-.655.075s-1.275-.47-2.428-1.498c-.897-.8-1.502-1.789-1.678-2.091-.176-.302-.019-.465.132-.615.136-.135.302-.353.453-.529.151-.176.202-.302.302-.504.101-.202.05-.378-.025-.529-.075-.151-.68-1.636-.931-2.237-.245-.586-.494-.507-.68-.517l-.58-.01c-.202 0-.529.075-.806.378s-1.057 1.033-1.057 2.519c0 1.486 1.082 2.92 1.233 3.122.151.202 2.13 3.253 5.16 4.562.72.311 1.282.497 1.72.636.723.23 1.381.197 1.901.12.58-.087 1.785-.73 2.037-1.435.252-.705.252-1.309.176-1.435-.075-.126-.277-.202-.579-.353z" />
      </svg>
    ),
  },
  {
    id: "email",
    name: "Corporate Email",
    badge: "Official Spec Inquiry",
    bgColor: "bg-[#2E5AAC]",
    borderColor: "border-[#2E5AAC]",
    hoverBg: "hover:bg-[#24498E]",
    url: "mailto:concierge@satrianoatelier.com?subject=B2B%20Custom%20Manufacturing%20Inquiry",
    icon: <span className="material-symbols-outlined text-sm">mail</span>,
  },
  {
    id: "telegram",
    name: "Telegram Channel",
    badge: "Instant Updates",
    bgColor: "bg-[#229ED9]",
    borderColor: "border-[#229ED9]",
    hoverBg: "hover:bg-[#1B89BE]",
    url: "https://t.me/satrianoatelier",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
];

export function B2BSupportDock() {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeTab, setActiveTab] = useState<"none" | "channels">("none");

  // Do not render support dock on admin pages or under-development page
  if (pathname?.startsWith("/admin") || pathname === "/under-development") {
    return null;
  }

  const handleMinimize = (minimized: boolean) => {
    setIsMinimized(minimized);
    if (minimized) {
      setActiveTab("none");
    }
  };

  const triggerAIAssistant = () => {
    setIsMinimized(true);
    window.dispatchEvent(new CustomEvent("open-ai-assistant"));
  };

  // Minimized side tab pinned to left screen edge - Sleek Atelier Glass Aesthetic
  if (isMinimized) {
    return (
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 font-sans">
        <button
          onClick={() => handleMinimize(false)}
          className="bg-[#090D16]/90 backdrop-blur-md text-[#D4AF37] border border-l-0 border-[#D4AF37]/40 hover:border-[#D4AF37] py-4 px-3 rounded-r-none shadow-2xl flex flex-col items-center gap-2.5 cursor-pointer transition-all hover:translate-x-1 group"
          title="Open B2B Support & AI Desk"
        >
          <span className="material-symbols-outlined text-sm text-[#D4AF37] group-hover:scale-110 transition-transform">
            headset_mic
          </span>
          <span className="writing-mode-vertical text-[10px] uppercase font-mono tracking-[0.2em] font-bold text-white group-hover:text-[#D4AF37] transition-colors">
            B2B SUPPORT
          </span>
          <div className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse mt-0.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 font-sans flex flex-col items-start space-y-2">
      {/* Expanded Multi-Channel Drawer Panel */}
      {activeTab === "channels" && (
        <div className="w-76 bg-[#090D16]/95 backdrop-blur-md text-white border border-[#D4AF37]/30 rounded-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 mb-1">
          <div className="bg-[#05080E] px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D4AF37] text-base">forum</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Direct Concierge Desks</h4>
            </div>
            <button
              onClick={() => setActiveTab("none")}
              className="text-[#94A3B8] hover:text-white text-xs p-1 cursor-pointer"
              aria-label="Close channels drawer"
            >
              ✕
            </button>
          </div>

          <div className="p-3 space-y-2 text-xs">
            {CHANNELS.map((ch) => (
              <a
                key={ch.id}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full ${ch.bgColor} ${ch.hoverBg} text-white text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-none transition-all flex items-center justify-between border ${ch.borderColor} shadow-sm group`}
              >
                <div className="flex items-center gap-2.5">
                  {ch.icon}
                  <span>{ch.name}</span>
                </div>
                <span className="text-[10px] bg-black/25 font-mono font-medium px-2 py-0.5 rounded-none text-white/90">
                  {ch.badge}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Glassmorphic Dock Container */}
      <div className="w-76 bg-[#090D16]/95 backdrop-blur-md text-white border border-[#D4AF37]/40 rounded-none p-3 shadow-2xl space-y-2.5 relative">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] font-mono">
              B2B Concierge Desk
            </span>
          </div>
          <button
            onClick={() => handleMinimize(true)}
            className="text-[#94A3B8] hover:text-white text-xs p-0.5 cursor-pointer flex items-center gap-1 transition-colors"
            title="Minimize B2B Support Desk"
          >
            <span className="text-[10px] uppercase font-mono">Hide</span>
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
        </div>

        {/* 1. Direct Concierge Channels */}
        <button
          onClick={() => setActiveTab(activeTab === "channels" ? "none" : "channels")}
          className={`w-full text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-none transition-all flex items-center justify-between border ${
            activeTab === "channels"
              ? "bg-[#2E5AAC] text-white border-[#60A5FA] shadow-md"
              : "bg-[#141C2E] hover:bg-[#1E2B45] text-white border-white/15"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-[#60A5FA]">forum</span>
            <span>Direct Channels</span>
          </div>
          <span className="text-[10px] font-mono text-[#93C5FD]">WhatsApp/Email →</span>
        </button>

        {/* 2. 24/7 AI Manufacturing Desk */}
        <button
          onClick={triggerAIAssistant}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#C59B27] hover:to-[#B38A1D] text-[#05080E] font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-none transition-all flex items-center justify-between border border-[#D4AF37] shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base">smart_toy</span>
            <span>24/7 AI Desk</span>
          </div>
          <span className="text-[10px] font-mono text-[#05080E]/80">Instant Spec FAQ →</span>
        </button>
      </div>
    </div>
  );
}
