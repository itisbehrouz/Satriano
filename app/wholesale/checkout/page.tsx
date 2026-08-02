import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WholesaleCheckoutClient } from "@/components/wholesale/WholesaleCheckoutClient";

export const dynamic = "force-dynamic";

export default function WholesaleCheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[var(--color-bg)] text-[var(--color-text-primary)] min-h-screen py-8 lg:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-[1440px] mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-6">
            <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/wholesale" className="hover:text-[var(--color-accent)] transition-colors">
              Wholesale Catalog
            </Link>
            <span>/</span>
            <span className="font-semibold text-[var(--color-text-primary)]">Cart Checkout</span>
          </nav>

          <WholesaleCheckoutClient />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
