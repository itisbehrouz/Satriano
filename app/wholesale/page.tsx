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
      <main className="flex-grow bg-[#F8FAFC] text-[#020617] font-sans antialiased">
        {/* Executive Dark Navy Hero Section */}
        <section className="w-full bg-[#0B1E3D] text-white py-14 lg:py-20 border-b border-[#1E3A8A] relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2E5AAC]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-6 lg:px-8 relative z-10">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-[#94A3B8] mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-[#64748B]">/</span>
              <span className="font-medium text-white">Wholesale Menswear Catalog</span>
            </nav>

            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#2E5AAC]/30 border border-[#2E5AAC]/50 text-xs font-semibold uppercase tracking-widest text-[#93C5FD] rounded-none backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-none bg-[#60A5FA] animate-pulse" />
                  B2B Apparel Sourcing &amp; Wholesale
                </div>

                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
                  Wholesale Menswear &amp; Custom Apparel Catalog
                </h1>

                <p className="text-base md:text-lg text-[#94A3B8] font-normal leading-relaxed max-w-2xl">
                  White-label bespoke menswear production for international corporate clients, premium retail brands, and uniform programs. Select any garment spec to configure volume proformas.
                </p>

                {/* Key Metrics Bar */}
                <div className="flex flex-wrap items-center gap-6 text-xs text-[#94A3B8] pt-2">
                  <span>
                    <strong className="text-white font-mono text-sm">{products.length}</strong> Producible Products
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-white font-mono text-sm">{fits.length}</strong> Menswear Fits
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-white font-mono text-sm">{categories.length}</strong> Categories
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-[#60A5FA] font-mono text-sm">50 Pcs</strong> Minimum MOQ
                  </span>
                </div>
              </div>

              {/* Action Link */}
              <div className="shrink-0">
                <Link
                  href="/konfigurator"
                  className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider px-8 py-4 rounded-none transition-all shadow-lg shadow-[#2E5AAC]/30 inline-flex items-center gap-2"
                >
                  <span>Start Custom Spec</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Wholesale Catalog Grid Section */}
        <section className="w-full py-12 lg:py-16 px-6 lg:px-8">
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
