"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function EmailVerifiedPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#F5F7FA] text-[#1A2233] py-16 px-4 md:px-8 flex flex-col justify-center items-center font-sans">
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-[#E6F1FB] text-[#2E5AAC] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#B3D6F6]">
              <span className="material-symbols-outlined text-3xl">mark_email_read</span>
            </div>

            <span className="bg-[#E6F1FB] text-[#185FA5] text-[10px] uppercase font-semibold px-3 py-1 rounded border border-[#B3D6F6]">
              Email Verified • Application Under Review
            </span>

            <h1 className="text-2xl font-semibold text-[#1A2233] mt-4">
              Corporate Email Confirmed
            </h1>

            <p className="text-xs text-[#5B6B85] mt-2 max-w-md mx-auto leading-relaxed">
              Thank you for verifying your corporate email address. Your B2B partner application is now active and under review by our account management team. We will notify you by email once your account is approved.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link
                href="/portal"
                className="min-h-[44px] inline-flex items-center justify-center bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded transition-colors"
              >
                Go to Portal Login
              </Link>
              <Link
                href="/"
                className="min-h-[44px] inline-flex items-center justify-center bg-[#F5F7FA] hover:bg-[#E6F1FB] text-[#1A2233] border border-[#D1D5DB] text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
