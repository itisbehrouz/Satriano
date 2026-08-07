import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Satriano Atelier",
  description: "The requested page or resource could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B121E] text-slate-100 px-4 py-16 relative overflow-hidden">
      {/* Background ambient gold gradient glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8 bg-slate-900/60 backdrop-blur-xl p-8 sm:p-12 rounded-2xl border border-slate-800 shadow-2xl">
        {/* Atelier Logo / Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-widest uppercase">
          <span className="material-symbols-outlined text-sm">view_in_ar</span>
          Satriano Atelier
        </div>

        {/* Big 404 Heading */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 font-serif">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Page Not Found
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            The requested garment configuration, category, or B2B portal page could not be located or has moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Return to Homepage
          </Link>
          <Link
            href="/wholesale"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">storefront</span>
            Browse Catalog
          </Link>
        </div>

        {/* Quick Links Footer */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
          <Link href="/portal" className="hover:text-amber-400 transition-colors">
            B2B Client Portal
          </Link>
          <span className="text-slate-700">•</span>
          <Link href="/admin" className="hover:text-amber-400 transition-colors">
            Corporate Console
          </Link>
          <span className="text-slate-700">•</span>
          <Link href="/categories" className="hover:text-amber-400 transition-colors">
            Product Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
