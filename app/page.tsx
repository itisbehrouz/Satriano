import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CategoryArcCarousel } from "@/components/home/CategoryArcCarousel";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


const FAQS = [
  {
    q: "What is the Minimum Order Quantity (MOQ)?",
    a: "Our standard MOQ starts at 50 units per fabric/colorway. For multi-fabric orders within the same product line, combined MOQ options are available.",
  },
  {
    q: "How does the Proforma Invoice and pricing work?",
    a: "You receive an instant price range based on your fabric selection. After submitting your spec and target budget, our atelier reviews feasibility and issues a binding itemized Proforma PDF with 30-day validity.",
  },
  {
    q: "Can we request custom fabric development or custom branding?",
    a: "Yes. All products support white-label customization including custom neck tags, care labels, left-chest/right-sleeve logo vector digitization, and custom fabric composition.",
  },
  {
    q: "What are the standard production lead times?",
    a: "Standard production lead time is 14 business days from payment confirmation. Expedited delivery can be arranged for recurring B2B corporate partners.",
  },
];


export default async function HomePage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    include: {
      subcategories: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans antialiased transition-colors">
        {/* Hero Section */}
        <section className="w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] py-14 lg:py-24 relative overflow-hidden transition-colors">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Copy & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] rounded-none">
                  <span className="w-2 h-2 rounded-none bg-[var(--color-accent)] animate-pulse" />
                  European B2B Garment Atelier
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-text-primary)] leading-[1.15] font-sans">
                  Your product.<br />
                  Your price.<br />
                  Your brand.<br />
                  <span className="text-[#291a2d] [html[data-theme='dark']_&]:text-[var(--color-gold)]">We manufacture it.</span>
                </h1>

                <p className="text-base md:text-xl text-[var(--color-text-secondary)] font-normal leading-relaxed max-w-2xl">
                  White-label bespoke apparel production for international corporate clients, premium retail brands, and uniform programs.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/categories"
                    className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold uppercase tracking-wider px-8 py-4 rounded-none transition-all inline-flex items-center gap-2 group shadow-sm"
                  >
                    <span>Start Custom Order Spec</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link
                    href="/categories"
                    className="border border-[var(--color-border)] hover:border-[var(--color-text-primary)] text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface)]/80 text-xs font-semibold uppercase tracking-wider px-8 py-4 rounded-none transition-colors inline-flex items-center gap-2"
                  >
                    Explore Catalog
                  </Link>
                </div>

                {/* Trust Stats Bar */}
                <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border-l-2 border-[var(--color-accent)] pl-3">
                    <p className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">50 MOQ</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Per Fabric Line</p>
                  </div>
                  <div className="border-l-2 border-[var(--color-accent)] pl-3">
                    <p className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">14 Days</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Production Lead Time</p>
                  </div>
                  <div className="border-l-2 border-[var(--color-accent)] pl-3">
                    <p className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">3 Tiers</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Fabric Price Range</p>
                  </div>
                  <div className="border-l-2 border-[var(--color-accent)] pl-3">
                    <p className="text-2xl font-bold font-mono text-[var(--color-accent)]">100% EU</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Certified Standard</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-none overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md group">
                  <div className="aspect-[4/3] w-full relative bg-[var(--color-bg)] overflow-hidden">
                    <Image
                      src="/hero-atelier.png"
                      alt="Satriano Atelier European B2B Garment Manufacturing"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 45vw"
                    />
                  </div>

                  {/* Hero Spec Badge Footer */}
                  <div className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-[var(--color-accent)] font-semibold">Craftsmanship & CAD Precision</p>
                      <p className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">Bespoke Apparel & Corporate Uniforms</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-[var(--color-accent)] text-white font-mono font-medium rounded-none">
                      EU Standard
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ProcessTimeline />

        {/* Manufacturing Catalog Section */}
        <CategoryArcCarousel categories={categories} />


        {/* B2B Procurement FAQ Section */}
        <section className="w-full py-16 px-6 lg:px-8 bg-[var(--color-bg)] transition-colors">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">Procurement Assistance</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mt-1">
                Frequently Asked B2B Questions
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.q} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                    <span className="text-[var(--color-accent)] font-bold">Q.</span>
                    {faq.q}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-2 pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] py-16 px-6 lg:px-8 transition-colors">
          <div className="max-w-[1440px] mx-auto text-center flex flex-col items-center gap-6">
            <span className="px-3.5 py-1.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] rounded-none">
              Ready to Order
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] max-w-xl">
              Configure your bespoke white-label apparel order now.
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
              Transparent unit pricing ranges, automated proforma invoice generation, and direct atelier execution.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/categories"
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs uppercase font-semibold tracking-wider px-8 py-4 rounded-none transition-colors"
              >
                Start Order Configurator →
              </Link>
              <Link
                href="/portal"
                className="border border-[var(--color-border)] hover:border-[var(--color-text-primary)] text-[var(--color-text-primary)] bg-[var(--color-surface)] text-xs uppercase font-semibold tracking-wider px-8 py-4 rounded-none transition-colors"
              >
                B2B Partner Portal
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
