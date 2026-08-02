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
        <div className="min-h-screen bg-[#F7F8FA] p-8 flex items-center justify-center font-sans">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B7280]">
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
