import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function EthicsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans py-10 md:py-14 transition-colors">
        <div className="w-full px-4 md:px-8 max-w-container-max mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-6">
            <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Legal &amp; Compliance</span>
            <span>/</span>
            <span className="font-semibold text-[var(--color-text-primary)]">Supply Chain Transparency &amp; Ethics</span>
          </nav>

          {/* Document Header Card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 md:p-8 mb-8 shadow-sm transition-colors">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/30 text-xs font-semibold uppercase tracking-wider rounded-none mb-3">
              Corporate Governance • Ethical Sourcing
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)]">
              Supply Chain Transparency &amp; Ethics
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-2">
              Effective Date: July 31, 2026 | European Labor Compliance &amp; Sustainable Sourcing
            </p>
          </div>

          {/* Content Body */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 md:p-10 shadow-sm leading-relaxed text-sm space-y-8 transition-colors">
            <section>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3 pb-2 border-b border-[var(--color-border)]">
                1. Fair Labor &amp; Atelier Working Conditions
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Satriano Atelier enforces strict fair labor standards across all production facilities. All tailor artisans, pattern cutters, and quality inspectors are employed under European labor laws guaranteeing fair living wages, regulated working hours, safe atelier ergonomics, and comprehensive healthcare coverage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3 pb-2 border-b border-[var(--color-border)]">
                2. Sustainable Material Sourcing
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Our raw material supply partners are audited to ensure high quality and environmental standards. We prioritize premium cotton, durable polyester blends, and traceable wools free from harmful AZO dyes, heavy metals, or toxic chemical finishes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3 pb-2 border-b border-[var(--color-border)]">
                3. Zero Forced Labor Policy
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Satriano Atelier maintains a zero-tolerance policy against forced labor, child labor, or human trafficking anywhere within our raw cotton ginning, yarn spinning, weaving, or garment assembly supply chain.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3 pb-2 border-b border-[var(--color-border)]">
                4. Environmental &amp; Waste Management Commitments
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Through CAD pattern optimization and precision cutting algorithms, we minimize fabric scrap waste by up to 18%. Textile offcuts are repurposed or recycled through certified textile recycling partners.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
