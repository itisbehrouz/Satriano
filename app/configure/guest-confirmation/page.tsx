"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function GuestConfirmationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your corporate email";

  const [sending, setSending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend() {
    setSending(true);
    setResendMessage(null);
    setResendError(null);
    try {
      const res = await fetch("/api/customer/resend-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend magic link email.");
      }
      setResendMessage(data.message || `Magic link re-sent to ${email}.`);
    } catch (err: any) {
      setResendError(err.message || "Failed to resend magic link.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-4 md:p-10 flex items-center justify-center font-sans select-none rounded-none transition-colors">
      <div className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-8 shadow-2xl space-y-6">
        {/* Header Icon & Message */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-none flex items-center justify-center mx-auto text-3xl font-bold">
            📧
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
            ORDER CREATED — CHECK YOUR EMAIL
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
            We&apos;ve sent a passwordless login link to:
          </p>
          <div className="font-mono text-sm font-bold text-[var(--color-accent)] bg-[var(--color-bg)] py-2 px-4 border border-[var(--color-border)] inline-block rounded-none">
            {email}
          </div>
        </div>

        <div className="text-center text-xs text-[var(--color-text-secondary)] space-y-2 bg-[var(--color-bg)] p-4 border border-[var(--color-border)]">
          <p>
            Click the secure link in your email to verify your corporate email address and complete your order specification setup.
          </p>
          <p className="text-[11px] italic text-[var(--color-text-secondary)]">
            Note: The magic login link expires in 15 minutes.
          </p>
        </div>

        {resendMessage && (
          <div className="p-3 bg-[var(--color-status-success-bg)] border border-[var(--color-status-success)]/30 text-[var(--color-status-success)] text-xs text-center rounded-none font-semibold">
            {resendMessage}
          </div>
        )}

        {resendError && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs text-center rounded-none font-semibold">
            {resendError}
          </div>
        )}

        {/* Primary Action Button */}
        <div>
          <Link
            href="/"
            className="w-full h-12 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>BACK TO CATALOG</span>
          </Link>
        </div>

        {/* Resend Link Footer */}
        <div className="pt-4 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)] space-y-2">
          <p>Didn&apos;t receive the magic link email?</p>
          <button
            type="button"
            disabled={sending}
            onClick={handleResend}
            className="text-[var(--color-accent)] hover:underline font-bold uppercase cursor-pointer disabled:opacity-50"
          >
            {sending ? "RESENDING MAGIC LINK..." : "RESEND MAGIC LINK →"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function GuestConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
          <span className="inline-block w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-2" />
        </div>
      }
    >
      <GuestConfirmationContent />
    </Suspense>
  );
}
