import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function SupplyTermsPage() {
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
            <span className="font-semibold text-[#1A2233]">B2B Supply &amp; Manufacturing Terms</span>
          </nav>

          {/* Document Header Card */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-8 mb-8 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6] text-xs font-semibold uppercase tracking-wider rounded mb-3">
              Legal Document • Supply Agreement
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1A2233]">
              B2B Supply &amp; Manufacturing Terms
            </h1>
            <p className="text-xs md:text-sm text-[#5B6B85] mt-2">
              Effective Date: July 31, 2026 | European Production Execution &amp; Quality Commitments
            </p>
          </div>

          {/* Content Body */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-10 shadow-sm leading-relaxed text-sm space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                1. Manufacturing Lead Times &amp; Production Scheduling
              </h2>
              <p className="text-[#5B6B85]">
                Standard garment manufacturing lead times range from 14 to 21 business days following receipt of approved proforma payment and CAD sizing spec validation. Lead times for custom dye lots or specialized raw material sourcing will be specified in the proforma notes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                2. Fabric &amp; Raw Material Specifications
              </h2>
              <p className="text-[#5B6B85]">
                All textiles utilized by Satriano Atelier adhere to OEKO-TEX Standard 100 certifications. Minor shade variations (+/- 3%) between fabric dye lots are recognized industry standards and shall not be deemed manufacturing defects.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                3. Size Quantity Matrices &amp; Tolerance Limits
              </h2>
              <p className="text-[#5B6B85]">
                Garments are produced strictly according to the size quantity matrix (XS through 3XL) submitted via the online configurator. Dimensional tolerances adhere to standard ISO apparel manufacturing limits (+/- 1.5 cm for chest, waist, and length measurements).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                4. Shipping, Customs &amp; Freight Terms (Incoterms)
              </h2>
              <p className="text-[#5B6B85]">
                Unless otherwise specified in a custom wholesale contract, orders are shipped under Ex Works (EXW) or Delivered Duty Paid (DDP) terms as calculated during final proforma invoice checkout. Risk of loss transitions upon handover to designated freight carriers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                5. Claims &amp; Defective Item Return Protocol
              </h2>
              <p className="text-[#5B6B85]">
                Claims regarding manufacturing defects or shipping discrepancies must be documented with high-resolution photography and submitted to our quality engineering team within 7 business days of delivery. Approved claims will be remediated via priority reproduction or credit memo.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
