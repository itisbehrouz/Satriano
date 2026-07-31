import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.categoryId;

  const category = await prisma.category.findFirst({
    where: {
      active: true,
      OR: [{ id: categoryId }, { slug: categoryId }],
    },
    include: {
      subcategories: {
        where: { active: true },
        include: {
          products: {
            where: { active: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const otherCategories = await prisma.category.findMany({
    where: { active: true, NOT: { id: category.id } },
    orderBy: { sortOrder: "asc" },
  });

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
            <span className="font-semibold text-[#1A2233]">{category.name}</span>
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
                  {category.name}
                </h1>
                <p className="text-sm md:text-base text-[#5B6B85] mt-2 max-w-2xl">
                  {category.description}. Select a specific garment product below to launch the order configurator.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 border-t lg:border-t-0 lg:border-l border-[#E5E7EB] pt-4 lg:pt-0 lg:pl-8">
                <div className="bg-[#F5F7FA] p-3 rounded border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#5B6B85] uppercase tracking-wider font-semibold">
                    Subcategories
                  </div>
                  <div className="text-lg font-bold text-[#1A2233] tabular-nums">
                    {category.subcategories.length} Lines
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

          {/* Subcategories & Nested Products Section */}
          <div className="space-y-12 mb-12">
            {category.subcategories.map((sub) => (
              <section key={sub.id} className="bg-white border border-[#D1D5DB] rounded-lg p-6">
                <div className="border-b border-[#E5E7EB] pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-[#1A2233]">{sub.name}</h2>
                    <span className="bg-[#E6F1FB] text-[#185FA5] text-xs font-semibold px-2.5 py-0.5 rounded">
                      {sub.products.length} Products
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6B85] mt-1">{sub.description}</p>
                </div>

                {/* Products Grid under Subcategory */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sub.products.map((prod) => (
                    <div
                      key={prod.id}
                      className="border border-[#D1D5DB] rounded-lg overflow-hidden flex flex-col hover:border-[#2E5AAC] transition-all bg-[#F5F7FA]/50 group"
                    >
                      <div className="h-48 w-full relative overflow-hidden bg-white border-b border-[#E5E7EB]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.imageUrl || sub.imageUrl || category.imageUrl || "/images/catalog/tops.png"}
                          alt={prod.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-[#0B1E3D]/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                          MOQ {prod.moq ?? 50} Units
                        </span>
                      </div>

                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-[#1A2233] mb-1 group-hover:text-[#2E5AAC] transition-colors">
                            {prod.name}
                          </h3>
                          <p className="text-xs text-[#5B6B85] leading-relaxed mb-3">
                            {prod.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#E5E7EB]">
                          <Link
                            href={`/konfigurator/${prod.slug}`}
                            className="w-full bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded transition-colors inline-flex items-center justify-center gap-2"
                          >
                            Configure {prod.name} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Other Categories Quick Switcher */}
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#1A2233] mb-4">
              Explore Other Manufacturing Categories
            </h3>
            <div className="flex flex-wrap gap-3">
              {otherCategories.map((otherCat) => (
                <Link
                  key={otherCat.id}
                  href={`/categories/${otherCat.slug}`}
                  className="bg-[#F5F7FA] hover:bg-[#E6F1FB] hover:text-[#2E5AAC] border border-[#D1D5DB] text-xs font-semibold px-4 py-2.5 rounded transition-colors"
                >
                  {otherCat.name} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
