"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Satriano Global Layout Error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#0B121E] text-slate-100 font-sans px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-6 bg-slate-900/80 p-8 sm:p-12 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold tracking-widest uppercase">
            Critical Layout Failure
          </div>

          <h1 className="text-3xl font-extrabold text-slate-100 font-serif">
            Fatal Application Error
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            A critical system error occurred during layout initialization.
          </p>

          {error.digest && (
            <p className="text-xs font-mono text-slate-500 bg-slate-950/60 py-1.5 px-3 rounded-lg inline-block border border-slate-800">
              Digest: <span className="text-slate-300">{error.digest}</span>
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Restart Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
