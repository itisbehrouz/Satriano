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
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 md:p-8 text-[var(--color-text-primary)] shadow-none space-y-6 transition-colors">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h2 className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-none" />
          Direct Communication Channels
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Dedicated Atelier Support &amp; Production Engineering Desk
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        {/* WhatsApp */}
        <a
          href="https://wa.me/905320000000"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-status-success)] transition-colors rounded-none flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[var(--color-text-secondary)] uppercase text-[10px] block">WhatsApp Desk</span>
            <span className="font-bold text-[var(--color-text-primary)] text-sm block group-hover:text-[var(--color-status-success)]">
              +90 532 000 0000
            </span>
          </div>
          <span className="material-symbols-outlined text-xl text-[var(--color-status-success)]">chat</span>
        </a>

        {/* Telegram */}
        <a
          href="https://t.me/SatrianoAtelier"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors rounded-none flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[var(--color-text-secondary)] uppercase text-[10px] block">Telegram Channel</span>
            <span className="font-bold text-[var(--color-text-primary)] text-sm block group-hover:text-[var(--color-accent)]">
              @SatrianoAtelier
            </span>
          </div>
          <span className="material-symbols-outlined text-xl text-[var(--color-accent)]">send</span>
        </a>

        {/* Corporate Email */}
        <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-none flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[var(--color-text-secondary)] uppercase text-[10px] block">Official Support Email</span>
            <span className="font-bold text-[var(--color-text-primary)] text-sm block">support@satriano.com</span>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-3 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-bg)] text-[var(--color-accent)] border border-[var(--color-border)] text-[11px] font-bold uppercase rounded-none transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Signal */}
        <a
          href="https://signal.me/#p/+905320000000"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-status-warning)] transition-colors rounded-none flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[var(--color-text-secondary)] uppercase text-[10px] block">Signal Encrypted Line</span>
            <span className="font-bold text-[var(--color-text-primary)] text-sm block group-hover:text-[var(--color-status-warning)]">
              Signal Private Desk
            </span>
          </div>
          <span className="material-symbols-outlined text-xl text-[var(--color-status-warning)]">encrypted</span>
        </a>
      </div>
    </div>
  );
}
