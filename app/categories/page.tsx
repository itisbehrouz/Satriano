import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MANUFACTURING_CATEGORIES } from "@/lib/categoriesData";

export default function CategoriesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[#F5F7FA] text-[#1A2233] font-sans">
        <div className="w-full px-4 md:px-8 py-10 md:py-14 max-w-container-max mx-auto">
          {/* Header Banner */}
          <div className="mb-12 bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6] text-xs font-semibold uppercase tracking-wider rounded mb-3">
                <span className="w-2 h-2 rounded-full bg-[#185FA5]" />
                B2B White-Label Garment Catalog
              </div>
              <h1 className="text-2xl md:text-4xl font-semibold text-[#1A2233]">
                Manufacturing Categories & Subcategories
              </h1>
              <p className="text-sm text-[#5B6B85] mt-1.5 max-w-2xl leading-relaxed">
                Explore our comprehensive garment production lines. Select any specific subcategory to configure your custom order specs.
              </p>
            </div>
            <Link
              href="/konfigurator"
              className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs uppercase font-semibold tracking-wider px-6 py-3.5 rounded transition-colors whitespace-nowrap"
            >
              Launch Configurator →
            </Link>
          </div>

          {/* Grouped Category Sections */}
          <div className="space-y-16">
            {MANUFACTURING_CATEGORIES.map((cat) => (
              <section key={cat.id} className="scroll-mt-24" id={cat.id}>
                {/* Category Section Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#1A2233] pb-4 mb-8 gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl md:text-3xl font-semibold text-[#1A2233]">
                        {cat.title}
                      </h2>
                      <span className="bg-[#E6F1FB] text-[#185FA5] text-xs font-semibold px-2.5 py-0.5 rounded">
                        {cat.subcategories.length} Subcategories
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#5B6B85] mt-1 font-medium">
                      {cat.subDescription}
                    </p>
                  </div>

                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#2E5AAC] hover:text-[#24498E] uppercase tracking-wider"
                  >
                    View All {cat.title} Specs →
                  </Link>
                </div>

                {/* Subcategory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cat.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white border border-[#D1D5DB] rounded-lg overflow-hidden flex flex-col hover:border-[#2E5AAC] transition-all shadow-sm group"
                    >
                      {/* Subcategory Photo Container */}
                      <div className="h-60 w-full relative overflow-hidden bg-[#F5F7FA] border-b border-[#E5E7EB] shrink-0">
                        <img
                          src={sub.image}
                          alt={sub.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-[#0B1E3D]/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                          MOQ {sub.moq}
                        </span>
                      </div>

                      {/* Subcategory Info */}
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-[#1A2233] mb-2 group-hover:text-[#2E5AAC] transition-colors">
                            {sub.title}
                          </h3>
                          <p className="text-xs text-[#5B6B85] leading-relaxed mb-4">
                            {sub.description}
                          </p>

                          <div className="flex flex-wrap gap-2 text-[11px] font-medium text-[#5B6B85] mb-4">
                            <span className="bg-[#F5F7FA] border border-[#E5E7EB] px-2.5 py-1 rounded">
                              {sub.fabricCount}
                            </span>
                            <span className="bg-[#F5F7FA] border border-[#E5E7EB] px-2.5 py-1 rounded">
                              Lead: {sub.leadTime}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#E5E7EB]">
                          <Link
                            href={`/konfigurator/${sub.id}`}
                            className="w-full bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded transition-colors inline-flex items-center justify-center gap-2"
                          >
                            Configure Spec →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
