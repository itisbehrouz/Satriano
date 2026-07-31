import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ConfiguratorClient } from "@/components/configurator/ConfiguratorClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface SubcategoryConfiguratorPageProps {
  params: Promise<{ subcategoryId: string }>;
}

export default async function SubcategoryConfiguratorPage({
  params,
}: SubcategoryConfiguratorPageProps) {
  const { subcategoryId } = await params;

  const subcategory = await prisma.subcategory.findFirst({
    where: {
      active: true,
      OR: [{ id: subcategoryId }, { slug: subcategoryId }],
    },
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
      fabrics: {
        where: { active: true },
        orderBy: { priceMinCents: "asc" },
      },
    },
  });

  if (!subcategory) {
    notFound();
  }

  // If subcategory has no custom fabrics assigned, fall back to active global fabrics
  let fabrics = subcategory.fabrics.map((f) => ({
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

  const formattedSizeSystems = subcategory.sizeSystems.map((ss) => ({
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
        subcategoryTitle={subcategory.name}
        subcategoryDescription={subcategory.description || ""}
        categoryTitle={subcategory.category.name}
        sizeSystems={formattedSizeSystems}
      />
      <SiteFooter />
    </>
  );
}
