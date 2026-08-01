import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HomeEstimatorPreview } from "@/components/HomeEstimatorPreview";
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

const CATEGORY_IMAGES: Record<string, string> = {
  tops: "/images/catalog/tops.png",
  bottoms: "/images/catalog/bottoms.png",
  "formal-wear": "/images/catalog/formal_wear.png",
  outerwear: "/images/catalog/outerwear.png",
  sportswear: "/images/catalog/sportswear.png",
  "underwear-loungewear": "/images/catalog/loungewear.png",
  accessories: "/images/catalog/accessories.png",
};

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
      <main className="flex-grow bg-[#F8FAFC] text-[#020617] font-sans antialiased">
        {/* B2B Top Capacity Banner */}
        <div className="w-full bg-[#071325] text-white border-b border-white/10 text-xs py-2.5 px-4">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-none bg-emerald-400 animate-pulse" />
              <span className="text-[#94A3B8]">
                EU Atelier Production Capacity: <strong className="text-white">Accepting Q3 B2B Specs</strong>
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[#93C5FD]">
              <span>⚡ 14-Day Delivery</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">🔒 European Quality Standard</span>
              <Link href="/portal" className="text-white font-medium hover:underline flex items-center gap-1">
                Partner Portal →
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="w-full bg-[#0B1E3D] text-white py-14 lg:py-24 border-b border-[#1E3A8A] relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Copy & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#2E5AAC]/30 border border-[#2E5AAC]/50 text-xs font-semibold uppercase tracking-widest text-[#93C5FD] rounded-none backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-none bg-[#60A5FA] animate-pulse" />
                  European B2B Garment Atelier
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] font-sans">
                  Your product.<br />
                  Your price.<br />
                  Your brand.<br />
                  We manufacture it.
                </h1>

                <p className="text-base md:text-xl text-[#94A3B8] font-normal leading-relaxed max-w-2xl">
                  White-label bespoke apparel production for international corporate clients, premium retail brands, and uniform programs.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/konfigurator"
                    className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider px-8 py-4 rounded-none transition-all shadow-lg shadow-[#2E5AAC]/30 hover:shadow-xl hover:shadow-[#2E5AAC]/40 inline-flex items-center gap-2 group"
                  >
                    <span>Start Custom Order Spec</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link
                    href="/categories"
                    className="border border-white/20 hover:border-white text-white hover:bg-white/5 text-xs font-semibold uppercase tracking-wider px-8 py-4 rounded-none transition-colors inline-flex items-center gap-2"
                  >
                    Explore Catalog
                  </Link>
                </div>

                {/* Trust Stats Bar */}
                <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border-l-2 border-[#2E5AAC] pl-3">
                    <p className="text-2xl font-bold font-mono text-white">50 MOQ</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Per Fabric Line</p>
                  </div>
                  <div className="border-l-2 border-[#2E5AAC] pl-3">
                    <p className="text-2xl font-bold font-mono text-white">14 Days</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Production Lead Time</p>
                  </div>
                  <div className="border-l-2 border-[#2E5AAC] pl-3">
                    <p className="text-2xl font-bold font-mono text-white">3 Tiers</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Fabric Price Range</p>
                  </div>
                  <div className="border-l-2 border-[#60A5FA] pl-3">
                    <p className="text-2xl font-bold font-mono text-[#60A5FA]">100% EU</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Certified Standard</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-none overflow-hidden border border-white/20 bg-[#152744] shadow-2xl shadow-black/50 group">
                  <div className="aspect-[4/3] w-full relative">
                    <Image
                      src="/hero-atelier.png"
                      alt="Satriano Atelier European B2B Garment Manufacturing"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 45vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3D] via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Overlay Spec Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-none bg-[#0B1E3D]/90 backdrop-blur-md border border-white/20 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-[#93C5FD] font-semibold">Craftsmanship & CAD Precision</p>
                      <p className="text-sm font-bold text-white mt-0.5">Bespoke Apparel & Corporate Uniforms</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-[#2E5AAC] text-white font-mono font-medium rounded-none shadow-sm">
                      EU Standard
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Highlights */}
        <section className="w-full py-16 px-6 lg:px-8 bg-white border-b border-[#E2E8F0]">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
                Enterprise Supplier Infrastructure
              </h2>
              <p className="text-sm text-[#475569] mt-2">
                Engineered for corporate apparel programs with strict compliance, transparent ledgers, and rapid production cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CAPABILITIES.map((cap) => (
                <div
                  key={cap.title}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] rounded-none p-6 transition-all hover:shadow-md group"
                >
                  <div className="w-12 h-12 rounded-none bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">{cap.icon}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A] mb-2">{cap.title}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{cap.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Interactive Ledger Estimator */}
        <section className="w-full py-16 px-6 lg:px-8 bg-[#F1F5F9] border-b border-[#E2E8F0]">
          <div className="max-w-[1440px] mx-auto">
            <HomeEstimatorPreview />
          </div>
        </section>

        {/* Manufacturing Catalog Section */}
        <section className="w-full py-16 px-6 lg:px-8 bg-white border-b border-[#E2E8F0]">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0369A1]">Catalog Portfolio</span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A] mt-1">
                  Manufacturing Product Lines
                </h2>
                <p className="text-sm text-[#475569] mt-1">
                  Select any category or subcategory line to launch custom order configuration.
                </p>
              </div>
              <Link
                href="/categories"
                className="text-xs font-semibold text-[#0369A1] hover:text-[#0284C7] uppercase tracking-wider inline-flex items-center gap-1"
              >
                <span>View All 65 Products</span>
                <span>→</span>
              </Link>
            </div>

            {/* Categories Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => {
                const coverImg = CATEGORY_IMAGES[cat.slug] || "/images/catalog/tops.png";
                return (
                  <div
                    key={cat.id}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] rounded-none overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group"
                  >
                    <div>
                      {/* Image Thumbnail Header */}
                      <div className="aspect-[16/9] w-full relative bg-[#0F172A] overflow-hidden">
                        <Image
                          src={coverImg}
                          alt={cat.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                          <h3 className="text-xl font-bold text-white tracking-tight">{cat.name}</h3>
                          <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-none bg-white/20 backdrop-blur-md text-white border border-white/30">
                            {cat.subcategories.length} Subcategories
                          </span>
                        </div>
                      </div>

                      {/* Subcategory Pills */}
                      <div className="p-5 space-y-4">
                        <p className="text-xs text-[#475569] line-clamp-2">{cat.description || "Bespoke B2B manufacturing product line."}</p>
                        
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">
                            Product Lines
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.subcategories.slice(0, 4).map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/categories/${cat.id}`}
                                className="text-xs px-2.5 py-1 bg-white border border-[#E2E8F0] hover:border-[#0F172A] hover:text-[#0F172A] text-[#334155] rounded-none transition-colors font-medium"
                              >
                                {sub.name}
                              </Link>
                            ))}
                            {cat.subcategories.length > 4 && (
                              <span className="text-xs px-2 py-1 text-[#64748B]">
                                +{cat.subcategories.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="p-5 pt-0">
                      <Link
                        href={`/categories/${cat.id}`}
                        className="w-full bg-white hover:bg-[#0F172A] hover:text-white text-[#0F172A] border border-[#0F172A] text-xs font-semibold uppercase tracking-wider py-3 rounded-none transition-all inline-flex items-center justify-center gap-2"
                      >
                        <span>Configure {cat.name} Specs</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4-Step Operational Pipeline */}
        <section className="w-full py-16 px-6 lg:px-8 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#0369A1]">Workflow Protocol</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A] mt-1">
                4-Step B2B Procurement Pipeline
              </h2>
              <p className="text-sm text-[#475569] mt-2">
                From custom specification input to automated proforma issuance and factory dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {OPERATIONAL_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="bg-white border border-[#E2E8F0] rounded-none p-6 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow border-t-2 border-t-[#0F172A]"
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold font-mono text-[#0369A1]">{step.step}</span>
                      <span className="w-10 h-10 rounded-none bg-[#F0F9FF] text-[#0369A1] flex items-center justify-center border border-[#E0F2FE]">
                        <span className="material-symbols-outlined text-xl">{step.icon}</span>
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A] mb-2">{step.title}</h3>
                    <p className="text-xs text-[#475569] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* B2B Procurement FAQ Section */}
        <section className="w-full py-16 px-6 lg:px-8 bg-white border-b border-[#E2E8F0]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#0369A1]">Procurement Assistance</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A] mt-1">
                Frequently Asked B2B Questions
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.q} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-none p-6 border-l-4 border-l-[#0F172A]">
                  <h3 className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
                    <span className="text-[#0369A1] font-bold">Q.</span>
                    {faq.q}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed mt-2 pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="w-full bg-[#0B1E3D] text-white py-16 px-6 lg:px-8 border-t border-[#1E3A8A]">
          <div className="max-w-[1440px] mx-auto text-center flex flex-col items-center gap-6">
            <span className="px-3.5 py-1.5 bg-[#2E5AAC]/30 border border-[#2E5AAC]/50 text-xs font-semibold uppercase tracking-widest text-[#93C5FD] rounded-none">
              Ready to Order
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-xl">
              Configure your bespoke white-label apparel order now.
            </h2>
            <p className="text-sm text-[#94A3B8] max-w-lg leading-relaxed">
              Transparent unit pricing ranges, automated proforma invoice generation, and direct atelier execution.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/konfigurator"
                className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs uppercase font-semibold tracking-wider px-8 py-4 rounded-none transition-colors shadow-lg shadow-[#2E5AAC]/30"
              >
                Start Order Configurator →
              </Link>
              <Link
                href="/portal"
                className="border border-white/20 hover:border-white text-white text-xs uppercase font-semibold tracking-wider px-8 py-4 rounded-none transition-colors"
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
