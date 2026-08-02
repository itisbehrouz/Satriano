import { Suspense } from "react";
import { SupplierClient } from "@/components/admin/wholesale/suppliers/SupplierClient";

export const metadata = {
  title: "Supplier Management — Satriano Atelier Admin",
  description: "Manage wholesale manufacturing partners, review applications, and verify new suppliers.",
};

export default function SupplierManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] p-8 flex items-center justify-center font-sans">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B7280]">
              Loading Supplier Management...
            </p>
          </div>
        </div>
      }
    >
      <SupplierClient />
    </Suspense>
  );
}
