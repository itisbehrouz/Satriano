import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function SecurityPage() {
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
            <span className="font-semibold text-[#1A2233]">Security &amp; Data Protection</span>
          </nav>

          {/* Document Header Card */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-8 mb-8 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6] text-xs font-semibold uppercase tracking-wider rounded mb-3">
              Technical Compliance • Platform Security
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1A2233]">
              Security &amp; Data Protection
            </h1>
            <p className="text-xs md:text-sm text-[#5B6B85] mt-2">
              Effective Date: July 31, 2026 | Enterprise Security Controls &amp; Payment Encryption
            </p>
          </div>

          {/* Content Body */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-10 shadow-sm leading-relaxed text-sm space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                1. Infrastructure Architecture &amp; TLS 1.3 Encryption
              </h2>
              <p className="text-[#5B6B85]">
                Satriano Atelier operates on hardened Next.js enterprise infrastructure protected by TLS 1.3 encryption for all data in transit. Server endpoints utilize strict HTTPS enforcement, Content Security Policies (CSP), and automated DDoS mitigation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                2. PCI-DSS Level 1 Payment Processing
              </h2>
              <p className="text-[#5B6B85]">
                Payment transactions and card processing are handled via Stripe Checkout integration adhering to PCI-DSS Level 1 certification. Satriano Atelier servers never process, log, or store raw credit card numbers or sensitive CVV codes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                3. Database Safety &amp; Access Controls
              </h2>
              <p className="text-[#5B6B85]">
                Our relational database (PostgreSQL) enforces strict parameterized query execution via Prisma ORM v7, preventing SQL injection vulnerabilities. Internal Portal Console access is restricted by corporate authentication guards and role-based permissions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                4. Vector Asset Isolation
              </h2>
              <p className="text-[#5B6B85]">
                Client vector brand assets uploaded to the portal are stored in isolated cloud buckets (Supabase Storage) utilizing signed token URLs and access control policies to prevent unauthorized public indexing or downloading.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                5. Incident Response &amp; Reporting
              </h2>
              <p className="text-[#5B6B85]">
                Our technical security team conducts continuous system audits and vulnerability monitoring. Security advisories or vulnerability disclosure reports can be submitted directly to security@satrianoatelier.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
