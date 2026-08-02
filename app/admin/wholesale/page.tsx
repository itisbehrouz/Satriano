import { prisma } from "@/lib/prisma";
import { AdminWholesaleClient } from "@/components/admin/wholesale/AdminWholesaleClient";

export const dynamic = "force-dynamic";

export default async function AdminWholesalePage() {
  let products: any[] = [];

  try {
    products = await prisma.product.findMany({
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
  } catch (error) {
    console.error("Prisma fetch failed in AdminWholesalePage, using mock/offline mode:", error);
  }

  return <AdminWholesaleClient initialProducts={products as any} />;
}
