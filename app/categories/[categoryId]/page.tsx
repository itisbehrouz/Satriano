import Link from "next/link";
import Image from "next/image";
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

const CATEGORY_IMAGES: Record<string, string> = {
  tops: "/images/catalog/tops.png",
  bottoms: "/images/catalog/bottoms.png",
  "formal-wear": "/images/catalog/formal_wear.png",
  outerwear: "/images/catalog/outerwear.png",
  sportswear: "/images/catalog/sportswear.png",
  "underwear-loungewear": "/images/catalog/loungewear.png",
  accessories: "/images/catalog/accessories.png",
};

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

  const totalProducts = category.subcategories.reduce((acc, sub) => acc + sub.products.length, 0);

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
              <Link href="/categories" className="hover:text-[var(--color-text-primary)] transition-colors">
                Categories
              </Link>
              <span className="text-[var(--color-text-secondary)]">/</span>
              <span className="font-medium text-[var(--color-text-primary)]">{category.name}</span>
            </nav>

            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] rounded-none">
                  <span className="w-2 h-2 rounded-none bg-[var(--color-accent)] animate-pulse" />
                  B2B Garment Category
                </div>

                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] font-sans leading-[1.1]">
                  {category.name}
                </h1>

                <p className="text-base text-[var(--color-text-secondary)] font-normal leading-relaxed max-w-2xl">
                  {category.description || "High-precision white-label apparel manufacturing category."}
                </p>
              </div>

              {/* Stats Summary Box */}
              <div className="flex flex-wrap gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-none shrink-0">
                <div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Subcategories</div>
                  <div className="text-xl font-bold font-mono text-[var(--color-text-primary)]">{category.subcategories.length} Lines</div>
                </div>
                <div className="border-r border-[var(--color-border)]" />
                <div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Products</div>
                  <div className="text-xl font-bold font-mono text-[var(--color-accent)]">{totalProducts} Items</div>
                </div>
                <div className="border-r border-[var(--color-border)]" />
                <div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Lead Time</div>
                  <div className="text-xl font-bold font-mono text-[var(--color-status-success)]">14-21 Days</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subcategories & Products Grid */}
        <section className="w-full py-12 lg:py-16 px-6 lg:px-8 bg-[var(--color-bg)] transition-colors">
          <div className="max-w-[1440px] mx-auto space-y-12">
            {category.subcategories.map((sub) => (
              <div key={sub.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{sub.name}</h2>
                      <span className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-semibold px-2.5 py-0.5 rounded-none font-mono border border-[var(--color-accent)]/20">
                        {sub.products.length} Products
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{sub.description}</p>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sub.products.map((prod) => {
                    const coverImg =
                      prod.imageUrl || sub.imageUrl || category.imageUrl || CATEGORY_IMAGES[category.slug] || "/images/catalog/tops.png";

                    return (
                      <div
                        key={prod.id}
                        className="border border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-none overflow-hidden flex flex-col justify-between transition-all bg-[var(--color-bg)] group"
                      >
                        <div>
                          <div className="aspect-[16/10] w-full relative overflow-hidden bg-[var(--color-bg)]">
                            <Image
                              src={coverImg}
                              alt={prod.name}
                              fill
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            <span className="absolute top-2.5 left-2.5 bg-[var(--color-bg)]/90 text-[var(--color-text-primary)] text-[10px] font-mono font-medium px-2 py-0.5 rounded-none border border-[var(--color-border)]">
                              MOQ {prod.moq ?? 50} Units
                            </span>
                          </div>

                          <div className="p-4 space-y-2">
                            <h3 className="text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                              {prod.name}
                            </h3>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                              {prod.description || "White-label custom apparel spec."}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <Link
                            href={`/konfigurator/${prod.slug}`}
                            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-none transition-colors inline-flex items-center justify-center gap-2"
                          >
                            Configure {prod.name} →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Other Categories Switcher */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-8 space-y-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                Explore Other Manufacturing Categories
              </h3>
              <div className="flex flex-wrap gap-3">
                {otherCategories.map((otherCat) => (
                  <Link
                    key={otherCat.id}
                    href={`/categories/${otherCat.id}`}
                    className="bg-[var(--color-bg)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-semibold px-4 py-2.5 rounded-none transition-all"
                  >
                    {otherCat.name} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
