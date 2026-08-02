"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface GuestLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMagicLink: (email: string) => Promise<void>;
  onSubmitGuestOrder: (email: string) => Promise<void>;
  initialEmail?: string;
}

export function GuestLoginModal({
  isOpen,
  onClose,
  onSendMagicLink,
  onSubmitGuestOrder,
  initialEmail = "",
}: GuestLoginModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [loadingAction, setLoadingAction] = useState<"MAGIC" | "GUEST" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid corporate email address.");
      return;
    }
    setError(null);
    setLoadingAction("MAGIC");
    try {
      await onSendMagicLink(email);
    } catch (err: any) {
      setError(err.message || "Failed to send magic link.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleGuestOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid corporate email address.");
      return;
    }
    setError(null);
    setLoadingAction("GUEST");
    try {
      await onSubmitGuestOrder(email);
    } catch (err: any) {
      setError(err.message || "Failed to submit guest order.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-[#132A52] border-2 border-[#2E5AAC] rounded-none w-full max-w-[540px] text-[#E8ECF3] shadow-2xl relative my-8">
        {/* Header */}
        <div className="p-6 border-b border-[#2E5AAC] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#E8ECF3]">
              Login to Save Your Order
            </h2>
            <p className="text-xs text-[#8DA0C4] mt-1">
              Would you like to login or create a guest account to complete order setup?
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8DA0C4] hover:text-[#2E5AAC] text-xl font-bold cursor-pointer"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {error && (
            <div className="p-3 bg-[#3A2E14] border border-[#F0B94A] text-[#F0B94A] rounded-none">
              {error}
            </div>
          )}

          {/* Option 1: Magic Link Login */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#E8ECF3] uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-[#2E5AAC] rounded-none" />
              Option 1: Magic Link Login
            </h3>
            <p className="text-[#8DA0C4]">
              Receive a passwordless login link in your corporate inbox to attach this spec to your client account.
            </p>
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="executive@company.com"
                className="w-full bg-[#0B1E3D] border border-[#2E5AAC] px-3.5 py-2.5 text-xs text-[#E8ECF3] placeholder-[#8DA0C4] rounded-none focus:outline-none focus:border-2"
              />
              <button
                type="submit"
                disabled={loadingAction !== null}
                className="w-full h-11 bg-[#2E5AAC] hover:bg-[#1E3F7F] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors"
              >
                {loadingAction === "MAGIC" ? "Sending Magic Link..." : "SEND MAGIC LINK"}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-3 my-2 text-[#8DA0C4] text-[11px] font-mono uppercase">
            <div className="h-[1px] bg-[#2E5AAC]/40 flex-1" />
            <span>OR</span>
            <div className="h-[1px] bg-[#2E5AAC]/40 flex-1" />
          </div>

          {/* Option 2: Continue as Guest */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#E8ECF3] uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-[#85B7EB] rounded-none" />
              Option 2: Continue as Guest
            </h3>
            <p className="text-[#8DA0C4]">
              Submit your order specification as a guest. We&apos;ll email you order status updates and confirmation links.
            </p>
            <form onSubmit={handleGuestOrder} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="executive@company.com"
                className="w-full bg-[#0B1E3D] border border-[#2E5AAC] px-3.5 py-2.5 text-xs text-[#E8ECF3] placeholder-[#8DA0C4] rounded-none focus:outline-none focus:border-2"
              />
              <button
                type="submit"
                disabled={loadingAction !== null}
                className="w-full h-11 bg-transparent hover:bg-[#1A3A5C] text-[#2E5AAC] border-2 border-[#2E5AAC] disabled:opacity-50 text-xs font-bold uppercase tracking-wider rounded-none transition-colors"
              >
                {loadingAction === "GUEST" ? "Submitting Order..." : "SUBMIT ORDER AS GUEST"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2E5AAC] bg-[#0B1E3D] text-center text-xs text-[#8DA0C4]">
          Already have an account?{" "}
          <Link href="/portal" className="text-[#2E5AAC] hover:underline font-bold uppercase">
            SIGN IN →
          </Link>
        </div>
      </div>
    </div>
  );
}
