import { Suspense } from "react";
import { CategoryInventoryClient } from "@/components/admin/wholesale/inventory/CategoryInventoryClient";

export const metadata = {
  title: "Inventory by Category — Satriano Atelier Admin",
  description: "Browse and manage ready-made product inventory organized by category and wholesale supplier.",
};

export default function CategoryInventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center font-sans transition-colors">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Loading Inventory by Category...
            </p>
          </div>
        </div>
      }
    >
      <CategoryInventoryClient />
    </Suspense>
  );
}
