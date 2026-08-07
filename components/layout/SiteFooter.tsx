"use client";

import NextImage from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { OpenCookiePreferencesButton } from "@/components/layout/CookieConsentModal";
import { AtelierLogo } from "@/components/layout/AtelierLogo";

const NAVIGATION_LINKS = [
  { label: "Manufacturing Catalog", href: "/categories" },
  { label: "Garment Categories", href: "/categories" },
  { label: "Wholesale & Ready Stock", href: "/wholesale" },
  { label: "Client Portal Access", href: "/portal" },
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
  const pathname = usePathname();
  const { session, loading } = useCustomerSession();

  // Suppress footer completely on unauthenticated portal login gate (/portal)
  if (pathname === "/portal" && (!session?.authenticated && !loading)) {
    return null;
  }
  // While session is loading on /portal, also suppress footer
  if (pathname === "/portal" && loading) {
    return null;
  }

  return (
    <footer className="bg-[var(--color-bg)] text-[var(--color-text-primary)] w-full mt-auto font-sans transition-colors">
      {/* Main Multi-Column Footer Grid */}
      <div className="w-full px-4 md:px-8 py-12 max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand & Atelier Lockup (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link
              href="/"
              className="inline-block hover:opacity-95 transition-opacity self-start"
            >
              <AtelierLogo className="h-[45px] md:h-[48px] w-auto object-contain" />
            </Link>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-sm">
              Industrial B2B white-label garment manufacturing portal. Delivering transparent live pricing, precision sizing matrices, and European atelier execution for global apparel brands.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-[10px] uppercase font-semibold px-2.5 py-1 rounded">
                ISO Audited QC
              </span>
              <span className="bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-[10px] uppercase font-semibold px-2.5 py-1 rounded">
                European Atelier
              </span>
              <span className="bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-[10px] uppercase font-semibold px-2.5 py-1 rounded">
                Global B2B Shipping
              </span>
            </div>
          </div>

          {/* Column 2: Navigation Links (lg:col-span-2) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-[var(--color-gold)] mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs text-[var(--color-text-secondary)]">
              {NAVIGATION_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[var(--color-text-primary)] transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quality & Operations (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-[var(--color-gold)] mb-4">
              Quality &amp; Standards
            </h3>
            <ul className="space-y-2.5 text-xs text-[var(--color-text-secondary)]">
              {QUALITY_OPERATIONS_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[var(--color-text-primary)] transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Governance (lg:col-span-3) - Kanuni Konular */}
          <div className="lg:col-span-3">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-[var(--color-gold)] mb-4">
              Legal &amp; Compliance
            </h3>
            <ul className="space-y-2.5 text-xs text-[var(--color-text-secondary)]">
              {LEGAL_COMPLIANCE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[var(--color-text-primary)] transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal Notice */}
        <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center text-xs text-[var(--color-text-secondary)] gap-4">
          <div>
            © {new Date().getFullYear()} Satriano Atelier. All rights reserved. Industrial B2B Apparel Manufacturing.
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <OpenCookiePreferencesButton />
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[var(--color-status-success)]" />
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
