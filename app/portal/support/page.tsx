"use client";

import React from "react";
import { ContactChannels } from "@/components/portal/support/ContactChannels";
import { SupportForm } from "@/components/portal/support/SupportForm";
import { FaqLinks } from "@/components/portal/support/FaqLinks";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans select-none rounded-none transition-colors">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Title Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] uppercase tracking-wider">
            <span>Client Portal</span>
            <span>•</span>
            <span>Customer Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Customer Support &amp; Technical Helpdesk
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
            Get direct assistance from our production engineering team, request custom pattern grading support, or submit an official inquiry ticket.
          </p>
        </div>

        {/* 1. Direct Contact Channels */}
        <ContactChannels />

        {/* 2. Submit Support Ticket Form */}
        <SupportForm />

        {/* 3. FAQ Quick Links */}
        <FaqLinks />
      </div>
    </main>
  );
}
