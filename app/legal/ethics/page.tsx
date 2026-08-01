import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function EthicsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[#F5F7FA] text-[#1A2233] font-sans py-10 md:py-14">
        <div className="w-full px-4 md:px-8 max-w-container-max mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#5B6B85] mb-6">
            <Link href="/" className="hover:text-[#2E5AAC] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Legal &amp; Compliance</span>
            <span>/</span>
            <span className="font-semibold text-[#1A2233]">Supply Chain Transparency &amp; Ethics</span>
          </nav>

          {/* Document Header Card */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-8 mb-8 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E1F5EE] text-[#0F6E56] border border-[#A6E5CE] text-xs font-semibold uppercase tracking-wider rounded mb-3">
              Corporate Governance • Ethical Sourcing
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1A2233]">
              Supply Chain Transparency &amp; Ethics
            </h1>
            <p className="text-xs md:text-sm text-[#5B6B85] mt-2">
              Effective Date: July 31, 2026 | European Labor Compliance &amp; Sustainable Sourcing
            </p>
          </div>

          {/* Content Body */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-10 shadow-sm leading-relaxed text-sm space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                1. Fair Labor &amp; Atelier Working Conditions
              </h2>
              <p className="text-[#5B6B85]">
                Satriano Atelier enforces strict fair labor standards across all production facilities. All tailor artisans, pattern cutters, and quality inspectors are employed under European labor laws guaranteeing fair living wages, regulated working hours, safe atelier ergonomics, and comprehensive healthcare coverage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                2. Sustainable Material Sourcing
              </h2>
              <p className="text-[#5B6B85]">
                Our raw material supply partners are audited to ensure high quality and environmental standards. We prioritize premium cotton, durable polyester blends, and traceable wools free from harmful AZO dyes, heavy metals, or toxic chemical finishes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                3. Zero Forced Labor Policy
              </h2>
              <p className="text-[#5B6B85]">
                Satriano Atelier maintains a zero-tolerance policy against forced labor, child labor, or human trafficking anywhere within our raw cotton ginning, yarn spinning, weaving, or garment assembly supply chain.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                4. Environmental &amp; Waste Management Commitments
              </h2>
              <p className="text-[#5B6B85]">
                Through CAD pattern optimization and precision cutting algorithms, we minimize fabric scrap waste by up to 18%. Textile offcuts are repurposed or recycled through certified textile recycling partners.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
