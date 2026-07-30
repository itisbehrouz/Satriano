import Link from "next/link";

const NAVIGATION_LINKS = [
  { label: "Manufacturing Configurator", href: "/konfigurator" },
  { label: "Garment Categories", href: "/categories" },
  { label: "Client Portal Access", href: "/portal" },
  { label: "Wholesale & Custom Lines", href: "/portal" },
];

const LEGAL_COMPLIANCE_LINKS = [
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "B2B Supply & Manufacturing Terms", href: "/legal/supply-terms" },
  { label: "Security & Data Protection", href: "/legal/security" },
  { label: "Cookie Policy", href: "/legal/cookies" },
  { label: "Supply Chain Transparency & Ethics", href: "/legal/ethics" },
];

const QUALITY_OPERATIONS_LINKS = [
  { label: "ISO 9001 Quality Assurance", href: "/legal/supply-terms#quality" },
  { label: "Fabric & Material Standards", href: "/legal/supply-terms#fabrics" },
  { label: "Global B2B Logistics Support", href: "/legal/supply-terms#logistics" },
  { label: "Proforma Invoice Verification", href: "/portal" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0B1E3D] text-[#E8ECF3] border-t border-[#132A52] w-full mt-auto font-sans">
      {/* Main Multi-Column Footer Grid */}
      <div className="w-full px-4 md:px-8 py-12 max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand & Atelier Lockup (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link
              href="/"
              className="inline-block hover:opacity-95 transition-opacity self-start"
            >
              <img
                src="/Satrinao.png"
                alt="Satriano Atelier"
                className="h-[45px] md:h-[48px] w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-[#8DA0C4] leading-relaxed max-w-sm">
              Industrial B2B white-label garment manufacturing portal. Delivering transparent live pricing, precision sizing matrices, and European atelier execution for global apparel brands.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-[#132A52] text-[#8DA0C4] border border-[#1F3A6B] text-[10px] uppercase font-semibold px-2.5 py-1 rounded">
                ISO Audited QC
              </span>
              <span className="bg-[#132A52] text-[#8DA0C4] border border-[#1F3A6B] text-[10px] uppercase font-semibold px-2.5 py-1 rounded">
                European Atelier
              </span>
              <span className="bg-[#132A52] text-[#8DA0C4] border border-[#1F3A6B] text-[10px] uppercase font-semibold px-2.5 py-1 rounded">
                Global B2B Shipping
              </span>
            </div>
          </div>

          {/* Column 2: Navigation Links (lg:col-span-2) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-[#DBB671] mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs text-[#8DA0C4]">
              {NAVIGATION_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#E8ECF3] transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quality & Operations (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-[#DBB671] mb-4">
              Quality &amp; Standards
            </h3>
            <ul className="space-y-2.5 text-xs text-[#8DA0C4]">
              {QUALITY_OPERATIONS_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#E8ECF3] transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Governance (lg:col-span-3) - Kanuni Konular */}
          <div className="lg:col-span-3">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-[#DBB671] mb-4">
              Legal &amp; Compliance
            </h3>
            <ul className="space-y-2.5 text-xs text-[#8DA0C4]">
              {LEGAL_COMPLIANCE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#E8ECF3] transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal Notice */}
        <div className="mt-12 pt-6 border-t border-[#132A52] flex flex-col md:flex-row justify-between items-center text-xs text-[#8DA0C4] gap-4">
          <div>
            © {new Date().getFullYear()} Satriano Atelier. All rights reserved. Industrial B2B Apparel Manufacturing.
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0F6E56]" />
              System Status: Operational
            </span>
            <span>Locale: en-US</span>
            <span>Currency: USD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
