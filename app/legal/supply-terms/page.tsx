import { LegalPageShell, LegalSection } from "@/components/layout/LegalPageShell";

const SECTIONS: LegalSection[] = [
  {
    id: "lead-times",
    title: "1. Manufacturing Lead Times & Production Scheduling",
    content: (
      <>
        <p>
          Standard garment manufacturing lead times range from 14 to 21 business days following receipt of approved proforma payment and CAD sizing spec validation.
        </p>
        <p>
          Lead times for custom dye lots or specialized raw material sourcing will be specified in the binding proforma notes.
        </p>
      </>
    ),
  },
  {
    id: "raw-materials",
    title: "2. Fabric & Raw Material Specifications",
    content: (
      <>
        <p>
          All textiles utilized by Satriano Atelier adhere to premium B2B fabric quality standards.
        </p>
        <p>
          Minor shade variations (+/- 3%) between fabric dye lots are recognized industry standards and shall not be deemed manufacturing defects.
        </p>
      </>
    ),
  },
  {
    id: "size-matrices",
    title: "3. Size Quantity Matrices & Tolerance Limits",
    content: (
      <>
        <p>
          Garments are produced strictly according to the size quantity matrix (XS through 3XL) submitted via the online configurator.
        </p>
        <p>
          Dimensional tolerances adhere to standard commercial apparel manufacturing limits (+/- 1.5 cm for chest, waist, and length measurements).
        </p>
      </>
    ),
  },
  {
    id: "incoterms",
    title: "4. Shipping, Customs & Freight Terms (Incoterms)",
    content: (
      <>
        <p>
          Unless otherwise specified in a custom wholesale contract, orders are shipped under Ex Works (EXW) or Delivered Duty Paid (DDP) terms as calculated during final proforma invoice checkout.
        </p>
        <p>
          Risk of loss transitions upon handover to designated freight logistics carriers.
        </p>
      </>
    ),
  },
  {
    id: "claims-protocol",
    title: "5. Claims & Defective Item Return Protocol",
    content: (
      <>
        <p>
          Claims regarding manufacturing defects or shipping discrepancies must be documented with high-resolution photography and submitted to our quality engineering team within 7 business days of delivery.
        </p>
        <p>
          Approved claims will be remediated via priority reproduction or credit memo.
        </p>
      </>
    ),
  },
];

export default function SupplyTermsPage() {
  return (
    <LegalPageShell
      title="B2B Supply & Manufacturing Terms"
      categoryBadge="Legal Document • Production Agreement"
      effectiveDate="July 31, 2026"
      activeSlug="supply-terms"
      sections={SECTIONS}
    />
  );
}
