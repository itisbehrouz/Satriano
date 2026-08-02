import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WholesaleCheckoutClient } from "@/components/wholesale/WholesaleCheckoutClient";

export const dynamic = "force-dynamic";

export default function WholesaleCheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[#F5F5F5] min-h-screen py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-[#5B6B85] mb-6">
            <Link href="/" className="hover:text-[#2E5AAC] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/wholesale" className="hover:text-[#2E5AAC] transition-colors">
              Wholesale Catalog
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#1A2233]">Cart Checkout</span>
          </nav>

          <WholesaleCheckoutClient />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
