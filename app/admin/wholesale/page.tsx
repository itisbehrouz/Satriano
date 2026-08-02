import { prisma } from "@/lib/prisma";
import { AdminWholesaleClient } from "@/components/admin/wholesale/AdminWholesaleClient";

export const dynamic = "force-dynamic";

export default async function AdminWholesalePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      subcategory: {
        include: {
          category: true,
        },
      },
      fabrics: {
        where: { active: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return <AdminWholesaleClient initialProducts={products as any} />;
}
