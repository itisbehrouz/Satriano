import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function CookiePolicyPage() {
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
            <span className="font-semibold text-[#1A2233]">Cookie Policy</span>
          </nav>

          {/* Document Header Card */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-8 mb-8 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6] text-xs font-semibold uppercase tracking-wider rounded mb-3">
              Legal Document • Cookie Management
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1A2233]">
              Cookie Policy
            </h1>
            <p className="text-xs md:text-sm text-[#5B6B85] mt-2">
              Effective Date: July 31, 2026 | Transparent Web Technology &amp; Session Management
            </p>
          </div>

          {/* Content Body */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-10 shadow-sm leading-relaxed text-sm space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                1. What Are Cookies &amp; Session Identifiers?
              </h2>
              <p className="text-[#5B6B85]">
                Cookies are small text files stored on your browser or device when accessing web applications. Satriano Atelier utilizes essential cookies and local storage tokens to maintain user sessions, remember active garment configurator parameters, and ensure secure authentication within our Client Portal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                2. Categories of Cookies Utilized
              </h2>
              <div className="space-y-4 text-[#5B6B85]">
                <div className="bg-[#F5F7FA] p-4 rounded border border-[#E5E7EB]">
                  <div className="font-semibold text-[#1A2233] text-sm">
                    A. Essential Technical Cookies (Strictly Necessary)
                  </div>
                  <p className="text-xs mt-1">
                    Required for portal navigation, CSRF token validation, and maintaining selected fabric &amp; sizing quantities while building custom proforma invoices.
                  </p>
                </div>

                <div className="bg-[#F5F7FA] p-4 rounded border border-[#E5E7EB]">
                  <div className="font-semibold text-[#1A2233] text-sm">
                    B. Session &amp; Security Tokens
                  </div>
                  <p className="text-xs mt-1">
                    Used to authenticate corporate portal logins and protect internal Portal Console administrative state without storing sensitive credentials in cookies.
                  </p>
                </div>

                <div className="bg-[#F5F7FA] p-4 rounded border border-[#E5E7EB]">
                  <div className="font-semibold text-[#1A2233] text-sm">
                    C. Performance &amp; Operational Analytics
                  </div>
                  <p className="text-xs mt-1">
                    Anonymous aggregated performance indicators to optimize page load speeds, PDF proforma rendering times, and server response times.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                3. Third-Party Cookies
              </h2>
              <p className="text-[#5B6B85]">
                When using our integrated checkout features, third-party functional cookies may be set by our enterprise payment partner, Stripe, solely to detect fraud and ensure PCI-compliant payment session security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A2233] mb-3 pb-2 border-b border-[#E5E7EB]">
                4. Managing Cookie Preferences
              </h2>
              <p className="text-[#5B6B85]">
                You can configure your web browser settings to block or notify you about cookies. Please note that disabling essential cookies may impact the live pricing calculator and PDF proforma download features.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
