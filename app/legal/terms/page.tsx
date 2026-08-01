import { LegalPageShell, LegalSection } from "@/components/layout/LegalPageShell";

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of B2B Commercial Terms",
    content: (
      <>
        <p>
          Welcome to Satriano Atelier. By accessing our B2B manufacturing portal, generating proforma invoices, or issuing production purchase orders, your organization (&quot;Client&quot; or &quot;Buyer&quot;) agrees to be bound by these Terms of Service.
        </p>
        <p>
          These terms govern all commercial transactions, custom garment specifications, CAD pattern submissions, and volume production executed by Satriano Atelier (&quot;Atelier&quot; or &quot;Supplier&quot;).
        </p>
      </>
    ),
  },
  {
    id: "moq-policies",
    title: "2. Minimum Order Quantities (MOQ) & Batch Policies",
    content: (
      <>
        <p>
          Satriano Atelier operates exclusively as a commercial B2B manufacturer. All producible garments are subject to a minimum order quantity (MOQ) of 50 units per style/colorway unless otherwise stipulated in a signed master supply agreement.
        </p>
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-2 text-xs">
          <p className="font-semibold text-[#0F172A]">MOQ Enforcement Standards:</p>
          <ul className="list-disc pl-5 space-y-1 text-[#475569]">
            <li>Single Fabric Line: 50 units minimum per style/color.</li>
            <li>Combined Multi-Fabric Orders: 100 units combined total across multi-fabric batches.</li>
            <li>Sample Development: Orders below MOQ incur sample digitization surcharges.</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "proforma-validity",
    title: "3. Instant Proforma Invoices & Price Ledger Validity",
    content: (
      <>
        <p>
          Proforma invoices generated through our online configurator represent itemized binding quotes valid for a period of 14 calendar days from issuance. Unit pricing includes base garment manufacturing, selected fabric surcharges, and vector logo placement.
        </p>
        <p>
          Final production scheduling commences upon confirmation of deposit or Stripe credit card authorization.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "4. Intellectual Property & Branding Assets",
    content: (
      <>
        <p>
          The Client warrants that all vector artwork (.ai, .eps, .svg), logo assets, and custom trademark embroidery instructions uploaded to the portal belong to the Client or are duly licensed.
        </p>
        <p>
          Satriano Atelier claims no ownership over Client branding trademarks or proprietary tech packs.
        </p>
      </>
    ),
  },
  {
    id: "quality-control",
    title: "5. Quality Control & Single-Needle Inspection",
    content: (
      <>
        <p>
          All manufactured apparel undergoes single-needle quality control inspection adhering to ISO 9001 standards prior to packaging.
        </p>
        <p>
          Discrepancies regarding sizing tolerances (+/- 1.5 cm) or stitch density must be reported in writing within 7 calendar days of delivery.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "6. Governing Law & Jurisdiction",
    content: (
      <>
        <p>
          These Terms of Service and any master supply agreements shall be governed by and construed in accordance with international commercial law and the jurisdiction of the registered Supplier atelier headquarters.
        </p>
      </>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      categoryBadge="Legal Document • Commercial Terms"
      effectiveDate="July 31, 2026"
      activeSlug="terms"
      sections={SECTIONS}
    />
  );
}
