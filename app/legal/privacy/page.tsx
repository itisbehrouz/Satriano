import { LegalPageShell, LegalSection } from "@/components/layout/LegalPageShell";

const SECTIONS: LegalSection[] = [
  {
    id: "data-collection",
    title: "1. Data Collection & Corporate Representative Profiles",
    content: (
      <>
        <p>
          Satriano Atelier collects corporate data necessary to process B2B garment manufacturing orders, including company legal names, tax registration details, corporate email addresses, phone numbers, and vector branding logo files.
        </p>
        <p>
          We operate exclusively in a B2B context and do not process consumer-facing personal retail data.
        </p>
      </>
    ),
  },
  {
    id: "use-of-information",
    title: "2. Use of Information & Proforma Generation",
    content: (
      <>
        <p>
          Information provided during configurator usage or portal account registration is used strictly for:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[#475569]">
          <li>Generating binding PDF proforma invoices and manufacturing specifications.</li>
          <li>Processing payments via encrypted Stripe B2B payment gateways.</li>
          <li>Coordinating freight shipping and customs documentation for order delivery.</li>
          <li>Communicating production status transitions (e.g. In Production, Dispatched).</li>
        </ul>
      </>
    ),
  },
  {
    id: "vector-protection",
    title: "3. Storage & Vector Artwork Protection",
    content: (
      <>
        <p>
          Uploaded vector logo files (.ai, .eps, .svg) are securely stored in isolated cloud buckets (Supabase Storage) with restricted access limited exclusively to production CAD engineers and embroidery specialists.
        </p>
        <p>
          We never share, license, or sell client artwork or proprietary sizing matrices to third parties.
        </p>
      </>
    ),
  },
  {
    id: "third-party-providers",
    title: "4. Third-Party Service Providers",
    content: (
      <>
        <p>
          We partner with vetted enterprise infrastructure providers including Stripe (Payment Processing), Supabase (Cloud Storage &amp; Database), and enterprise mail gateways (Nodemailer/Resend).
        </p>
        <p>
          All partners comply with GDPR, ISO 27001, and SOC-2 data safety standards.
        </p>
      </>
    ),
  },
  {
    id: "corporate-rights",
    title: "5. Data Erasure & Corporate Rights",
    content: (
      <>
        <p>
          Client organizations retain the right to request access to, correction of, or complete deletion of their corporate portal accounts and historical order metadata by submitting a written request to compliance@satrianoatelier.com.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      categoryBadge="Legal Document • GDPR & Data Protection"
      effectiveDate="July 31, 2026"
      activeSlug="privacy"
      sections={SECTIONS}
    />
  );
}
