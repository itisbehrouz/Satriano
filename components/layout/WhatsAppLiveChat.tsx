"use client";

import { useState } from "react";

const CHANNELS = [
  {
    id: "whatsapp",
    name: "WhatsApp Desk",
    badge: "Fastest • 24/7",
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
    id: "telegram",
    name: "Telegram Channel",
    badge: "Instant Direct",
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
  {
    id: "signal",
    name: "Signal Encrypted",
    badge: "E2EE Secure",
    bgColor: "bg-[#3A76F0]",
    borderColor: "border-[#3A76F0]",
    hoverBg: "hover:bg-[#2B61D1]",
    url: "https://signal.me/#p/+390212345678",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8zm-3.6 4.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm7.2 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM7.2 14.4a4.8 4.8 0 0 0 9.6 0h-9.6z" />
      </svg>
    ),
  },
  {
    id: "email",
    name: "Corporate Email",
    badge: "Formal Proforma",
    bgColor: "bg-[#2E5AAC]",
    borderColor: "border-[#2E5AAC]",
    hoverBg: "hover:bg-[#24498E]",
    url: "mailto:concierge@satrianoatelier.com?subject=B2B%20Custom%20Manufacturing%20Inquiry",
    icon: (
      <span className="material-symbols-outlined text-sm">mail</span>
    ),
  },
];

export function WhatsAppLiveChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Expanded Multi-Channel Drawer */}
      {isOpen && (
        <div className="mb-3 w-88 bg-[#0B1E3D] text-white border border-[#1E3A8A] rounded-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Box Header */}
          <div className="bg-[#071325] px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#2E5AAC] text-white rounded-none flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-lg">support_agent</span>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Satriano B2B Desk</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
                  <span>Online • Multi-Channel Support</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#94A3B8] hover:text-white text-xs p-1"
              aria-label="Close support drawer"
            >
              ✕
            </button>
          </div>

          {/* Box Body */}
          <div className="p-4 space-y-3 bg-[#0B1E3D] text-xs">
            <div className="bg-[#152744] border border-white/10 p-3 rounded-none text-[#CBD5E1] space-y-1">
              <p className="font-semibold text-white">Select B2B Channel</p>
              <p className="text-[11px] leading-relaxed">
                Connect directly with our atelier production team across your preferred corporate messenger or encrypted channel:
              </p>
            </div>

            {/* Channels Stack */}
            <div className="space-y-2 pt-1">
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
                  <span className="text-[10px] bg-black/20 font-mono font-medium px-2 py-0.5 rounded-none text-white/90">
                    {ch.badge}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open B2B Live Support Drawer"
        className="group relative bg-[#0B1E3D] hover:bg-[#152744] text-white border-2 border-[#2E5AAC] px-4 py-3 rounded-none shadow-xl flex items-center gap-3 transition-all hover:scale-105"
      >
        <div className="relative">
          <div className="w-7 h-7 bg-[#2E5AAC] text-white rounded-none flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-base">chat</span>
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-none bg-emerald-400 animate-pulse border border-[#0B1E3D]" />
        </div>

        <div className="text-left hidden sm:block">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#60A5FA]">B2B Live Desk</p>
          <p className="text-xs font-bold text-white">Instant Chat &amp; Channels</p>
        </div>
      </button>
    </div>
  );
}

// Export B2BLiveChatDrawer as main export
export { WhatsAppLiveChat as B2BLiveChatDrawer };
