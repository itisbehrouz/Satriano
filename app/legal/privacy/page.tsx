import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PrivacyPolicyPage() {
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
            <span className="font-semibold text-[#1A2233]">Privacy Policy</span>
          </nav>

          {/* Document Header Card */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-8 mb-8 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6] text-xs font-semibold uppercase tracking-wider rounded mb-3">
              Legal Document • Data Protection
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1A2233]">
              Privacy &amp; Data Protection Policy
            </h1>
            <p className="text-xs md:text-sm text-[#5B6B85] mt-2">
              Effective Date: July 31, 2026 | GDPR &amp; International Corporate Privacy Compliance
            </p>
          </div>

          {/* Content Body */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-10 shadow-sm leading-relaxed text-sm space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                1. Data Collection &amp; Corporate Representative Profiles
              </h2>
              <p className="text-[#5B6B85]">
                Satriano Atelier collects corporate data necessary to process B2B garment manufacturing orders, including company legal names, tax registration details, corporate email addresses, phone numbers, and vector branding logo files. We do not process consumer-facing personal retail data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                2. Use of Information &amp; Proforma Generation
              </h2>
              <p className="text-[#5B6B85]">
                Information provided during configurator usage or portal account registration is used strictly for:
              </p>
              <ul className="list-disc pl-6 text-[#5B6B85] mt-2 space-y-1">
                <li>Generating binding PDF proforma invoices and manufacturing specifications.</li>
                <li>Processing payments via encrypted Stripe B2B payment gateways.</li>
                <li>Coordinating freight shipping and customs documentation for order delivery.</li>
                <li>Communicating production status transitions (e.g. In Production, Dispatched).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                3. Storage &amp; Vector Artwork Protection
              </h2>
              <p className="text-[#5B6B85]">
                Uploaded vector logo files (.ai, .eps, .svg) are securely stored in isolated cloud buckets (Supabase Storage) with restricted access limited exclusively to production CAD engineers and embroidery specialists. We never share, license, or sell client artwork or proprietary sizing matrices to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                4. Third-Party Service Providers
              </h2>
              <p className="text-[#5B6B85]">
                We partner with vetted enterprise infrastructure providers including Stripe (Payment Processing), Supabase (Cloud Storage &amp; DB), and enterprise mail gateways (Nodemailer/SMTP). All partners comply with GDPR, ISO 27001, and SOC-2 data safety standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                5. Data Erasure &amp; Corporate Rights
              </h2>
              <p className="text-[#5B6B85]">
                Client organizations retain the right to request access to, correction of, or complete deletion of their corporate portal accounts and historical order metadata by submitting a written request to compliance@satrianoatelier.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
