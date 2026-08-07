"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PortalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[B2B Customer Portal Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900/90 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
          <span className="material-symbols-outlined text-sm">badge</span>
          B2B Portal Exception
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100 font-serif">
            Portal Session Error
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            We encountered a problem loading your customer account portal or order ledger.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-slate-500 bg-slate-950/80 py-1 px-2.5 rounded border border-slate-800 inline-block">
              Ref Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Reload Portal
          </button>
          <Link
            href="/portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            Portal Overview
          </Link>
        </div>

        <p className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-4">
          Session expired? Try{" "}
          <Link href="/portal/login" className="text-amber-400 hover:underline">
            requesting a new magic link
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
