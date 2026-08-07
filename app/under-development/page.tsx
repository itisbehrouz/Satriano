"use client";

import { useState } from "react";
import Link from "next/link";

export default function UnderDevelopmentPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/site-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid access password.");
      }

      // Successful unlock - reload page to enter site
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07090E] text-[#F3F4F6] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-[480px] bg-[#0E131F]/80 backdrop-blur-md border border-[#1E293B] p-8 sm:p-10 shadow-2xl relative z-10 space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 mb-2">
            <span className="font-serif text-amber-400 font-bold text-xl tracking-wider">SA</span>
          </div>

          <h1 className="text-xs font-mono font-bold tracking-[0.25em] text-amber-400/90 uppercase">
            Satriano Atelier
          </h1>

          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white font-serif">
            Digital Platform Under Development
          </h2>

          <p className="text-xs text-[#94A3B8] leading-relaxed max-w-xs mx-auto">
            Our digital platform is currently under development. Enter your access password below to preview the site.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Access Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-[#07090E]/90 border border-[#1E293B] text-white text-sm font-mono placeholder:text-[#475569] focus:outline-none focus:border-amber-500/60 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#64748B] hover:text-[#94A3B8] text-xs font-mono transition-colors"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-none animate-fadeIn">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {loading ? "Authenticating..." : "Enter Site →"}
          </button>
        </form>

        {/* Admin Access Footer Link */}
        <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-[#64748B] font-mono">
          <span>Are you an Administrator?</span>
          <Link
            href="/admin"
            className="text-amber-400/80 hover:text-amber-400 font-semibold transition-colors underline underline-offset-4"
          >
            Executive Console →
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-[11px] text-[#475569] font-mono tracking-widest uppercase relative z-10">
        © 2026 SATRIANO ATELIER • ALL RIGHTS RESERVED
      </div>
    </main>
  );
}
