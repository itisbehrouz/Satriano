"use client";

import Link from "next/link";
import { AntiGravityViz } from "@/components/admin/AntiGravityViz";

export default function AntiGravityArchitecturePage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00f0ff] mb-1">
              <Link href="/admin" className="hover:underline">Admin Console</Link>
              <span>/</span>
              <span>Architecture Telemetry</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Anti-Gravity 3D Architecture Visualizer</span>
            </h1>
            <p className="text-xs text-[#94a3b8] mt-1">
              Real-time zero-gravity simulation demonstrating serverless data packet routing, anomaly repulsion, and dynamic failover resilience.
            </p>
          </div>

          <Link
            href="/admin"
            className="border border-[#334155] bg-[#0f172a] hover:bg-[#1e293b] text-xs font-semibold px-4 py-2.5 rounded transition-colors text-white self-start md:self-auto"
          >
            ← Back to Order Ledger
          </Link>
        </div>

        {/* 3D Visualizer Component */}
        <AntiGravityViz />
      </div>
    </main>
  );
}
