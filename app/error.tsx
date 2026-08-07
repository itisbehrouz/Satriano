"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Satriano Error Boundary caught exception]:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B121E] text-slate-100 px-4 py-16 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8 bg-slate-900/60 backdrop-blur-xl p-8 sm:p-12 rounded-2xl border border-slate-800 shadow-2xl">
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold tracking-widest uppercase">
          <span className="material-symbols-outlined text-sm">warning</span>
          Application Exception
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-serif">
            Something Went Wrong
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            An unhandled error occurred while processing your request in the Atelier application.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-500 bg-slate-950/50 py-1.5 px-3 rounded-lg inline-block border border-slate-800">
              Ref ID: <span className="text-slate-300">{error.digest}</span>
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Go to Homepage
          </Link>
        </div>

        {/* Support note */}
        <p className="text-xs text-slate-500 border-t border-slate-800/80 pt-6">
          If this problem persists, please contact B2B technical support at{" "}
          <a href="mailto:support@satriano.atelier" className="text-amber-400 hover:underline">
            support@satriano.atelier
          </a>
        </p>
      </div>
    </div>
  );
}
