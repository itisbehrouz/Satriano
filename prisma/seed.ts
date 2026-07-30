import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Prices and copy mirror configurator_polo_t_shirt/code.html exactly.
const fabrics = [
  {
    name: "Pique Cotton",
    description: "Classic, breathable texture.",
    unitPriceCents: 1850,
    setupFeeCents: 15000,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCmhYbm-gIPT_k9Qjebv_mtReGiPiDAbT1BMnuAgYfE4tpoT-Zk0xcnJHW9Wfs_zQcYLL8j-4bK9ciSPyWi0IyxYaNNCssM3m_maP9MJ63G_qtRP87AwNRD_J2QWMsg-vG2Es_yev3buMXSdVJIX0N9FKY0eod9VIHwkgOikTFLZCBvfn6ywcOc1IVQaSnprxAAGUtsrhROQZVvSET-510beZQPCcwDpjJd6zYF9mZWwpQknhIpQwnH7a1DMxh3hqlGznHfQzpU4QlQ",
  },
  {
    name: "Organic Cotton",
    description: "Sustainable, ultra-soft feel.",
    unitPriceCents: 2200,
    setupFeeCents: 15000,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDubx2-FHVu9nEgQy3bZ7IzHfNGWf7XCZhOuK8qBxr7GABMTBzz1Ra7Giswum9KQLMEdJQo8FOK9flTHV0UHyhegQz68uWB-Xyrso2UxibYGSQM5by4QGsg3ov-LhL98m6jyD0D7IQ4xpwldxlOFJjMqMvOZtk9VTntHUM3ykLsYSV9bR3V6ya70vNuk4joai9Jz_nKnNSWIgXc4Ypi4mOjqmKHxL1ySGUMdqXjwubpfwNoixBFa8d_LANdkQOzpgV39T38zcBSUtCB",
  },
  {
    name: "Performance Jersey",
    description: "Moisture-wicking, technical.",
    unitPriceCents: 2450,
    setupFeeCents: 15000,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCUhQPXJM2F1PUYsw-fyfcaNZ6yvQvYdsxWIxCWUgW5jsmKlxhL_l0AEtEAUsiOVirNGZbEdk-5epjdPsB6Js7rcGcj7-l65icZSl0jGcf_qnlf7yYwZDkp2un4YjAb3inKs1S6vlZZW9Fzk-Bci5c7T7aSbRXlM7h6tRtc5ZKsJoBo76Tn-rBbNtD_k83ROR1f4WiLz-xxCMY5eSlWf7gId6Ah-zCDEdkp3tV8UrSss_djyY1yQ0Jl5QkA4oHg0dNgiPYP1xMkW00a",
  },
];

async function main() {
  for (const fabric of fabrics) {
    await prisma.fabric.upsert({
      where: { name: fabric.name },
      update: fabric,
      create: fabric,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
