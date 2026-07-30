import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ConfiguratorClient } from "@/components/configurator/ConfiguratorClient";
import { prisma } from "@/lib/prisma";

export default async function ConfiguratorPage() {
  const fabrics = await prisma.fabric.findMany({
    where: { active: true },
    orderBy: { unitPriceCents: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      unitPriceCents: true,
      setupFeeCents: true,
    },
  });

  return (
    <>
      <SiteHeader />
      <ConfiguratorClient fabrics={fabrics} />
      <SiteFooter />
    </>
  );
}
