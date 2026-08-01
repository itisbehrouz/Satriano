import { LegalPageShell, LegalSection } from "@/components/layout/LegalPageShell";

const SECTIONS: LegalSection[] = [
  {
    id: "encryption",
    title: "1. Infrastructure Architecture & TLS 1.3 Encryption",
    content: (
      <>
        <p>
          Satriano Atelier operates on hardened Next.js enterprise infrastructure protected by TLS 1.3 encryption for all data in transit.
        </p>
        <p>
          Server endpoints utilize strict HTTPS enforcement, Content Security Policies (CSP), and automated DDoS mitigation.
        </p>
      </>
    ),
  },
  {
    id: "pci-dss",
    title: "2. PCI-DSS Level 1 Payment Processing",
    content: (
      <>
        <p>
          Payment transactions and card processing are handled via Stripe Checkout integration adhering to PCI-DSS Level 1 certification.
        </p>
        <p>
          Satriano Atelier servers never process, log, or store raw credit card numbers or sensitive CVV codes.
        </p>
      </>
    ),
  },
  {
    id: "database-safety",
    title: "3. Database Safety & Access Controls",
    content: (
      <>
        <p>
          Our relational database (PostgreSQL) enforces strict parameterized query execution via Prisma ORM v7, preventing SQL injection vulnerabilities.
        </p>
        <p>
          Internal Portal Console access is restricted by corporate authentication guards and role-based permissions.
        </p>
      </>
    ),
  },
  {
    id: "asset-isolation",
    title: "4. Vector Asset Isolation",
    content: (
      <>
        <p>
          Client vector brand assets uploaded to the portal are stored in isolated cloud buckets (Supabase Storage) utilizing signed token URLs and access control policies to prevent unauthorized public indexing or downloading.
        </p>
      </>
    ),
  },
  {
    id: "incident-response",
    title: "5. Incident Response & Vulnerability Reporting",
    content: (
      <>
        <p>
          Our technical security team conducts continuous system audits and vulnerability monitoring. Security advisories or vulnerability disclosure reports can be submitted directly to security@satrianoatelier.com.
        </p>
      </>
    ),
  },
];

export default function SecurityPage() {
  return (
    <LegalPageShell
      title="Security & Data Protection"
      categoryBadge="Technical Compliance • Platform Security"
      effectiveDate="July 31, 2026"
      activeSlug="security"
      sections={SECTIONS}
    />
  );
}
