import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "403 - Access Denied | Satriano Atelier",
  description: "Corporate privilege required to access this resource.",
};

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B121E] text-slate-100 px-4 py-16 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8 bg-slate-900/60 backdrop-blur-xl p-8 sm:p-12 rounded-2xl border border-slate-800 shadow-2xl">
        {/* Privilege Alert Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-widest uppercase">
          <span className="material-symbols-outlined text-sm">lock</span>
          Privilege Boundary Enforced
        </div>

        {/* 403 Heading */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 font-serif">
            403
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Access Denied
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Corporate administrative privileges or an active client session are required to view this protected resource.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            Log In to Console
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Return to Homepage
          </Link>
        </div>

        <p className="text-xs text-slate-500 border-t border-slate-800/80 pt-6">
          If you believe you should have access to this resource, please contact your Satriano Atelier administrator.
        </p>
      </div>
    </div>
  );
}
