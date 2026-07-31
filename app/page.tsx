import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const OPERATIONAL_STEPS = [
  {
    step: "01",
    icon: "straighten",
    title: "Select Product & Size Matrix",
    description:
      "Choose from predefined producible sizes (XS through 3XL) and fabric options. Live price ledger updates instantly.",
  },
  {
    step: "02",
    icon: "upload_file",
    title: "Upload Vector Logo & Placement",
    description:
      "Attach brand logo asset (SVG, AI, PDF) and specify left-chest or right-sleeve placement.",
  },
  {
    step: "03",
    icon: "description",
    title: "Instant Proforma Invoice",
    description:
      "System issues itemized Proforma PDF with 30-day validity, sent automatically to corporate email.",
  },
  {
    step: "04",
    icon: "credit_card",
    title: "Authorization & Card Payment",
    description:
      "Complete payment via card checkout. Order status transitions to In Production automatically.",
  },
];

const CAPABILITIES = [
  {
    icon: "straighten",
    title: "Fixed Size Lists",
    description:
      "Admin-managed producible sizing per product. No free-text measurement entry friction.",
  },
  {
    icon: "receipt_long",
    title: "Instant Proforma",
    description:
      "Automatic PDF generation and email dispatch for procurement audit compliance.",
  },
  {
    icon: "verified_user",
    title: "Transparent Ledger",
    description:
      "No hidden fees. Upfront itemized line-item and digitization setup cost breakdown.",
  },
  {
    icon: "local_shipping",
    title: "Global B2B Logistics",
    description:
      "Direct freight logistics integration for seamless delivery to your distribution centers.",
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
      <main className="flex-grow bg-[#F5F7FA] text-[#1A2233] font-sans">
        {/* Brand Intro Hero Banner */}
        <section className="w-full bg-[#0B1E3D] text-white py-16 md:py-24 border-b border-[#1E3A8A]">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2E5AAC]/30 border border-[#2E5AAC]/50 text-xs font-semibold uppercase tracking-widest text-[#93C5FD] rounded mb-6">
                <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
                European B2B Garment Atelier
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight font-sans">
                Your product. Your price. Your brand. We manufacture it.
              </h1>
              <p className="text-lg md:text-xl text-[#94A3B8] font-normal leading-relaxed mb-8">
                White-label bespoke apparel production for international corporate clients, premium retail brands, and uniform programs.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/konfigurator"
                  className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-sm font-semibold uppercase tracking-wider px-8 py-4 rounded transition-colors inline-flex items-center gap-2"
                >
                  Start Custom Order Spec →
                </Link>
                <Link
                  href="/categories"
                  className="border border-[#94A3B8]/40 hover:border-white text-white text-sm font-semibold uppercase tracking-wider px-8 py-4 rounded transition-colors inline-flex items-center gap-2"
                >
                  Explore Catalog
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Section */}
        <section className="w-full border-b border-[#E5E7EB]">
          <div className="max-w-[1440px] mx-auto px-8 py-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-[#1A2233]">
                  Manufacturing Catalog
                </h2>
                <p className="text-sm text-[#5B6B85] mt-1">
                  Grouped by product lines. Select any subcategory to configure your custom order specs.
                </p>
              </div>
              <Link
                href="/categories"
                className="text-xs font-semibold text-[#2E5AAC] hover:underline uppercase tracking-wider whitespace-nowrap"
              >
                View Full Interactive Catalog Page →
              </Link>
            </div>

            <div className="space-y-12">
              {categories.map((cat) => (
                <div key={cat.id} className="border-t border-[#E5E7EB] pt-8">
                  {/* Category Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                    <div>
                      <h3 className="text-xl font-semibold text-[#1A2233] flex items-center gap-3">
                        {cat.name}
                        <span className="text-xs font-medium text-[#5B6B85] bg-[#E5E7EB] px-2.5 py-0.5 rounded">
                          {cat.description}
                        </span>
                      </h3>
                    </div>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="text-xs font-semibold text-[#2E5AAC] hover:underline"
                    >
                      View All {cat.name} →
                    </Link>
                  </div>

                  {/* Subcategory Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-white border border-[#D1D5DB] rounded-lg overflow-hidden flex flex-col hover:border-[#2E5AAC] transition-all shadow-sm group"
                      >
                        <div className="h-52 w-full relative overflow-hidden bg-[#F5F7FA] border-b border-[#E5E7EB] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sub.imageUrl || cat.imageUrl || "/images/catalog/tops.png"}
                            alt={sub.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2.5 left-2.5 bg-[#0B1E3D]/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                            MOQ {sub.moq ?? 50}
                          </span>
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="text-base font-semibold text-[#1A2233] group-hover:text-[#2E5AAC] transition-colors">
                              {sub.name}
                            </h4>
                            <p className="text-xs text-[#5B6B85] mt-1 line-clamp-2 leading-relaxed">
                              {sub.description}
                            </p>
                          </div>
                          <div className="pt-3 mt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                            <span className="text-[11px] font-medium text-[#5B6B85]">
                              Lead: {sub.leadTimeDays ?? 14} Days
                            </span>
                            <Link
                              href={`/konfigurator/${sub.slug}`}
                              className="text-xs font-semibold text-[#2E5AAC] hover:underline"
                            >
                              Configure →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Operational Workflow */}
        <section
          id="workflow"
          className="w-full border-b border-[#E5E7EB] bg-white py-16 px-8"
        >
          <div className="max-w-[1376px] mx-auto">
            <div className="mb-10 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#1A2233]">
                4-Step Automated Procurement Workflow
              </h2>
              <p className="text-sm text-[#5B6B85] mt-1">
                From bespoke configuration to automated proforma delivery &amp; production dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {OPERATIONAL_STEPS.map((s) => (
                <div
                  key={s.step}
                  className="bg-[#F5F7FA] border border-[#D1D5DB] rounded-lg p-6 flex flex-col relative"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#2E5AAC] text-xs font-bold font-mono bg-[#E6F1FB] px-2 py-1 rounded">
                      STEP {s.step}
                    </span>
                    <span className="material-symbols-outlined text-[#2E5AAC] text-2xl">
                      {s.icon}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#1A2233] mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#5B6B85] leading-relaxed">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section className="w-full py-16 px-8 bg-[#F5F7FA]">
          <div className="max-w-[1376px] mx-auto">
            <div className="mb-10 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#1A2233]">
                Enterprise Supplier Infrastructure
              </h2>
              <p className="text-sm text-[#5B6B85] mt-1">
                Built for corporate apparel programs with strict compliance and quality audits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CAPABILITIES.map((cap) => (
                <div
                  key={cap.title}
                  className="bg-white border border-[#D1D5DB] rounded-lg p-6 flex flex-col gap-2 shadow-sm"
                >
                  <div className="w-10 h-10 rounded bg-[#E6F1FB] text-[#2E5AAC] flex items-center justify-center mb-1">
                    <span className="material-symbols-outlined text-xl">
                      {cap.icon}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#1A2233] mt-1">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-[#5B6B85] leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full bg-[#0B1E3D] text-white py-14 px-4 md:px-8 border-t border-[#132A52]">
          <div className="max-w-[1440px] mx-auto text-center flex flex-col items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#E8ECF3]">
              Ready to configure your B2B order?
            </h2>
            <p className="text-sm text-[#8DA0C4] max-w-lg">
              Transparent unit pricing, automated proforma generation, and direct atelier execution.
            </p>
            <Link
              href="/konfigurator"
              className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs uppercase font-medium tracking-wider px-8 py-3.5 rounded transition-colors mt-2 shadow-sm"
            >
              Start Order Configurator →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
