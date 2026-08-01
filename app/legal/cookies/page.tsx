import { LegalPageShell, LegalSection } from "@/components/layout/LegalPageShell";

const SECTIONS: LegalSection[] = [
  {
    id: "definition",
    title: "1. What Are Cookies & Session Identifiers?",
    content: (
      <>
        <p>
          Cookies are small text files stored on your browser or device when accessing web applications. Satriano Atelier utilizes essential cookies and local storage tokens to maintain user sessions, remember active garment configurator parameters, and ensure secure authentication within our Client Portal.
        </p>
      </>
    ),
  },
  {
    id: "categories",
    title: "2. Categories of Cookies Utilized",
    content: (
      <div className="space-y-4">
        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
          <div className="font-bold text-[#0F172A] text-sm">
            A. Essential Technical Cookies (Strictly Necessary)
          </div>
          <p className="text-xs text-[#475569] mt-1">
            Required for portal navigation, CSRF token validation, and maintaining selected fabric &amp; sizing quantities while building custom proforma invoices.
          </p>
        </div>

        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
          <div className="font-bold text-[#0F172A] text-sm">
            B. Session &amp; Security Tokens
          </div>
          <p className="text-xs text-[#475569] mt-1">
            Used to authenticate corporate portal logins and protect internal Portal Console administrative state without storing sensitive credentials in cookies.
          </p>
        </div>

        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
          <div className="font-bold text-[#0F172A] text-sm">
            C. Performance &amp; Operational Analytics
          </div>
          <p className="text-xs text-[#475569] mt-1">
            Anonymous aggregated performance indicators to optimize page load speeds, PDF proforma rendering times, and server response times.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "third-party",
    title: "3. Third-Party Functional Cookies",
    content: (
      <>
        <p>
          When using our integrated checkout features, third-party functional cookies may be set by our enterprise payment partner, Stripe, solely to detect fraud and ensure PCI-compliant payment session security.
        </p>
      </>
    ),
  },
  {
    id: "managing-preferences",
    title: "4. Managing Cookie Preferences",
    content: (
      <>
        <p>
          You can configure your web browser settings to block or notify you about cookies.
        </p>
        <p>
          Please note that disabling essential technical cookies may impact the live pricing calculator and PDF proforma download features.
        </p>
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPageShell
      title="Cookie Policy"
      categoryBadge="Legal Document • Cookie Management"
      effectiveDate="July 31, 2026"
      activeSlug="cookies"
      sections={SECTIONS}
    />
  );
}
