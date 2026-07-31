import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ConfiguratorClient } from "@/components/configurator/ConfiguratorClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ProductConfiguratorPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductConfiguratorPage({
  params,
}: ProductConfiguratorPageProps) {
  const { productId } = await params;

  // Search product by ID or Slug
  let product = await prisma.product.findFirst({
    where: {
      active: true,
      OR: [{ id: productId }, { slug: productId }],
    },
    include: {
      fabrics: {
        where: { active: true },
        orderBy: { priceMinCents: "asc" },
      },
      subcategory: {
        include: {
          category: true,
          sizeSystems: {
            include: {
              sizeSystem: {
                include: {
                  options: {
                    orderBy: { sortOrder: "asc" },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Backward compatibility fallback: if productId matches a subcategory slug, find its first active product
  if (!product) {
    const subcategory = await prisma.subcategory.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }] },
      include: {
        products: {
          where: { active: true },
          include: {
            fabrics: { where: { active: true }, orderBy: { priceMinCents: "asc" } },
          },
          take: 1,
        },
        category: true,
        sizeSystems: {
          include: {
            sizeSystem: {
              include: {
                options: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
      },
    });

    if (subcategory && subcategory.products[0]) {
      const firstProd = subcategory.products[0];
      product = {
        ...firstProd,
        subcategory: {
          id: subcategory.id,
          categoryId: subcategory.categoryId,
          name: subcategory.name,
          slug: subcategory.slug,
          description: subcategory.description,
          imageUrl: subcategory.imageUrl,
          leadTimeDays: subcategory.leadTimeDays,
          moq: subcategory.moq,
          active: subcategory.active,
          sortOrder: subcategory.sortOrder,
          createdAt: subcategory.createdAt,
          updatedAt: subcategory.updatedAt,
          category: subcategory.category,
          sizeSystems: subcategory.sizeSystems,
        },
      };
    }
  }

  if (!product) {
    notFound();
  }

  // Product-scoped fabrics, with global active fabric fallback if none specified
  let fabrics = product.fabrics.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    imageUrl: f.imageUrl,
    priceMinCents: f.priceMinCents,
    priceMaxCents: f.priceMaxCents,
    setupFeeCents: f.setupFeeCents,
  }));

  if (fabrics.length === 0) {
    const globalFabrics = await prisma.fabric.findMany({
      where: { active: true },
      orderBy: { priceMinCents: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        priceMinCents: true,
        priceMaxCents: true,
        setupFeeCents: true,
      },
    });
    fabrics = globalFabrics;
  }

  const formattedSizeSystems = product.subcategory.sizeSystems.map((ss) => ({
    id: ss.sizeSystem.id,
    name: ss.sizeSystem.name,
    region: ss.sizeSystem.region,
    options: ss.sizeSystem.options.map((o) => ({
      id: o.id,
      label: o.label,
      sortOrder: o.sortOrder,
    })),
  }));

  return (
    <>
      <SiteHeader />
      <ConfiguratorClient
        fabrics={fabrics}
        subcategoryTitle={product.name}
        subcategoryDescription={product.description || ""}
        categoryTitle={`${product.subcategory.category.name} • ${product.subcategory.name}`}
        sizeSystems={formattedSizeSystems}
      />
      <SiteFooter />
    </>
  );
}
