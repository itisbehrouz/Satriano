import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WholesaleCatalogClient } from "@/components/WholesaleCatalogClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WholesalePage() {
  let categories: any[] = [];
  let fits: any[] = [];
  let products: any[] = [];

  try {
    // Fetch all active categories
    categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Fetch all active fits
    fits = await prisma.fit.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    // Fetch all active products with relations
    products = await prisma.product.findMany({
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
  } catch (error) {
    console.error("Prisma query error in WholesalePage, operating in offline/demo mode:", error);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans antialiased min-h-screen transition-colors">
        {/* Page Header Section */}
        <header className="w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] py-10 lg:py-14 relative overflow-hidden transition-colors">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-4">
              <Link href="/" className="hover:text-[var(--color-text-primary)] transition-colors">
                Home
              </Link>
              <span className="text-[var(--color-text-secondary)]">/</span>
              <span className="font-medium text-[var(--color-text-primary)]">Wholesale Catalog</span>
            </nav>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] font-sans uppercase">
                WHOLESALE CATALOG
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] font-normal leading-relaxed max-w-3xl">
                Ready-made menswear with fixed pricing and immediate availability
              </p>
            </div>
          </div>
        </header>

        {/* Interactive Wholesale Catalog Content Section */}
        <section className="w-full py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)] transition-colors">
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
