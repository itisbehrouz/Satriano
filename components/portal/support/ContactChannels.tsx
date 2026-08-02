"use client";

import React, { useState } from "react";

export function ContactChannels() {
  const [copied, setCopied] = useState(false);

  function handleCopyEmail() {
    navigator.clipboard.writeText("support@satriano.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-6 md:p-8 text-[#E8ECF3] shadow-none space-y-6">
      <div className="border-b border-[#2E5AAC]/40 pb-4">
        <h2 className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#2E5AAC] rounded-none" />
          Direct Communication Channels
        </h2>
        <p className="text-xs text-[#8DA0C4] mt-1">
          Dedicated Atelier Support &amp; Production Engineering Desk
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        {/* WhatsApp */}
        <a
          href="https://wa.me/905320000000"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-[#0B1E3D] border border-[#1E3A8A] hover:border-[#5DCAA5] transition-colors rounded-none flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[#8DA0C4] uppercase text-[10px] block">WhatsApp Desk</span>
            <span className="font-bold text-white text-sm block group-hover:text-[#5DCAA5]">
              +90 532 000 0000
            </span>
          </div>
          <span className="material-symbols-outlined text-xl text-[#5DCAA5]">chat</span>
        </a>

        {/* Telegram */}
        <a
          href="https://t.me/SatrianoAtelier"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-[#0B1E3D] border border-[#1E3A8A] hover:border-[#85B7EB] transition-colors rounded-none flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[#8DA0C4] uppercase text-[10px] block">Telegram Channel</span>
            <span className="font-bold text-white text-sm block group-hover:text-[#85B7EB]">
              @SatrianoAtelier
            </span>
          </div>
          <span className="material-symbols-outlined text-xl text-[#85B7EB]">send</span>
        </a>

        {/* Corporate Email */}
        <div className="p-4 bg-[#0B1E3D] border border-[#1E3A8A] rounded-none flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[#8DA0C4] uppercase text-[10px] block">Official Support Email</span>
            <span className="font-bold text-white text-sm block">support@satriano.com</span>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-3 py-1.5 bg-[#132A52] hover:bg-[#1E3A6D] text-[#85B7EB] border border-[#2E5AAC] text-[11px] font-bold uppercase rounded-none transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Signal */}
        <a
          href="https://signal.me/#p/+905320000000"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-[#0B1E3D] border border-[#1E3A8A] hover:border-[#F0B94A] transition-colors rounded-none flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[#8DA0C4] uppercase text-[10px] block">Signal Encrypted Line</span>
            <span className="font-bold text-white text-sm block group-hover:text-[#F0B94A]">
              Signal Private Desk
            </span>
          </div>
          <span className="material-symbols-outlined text-xl text-[#F0B94A]">encrypted</span>
        </a>
      </div>
    </div>
  );
}
