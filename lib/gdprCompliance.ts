import { prisma } from "@/lib/prisma";

export async function exportCustomerData(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      orders: { include: { lines: true, payment: true } },
    },
  });

  return {
    company,
    exportDate: new Date(),
    format: "json",
  };
}

export async function deleteCustomerData(companyId: string) {
  await prisma.$transaction([
    prisma.order.deleteMany({ where: { companyId } }),
    prisma.company.delete({ where: { id: companyId } }),
  ]);
}
