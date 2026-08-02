import { Suspense } from "react";
import { AdminWholesaleClient } from "@/components/admin/wholesale/AdminWholesaleClient";

export const metadata = {
  title: "Admin Wholesale Management — Satriano Atelier",
  description: "Manage ready-made wholesale pricing tiers, size inventory, price offers, and fulfillment orders.",
};

export default function AdminWholesalePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center font-sans transition-colors">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Loading Wholesale Manager...
            </p>
          </div>
        </div>
      }
    >
      <AdminWholesaleClient />
    </Suspense>
  );
}
