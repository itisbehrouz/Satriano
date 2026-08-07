"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const AntiGravityViz = dynamic(
  () => import("@/components/admin/AntiGravityViz").then((mod) => mod.AntiGravityViz),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-[#0b1329] border border-[#1e293b] flex items-center justify-center text-xs text-[#00f0ff] font-mono">
        <span className="w-4 h-4 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin mr-2" />
        Loading 3D Telemetry Canvas...
      </div>
    ),
  }
);

export default function AntiGravityArchitecturePage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Control Bar */}
        <div className="flex justify-between items-center border-b border-[#1e293b] pb-4">
          <div className="text-xs font-semibold text-[#00f0ff] uppercase tracking-wider">
            3D Telemetry Simulation
          </div>
          <Link
            href="/admin"
            className="border border-[#334155] bg-[#0f172a] hover:bg-[#1e293b] text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all text-white flex items-center gap-1.5 shadow-xs"
          >
            <span>← Back to Order Ledger</span>
          </Link>
        </div>

        {/* 3D Visualizer Component */}
        <AntiGravityViz />
      </div>
    </main>
  );
}
