import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ConfiguratorClient } from "@/components/configurator/ConfiguratorClient";
import { prisma } from "@/lib/prisma";
import { getSubcategoryById } from "@/lib/categoriesData";

export const dynamic = "force-dynamic";

interface SubcategoryConfiguratorPageProps {
  params: Promise<{ subcategoryId: string }>;
}

export default async function SubcategoryConfiguratorPage({
  params,
}: SubcategoryConfiguratorPageProps) {
  const { subcategoryId } = await params;
  const subData = getSubcategoryById(subcategoryId);

  if (!subData) {
    notFound();
  }

  const fabrics = await prisma.fabric.findMany({
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

  return (
    <>
      <SiteHeader />
      <ConfiguratorClient
        fabrics={fabrics}
        subcategoryTitle={subData.subcategory.title}
        subcategoryDescription={subData.subcategory.description}
        categoryTitle={subData.category.title}
      />
      <SiteFooter />
    </>
  );
}
