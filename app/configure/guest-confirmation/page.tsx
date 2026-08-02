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
    <main className="min-h-screen bg-[#0B1E3D] text-[#E8ECF3] p-4 md:p-10 flex items-center justify-center font-sans select-none rounded-none">
      <div className="w-full max-w-xl bg-[#132A52] border-l-4 border-[#2E5AAC] border-y border-r border-[#1E3A8A] rounded-none p-8 shadow-2xl space-y-6">
        {/* Header Icon & Message */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#132A52] text-[#85B7EB] border border-[#2E5AAC] rounded-none flex items-center justify-center mx-auto text-3xl font-bold">
            📧
          </div>
          <h1 className="text-2xl font-bold text-[#E8ECF3] tracking-tight">
            ORDER CREATED — CHECK YOUR EMAIL
          </h1>
          <p className="text-xs text-[#8DA0C4] max-w-md mx-auto leading-relaxed">
            We&apos;ve sent a passwordless login link to:
          </p>
          <div className="font-mono text-sm font-bold text-[#85B7EB] bg-[#0B1E3D] py-2 px-4 border border-[#2E5AAC]/40 inline-block rounded-none">
            {email}
          </div>
        </div>

        <div className="text-center text-xs text-[#8DA0C4] space-y-2 bg-[#0B1E3D] p-4 border border-[#1E3A8A]">
          <p>
            Click the secure link in your email to verify your corporate email address and complete your order specification setup.
          </p>
          <p className="text-[11px] italic text-[#8DA0C4]">
            Note: The magic login link expires in 15 minutes.
          </p>
        </div>

        {resendMessage && (
          <div className="p-3 bg-[#14301F] border border-[#5DCAA5]/40 text-[#5DCAA5] text-xs text-center rounded-none font-semibold">
            {resendMessage}
          </div>
        )}

        {resendError && (
          <div className="p-3 bg-[#3A2E14] border border-[#F0B94A] text-[#F0B94A] text-xs text-center rounded-none font-semibold">
            {resendError}
          </div>
        )}

        {/* Primary Action Button */}
        <div>
          <Link
            href="/"
            className="w-full h-12 bg-[#2E5AAC] hover:bg-[#1E3F7F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
          >
            <span>BACK TO CATALOG</span>
          </Link>
        </div>

        {/* Resend Link Footer */}
        <div className="pt-4 border-t border-[#1E3A8A] text-center text-xs text-[#8DA0C4] space-y-2">
          <p>Didn&apos;t receive the magic link email?</p>
          <button
            type="button"
            disabled={sending}
            onClick={handleResend}
            className="text-[#2E5AAC] hover:underline font-bold uppercase cursor-pointer disabled:opacity-50"
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
        <div className="min-h-screen bg-[#0B1E3D] flex items-center justify-center text-xs text-[#8DA0C4]">
          <span className="inline-block w-6 h-6 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
        </div>
      }
    >
      <GuestConfirmationContent />
    </Suspense>
  );
}
