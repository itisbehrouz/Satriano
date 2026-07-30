import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function TermsOfServicePage() {
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
            <span className="font-semibold text-[#1A2233]">Terms of Service</span>
          </nav>

          {/* Document Header Card */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-8 mb-8 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6] text-xs font-semibold uppercase tracking-wider rounded mb-3">
              Legal Document • B2B Terms
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1A2233]">
              Terms of Service
            </h1>
            <p className="text-xs md:text-sm text-[#5B6B85] mt-2">
              Effective Date: July 31, 2026 | Governing B2B Client Portal Operations &amp; Order Execution
            </p>
          </div>

          {/* Content Body */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-10 shadow-sm leading-relaxed text-sm space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                1. Acceptance of B2B Commercial Terms
              </h2>
              <p className="text-[#5B6B85]">
                Welcome to Satriano Atelier. By accessing our B2B manufacturing portal, generating proforma invoices, or issuing production purchase orders, your organization (&quot;Client&quot; or &quot;Buyer&quot;) agrees to be bound by these Terms of Service. These terms govern all commercial transactions, custom garment specifications, CAD pattern submissions, and volume production executed by Satriano Atelier (&quot;Atelier&quot; or &quot;Supplier&quot;).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                2. Minimum Order Quantities (MOQ) &amp; Batch Policies
              </h2>
              <p className="text-[#5B6B85]">
                Satriano Atelier operates exclusively as a commercial B2B manufacturer. All producible garments are subject to a minimum order quantity (MOQ) of 50 units per style/colorway unless otherwise stipulated in a signed master supply agreement. Orders below MOQ are subject to sample development surcharges.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                3. Instant Proforma Invoices &amp; Price Ledger Validity
              </h2>
              <p className="text-[#5B6B85]">
                Proforma invoices generated through our online configurator represent itemized binding quotes valid for a period of 14 calendar days from issuance. Unit pricing includes base garment manufacturing, selected fabric surcharges, and vector logo placement. Final production scheduling commences upon confirmation of deposit or Stripe credit card authorization.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                4. Intellectual Property &amp; Branding Assets
              </h2>
              <p className="text-[#5B6B85]">
                The Client warrants that all vector artwork (.ai, .eps, .svg), logo assets, and custom trademark embroidery instructions uploaded to the portal belong to the Client or are duly licensed. Satriano Atelier claims no ownership over Client branding trademarks.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                5. Quality Control &amp; Single-Needle Inspection
              </h2>
              <p className="text-[#5B6B85]">
                All manufactured apparel undergoes single-needle quality control inspection adhering to ISO 9001 standards prior to packaging. Discrepancies regarding sizing tolerances (+/- 1.5 cm) or stitch density must be reported in writing within 7 calendar days of delivery.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                6. Governing Law &amp; Jurisdiction
              </h2>
              <p className="text-[#5B6B85]">
                These Terms of Service and any master supply agreements shall be governed by and construed in accordance with international commercial law and the jurisdiction of the registered Supplier atelier headquarters.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
