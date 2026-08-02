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
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center font-sans transition-colors">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
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
