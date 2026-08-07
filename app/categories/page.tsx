import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CategoriesSearchFilter } from "@/components/CategoriesSearchFilter";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function CategoriesPage() {
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

  const totalSubcategories = categories.reduce((sum, c) => sum + c.subcategories.length, 0);

  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans antialiased transition-colors">
        {/* Executive Hero Section */}
        <section className="w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] py-14 lg:py-20 relative overflow-hidden transition-colors">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-8 relative z-10">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-6">
              <Link href="/" className="hover:text-[var(--color-text-primary)] transition-colors">
                Home
              </Link>
              <span className="text-[var(--color-text-secondary)]">/</span>
              <span className="font-medium text-[var(--color-text-primary)]">Manufacturing Catalog</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-4xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] rounded-none">
                  <span className="w-2 h-2 rounded-none bg-[var(--color-accent)] animate-pulse" />
                  B2B White-Label Portfolio
                </div>

                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] font-sans leading-[1.1]">
                  Garment Manufacturing Catalog &amp; Subcategories
                </h1>

                <p className="text-base md:text-lg text-[var(--color-text-secondary)] font-normal leading-relaxed max-w-2xl">
                  Explore our complete portfolio of producible apparel lines. Filter by style or search subcategories to launch instant custom order specifications.
                </p>

                {/* Portfolio Stats Strip */}
                <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--color-text-secondary)] pt-2">
                  <span>
                    <strong className="text-[var(--color-text-primary)] font-mono text-sm">{categories.length}</strong> Main Categories
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-[var(--color-text-primary)] font-mono text-sm">{totalSubcategories}</strong> Subcategories
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-[var(--color-accent)] font-mono text-sm">65</strong> Producible Products
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Categories Showcase Grid Section */}
        <section className="w-full py-12 lg:py-16 px-6 lg:px-8 bg-[var(--color-bg)] transition-colors">
          <div className="max-w-[1440px] mx-auto">
            <CategoriesSearchFilter categories={categories} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
