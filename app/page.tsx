import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MANUFACTURING_CATEGORIES } from "@/lib/categoriesData";

const OPERATIONAL_STEPS = [
  {
    step: "01",
    title: "Select Product & Size Matrix",
    description:
      "Choose from predefined producible sizes (XS through 3XL) and fabric options. Live price ledger updates instantly.",
  },
  {
    step: "02",
    title: "Upload Vector Branding",
    description:
      "Upload high-res .ai, .eps, or .svg logo assets and set placement (Left Chest or Right Sleeve).",
  },
  {
    step: "03",
    title: "Instant Proforma Invoice",
    description:
      "System generates an itemized PDF proforma with order ref number and sends confirmation email.",
  },
  {
    step: "04",
    title: "Stripe Checkout & Production",
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
    title: "Live Pricing Panel",
    description:
      "Itemized base price, fabric adjustments, and setup fees visible at every step before checkout.",
  },
  {
    icon: "verified",
    title: "Single-Needle Inspection",
    description:
      "Quality control protocol on all embroidery, seams, and finishing prior to dispatch.",
  },
  {
    icon: "public",
    title: "Global B2B Logistics",
    description:
      "Direct freight logistics integration for seamless delivery to your distribution centers.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[#F5F7FA] text-[#1A2233] font-sans">
        {/* Operations Hero Banner */}
        <section className="w-full px-4 md:px-8 py-10 md:py-16 max-w-container-max mx-auto border-b border-[#E5E7EB]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: B2B Supplier Pitch */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D1D5DB] text-[#2E5AAC] text-xs font-semibold uppercase tracking-wider rounded self-start">
                <span className="w-2 h-2 rounded-full bg-[#2E5AAC] inline-block" />
                B2B Made-to-Order Supplier Portal
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1A2233] leading-tight tracking-tight">
                Industrial White-Label Garment Manufacturing
              </h1>

              <p className="text-base md:text-lg text-[#5B6B85] max-w-2xl leading-relaxed">
                A reliable, no-nonsense portal for B2B apparel buyers. Configure materials, sizing matrices, and brand logos with live cost transparency and instant proforma generation.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-2">
                <Link
                  href="/konfigurator"
                  className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-sm font-medium px-6 py-3 rounded transition-colors inline-flex items-center gap-2"
                >
                  Configure Polo Shirt Order →
                </Link>
                <Link
                  href="/categories"
                  className="bg-white border border-[#D1D5DB] hover:bg-[#E5E7EB]/50 text-[#1A2233] text-sm font-medium px-6 py-3 rounded transition-colors"
                >
                  Browse All Categories &amp; Subcategories
                </Link>
              </div>

              {/* Operations Metrics Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t border-[#E5E7EB]">
                <div className="bg-white p-3 border border-[#E5E7EB] rounded">
                  <div className="text-xs text-[#5B6B85] uppercase tracking-wider font-medium">
                    MOQ Batch
                  </div>
                  <div className="text-xl font-semibold text-[#1A2233] mt-0.5 tabular-nums">
                    50 Units
                  </div>
                </div>
                <div className="bg-white p-3 border border-[#E5E7EB] rounded">
                  <div className="text-xs text-[#5B6B85] uppercase tracking-wider font-medium">
                    Lead Time
                  </div>
                  <div className="text-xl font-semibold text-[#2E5AAC] mt-0.5 tabular-nums">
                    14 Days
                  </div>
                </div>
                <div className="bg-white p-3 border border-[#E5E7EB] rounded">
                  <div className="text-xs text-[#5B6B85] uppercase tracking-wider font-medium">
                    Pricing
                  </div>
                  <div className="text-xl font-semibold text-[#0F6E56] mt-0.5 tabular-nums">
                    100% Live
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#D1D5DB] rounded-lg p-4 shadow-sm">
                <div className="relative aspect-[4/3] overflow-hidden rounded border border-[#E5E7EB] bg-[#F5F7FA]">
                  <img
                    className="w-full h-full object-cover"
                    alt="Atelier manufacturing line."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlBd-CWUQgSPzOsybEVdE1DvR4w4ZI2c2pukCqoclqK68buwsqkB2OLtukpunEw-w1NJBv0_zjaQncdoNtW0f0wRFYiKJpr_WYCRBy3WsGZsggpr_vHdIcDgUnxtciptjFMejOYOb4r6OyWa0TDPd14yG5Bq6LUbKMbOK_19zciAkfm1tM0csCh0FXkqScwCbhIxOvDkx8XHGATrcImgHnUpa4Tj2MONCwaI7AHJuNyu6NggtZkmDJVnlTVaZFfwnzOfR0GA2gb6KF"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-[#0B1E3D]/95 text-white p-3 rounded text-xs font-mono">
                    <div className="flex justify-between font-bold text-[#E8ECF3]">
                      <span>LIVE PRODUCT: POLO SHIRT</span>
                      <span className="text-[#DBB671]">MOQ: 50 PCS</span>
                    </div>
                    <div className="text-[#8DA0C4] text-[11px] mt-1">
                      Predefined Sizing (XS-3XL) • Vector Logo Embroidery
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Section (Grouped by Category Titles with Subcategory Cards) */}
        <section className="w-full px-4 md:px-8 py-12 max-w-container-max mx-auto border-b border-[#E5E7EB]">
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
            {MANUFACTURING_CATEGORIES.map((cat) => (
              <div key={cat.id} className="border-t border-[#E5E7EB] pt-8">
                {/* Category Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                  <div>
                    <h3 className="text-xl font-semibold text-[#1A2233] flex items-center gap-3">
                      {cat.title}
                      <span className="text-xs font-medium text-[#5B6B85] bg-[#E5E7EB] px-2.5 py-0.5 rounded">
                        {cat.subDescription}
                      </span>
                    </h3>
                  </div>
                  <Link
                    href={cat.href}
                    className="text-xs font-semibold text-[#2E5AAC] hover:underline"
                  >
                    View All {cat.title} →
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
                        <img
                          src={sub.image}
                          alt={sub.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-[#0B1E3D]/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                          MOQ {sub.moq}
                        </span>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-[#1A2233] group-hover:text-[#2E5AAC] transition-colors">
                            {sub.title}
                          </h4>
                          <p className="text-xs text-[#5B6B85] mt-1 line-clamp-2 leading-relaxed">
                            {sub.description}
                          </p>
                        </div>
                        <div className="pt-3 mt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                          <span className="text-[11px] font-medium text-[#5B6B85]">
                            {sub.fabricCount}
                          </span>
                          <Link
                            href="/konfigurator"
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
        </section>

        {/* Operational Workflow */}
        <section
          id="workflow"
          className="w-full bg-white py-12 px-4 md:px-8 border-b border-[#E5E7EB]"
        >
          <div className="max-w-container-max mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1A2233]">
                Operational Workflow
              </h2>
              <p className="text-sm text-[#5B6B85] mt-1">
                4-step automated proforma and manufacturing execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {OPERATIONAL_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="p-5 border border-[#D1D5DB] bg-[#F5F7FA] rounded-lg flex flex-col justify-between"
                >
                  <div className="text-xs font-bold text-[#2E5AAC] tracking-widest font-mono">
                    STEP {step.step}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-base font-semibold text-[#1A2233] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#5B6B85] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Standards Grid */}
        <section
          id="standards"
          className="w-full py-12 px-4 md:px-8 max-w-container-max mx-auto"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1A2233]">
              B2B Portal Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="p-5 bg-white border border-[#D1D5DB] rounded-lg flex flex-col gap-2"
              >
                <span className="material-symbols-outlined text-[#2E5AAC] text-2xl">
                  {cap.icon}
                </span>
                <h3 className="text-base font-semibold text-[#1A2233]">
                  {cap.title}
                </h3>
                <p className="text-xs text-[#5B6B85] leading-relaxed">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full bg-[#0B1E3D] text-white py-12 px-4 md:px-8 border-t border-[#132A52]">
          <div className="max-w-container-max mx-auto text-center flex flex-col items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#E8ECF3]">
              Ready to configure your B2B order?
            </h2>
            <p className="text-sm text-[#8DA0C4] max-w-lg">
              Transparent unit pricing, automated proforma generation, and direct atelier execution.
            </p>
            <Link
              href="/konfigurator"
              className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs uppercase font-medium tracking-wider px-8 py-3 rounded transition-colors mt-2"
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
