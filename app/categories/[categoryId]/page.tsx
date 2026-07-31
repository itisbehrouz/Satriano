import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MANUFACTURING_CATEGORIES } from "@/lib/categoriesData";

interface PageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const category = MANUFACTURING_CATEGORIES.find(
    (c) => c.id === resolvedParams.categoryId
  );

  if (!category) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[#F5F7FA] text-[#1A2233] font-sans">
        <div className="w-full px-4 md:px-8 py-8 md:py-12 max-w-container-max mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#5B6B85] mb-6">
            <Link href="/" className="hover:text-[#2E5AAC] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-[#2E5AAC] transition-colors">
              Categories
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#1A2233]">{category.title}</span>
          </nav>

          {/* Category Banner Header */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6 md:p-8 mb-10">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6] text-xs font-semibold uppercase tracking-wider rounded mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#185FA5]" />
                  B2B Manufacturing Category
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold text-[#1A2233]">
                  {category.title}
                </h1>
                <p className="text-sm md:text-base text-[#5B6B85] mt-2 max-w-2xl">
                  {category.subDescription}. Customized directly in our European atelier to your exact brand specifications.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 border-t lg:border-t-0 lg:border-l border-[#E5E7EB] pt-4 lg:pt-0 lg:pl-8">
                <div className="bg-[#F5F7FA] p-3 rounded border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#5B6B85] uppercase tracking-wider font-semibold">
                    Minimum Order
                  </div>
                  <div className="text-lg font-bold text-[#1A2233] tabular-nums">
                    50 Units
                  </div>
                </div>
                <div className="bg-[#F5F7FA] p-3 rounded border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#5B6B85] uppercase tracking-wider font-semibold">
                    Production Lead
                  </div>
                  <div className="text-lg font-bold text-[#2E5AAC] tabular-nums">
                    14-21 Days
                  </div>
                </div>
                <div className="bg-[#F5F7FA] p-3 rounded border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#5B6B85] uppercase tracking-wider font-semibold">
                    Quality Audit
                  </div>
                  <div className="text-lg font-bold text-[#0F6E56] tabular-nums">
                    ISO Inspected
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subcategories Grid Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#1A2233]">
              Producible Garment Subcategories
            </h2>
            <p className="text-sm text-[#5B6B85] mt-1">
              Select a specific garment spec below to launch the order configurator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {category.subcategories.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-[#D1D5DB] rounded-lg overflow-hidden flex flex-col hover:border-[#2E5AAC] transition-all shadow-sm"
              >
                {/* Fixed Image Container */}
                <div className="h-60 w-full relative overflow-hidden bg-[#F5F7FA] border-b border-[#E5E7EB] shrink-0">
                  <img
                    src={sub.image}
                    alt={sub.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <span className="absolute top-3 left-3 bg-[#0B1E3D]/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                    MOQ {sub.moq}
                  </span>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-[#1A2233] mb-2">
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
                      Configure Order Spec →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Other Categories Quick Switcher */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#1A2233] mb-4">
              Explore Other Manufacturing Categories
            </h3>
            <div className="flex flex-wrap gap-3">
              {MANUFACTURING_CATEGORIES.filter((c) => c.id !== category.id).map(
                (otherCat) => (
                  <Link
                    key={otherCat.id}
                    href={otherCat.href}
                    className="bg-[#F5F7FA] hover:bg-[#E6F1FB] hover:text-[#2E5AAC] border border-[#D1D5DB] text-xs font-semibold px-4 py-2.5 rounded transition-colors"
                  >
                    {otherCat.title} →
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
