import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WholesaleCatalogClient } from "@/components/WholesaleCatalogClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WholesalePage() {
  // Fetch all active categories
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  // Fetch all active fits
  const fits = await prisma.fit.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  // Fetch all active products with relations
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      subcategory: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      fits: {
        include: {
          fit: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      fabrics: {
        where: { active: true },
        select: {
          id: true,
          name: true,
          priceMinCents: true,
          priceMaxCents: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[#F5F5F5] text-[#1A2233] font-sans antialiased min-h-screen">
        {/* Page Header Section */}
        <header className="w-full bg-[#0B1E3D] text-white py-10 lg:py-14 border-b border-[#132A52] relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-[#8DA0C4] mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-[#5B6B85]">/</span>
              <span className="font-medium text-white">Wholesale Catalog</span>
            </nav>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-sans uppercase">
                WHOLESALE CATALOG
              </h1>
              <p className="text-sm sm:text-base text-[#8DA0C4] font-normal leading-relaxed max-w-3xl">
                Ready-made menswear with fixed pricing and immediate availability
              </p>
            </div>
          </div>
        </header>

        {/* Interactive Wholesale Catalog Content Section */}
        <section className="w-full py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1440px] mx-auto">
            <WholesaleCatalogClient
              products={products as any}
              categories={categories}
              fits={fits}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

